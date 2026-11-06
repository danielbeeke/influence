import { Person } from "../types"

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

const PREFIXES = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
`

const idOf = (variable: string) => `REPLACE(STR(${variable}), "http://www.wikidata.org/entity/", "")`

export const isEntityId = (identifier: string) => /^Q\d+$/.test(identifier)

// Identifiers are interpolated into the queries, so only ever accept real entity ids.
const assertId = (identifier: string) => {
    if (!isEntityId(identifier)) throw new Error(`Not an entity id: ${identifier}`)
    return identifier
}

const escapeString = (value: string) => value.replace(/[\\"]/g, '\\$&').replace(/[\r\n]/g, ' ')

/**
 * Fetching & caching.
 *
 * - In memory, the promise is cached so the many re-renders asking for the same data share one request.
 * - Across visits, responses are kept in the Cache API: a cached answer is returned instantly and, when it
 *   is older than REVALIDATE_AFTER, refreshed in the background for next time (stale-while-revalidate).
 * - The SPARQL endpoint allows only a handful of parallel queries per client and answers 429 beyond that,
 *   so requests to it go through a small queue and a 429 is retried once.
 */
const CACHE_NAME = 'influence-data-v1'
const CACHED_AT_HEADER = 'x-cached-at'
const REVALIDATE_AFTER = 24 * 60 * 60 * 1000
const MAX_PARALLEL_QUERIES = 4

let runningQueries = 0
const queryQueue: Array<() => void> = []
const withQuerySlot = async <T>(task: () => Promise<T>): Promise<T> => {
    if (runningQueries >= MAX_PARALLEL_QUERIES) await new Promise<void>(resolve => queryQueue.push(resolve))
    runningQueries++
    try {
        return await task()
    }
    finally {
        runningQueries--
        queryQueue.shift()?.()
    }
}

const openCache = async () => {
    try {
        return 'caches' in globalThis ? await caches.open(CACHE_NAME) : null
    }
    catch {
        return null // e.g. private browsing or an insecure context
    }
}

const fetchFromNetwork = async (url: string, isQuery: boolean, retried = false): Promise<any> => {
    const response = await (isQuery
        ? withQuerySlot(() => fetch(url, { headers: { Accept: 'application/sparql-results+json' } }))
        : fetch(url))

    if (response.status === 429 && !retried) {
        const waitSeconds = Math.min(parseInt(response.headers.get('retry-after') ?? '') || 2, 10)
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000))
        return fetchFromNetwork(url, isQuery, true)
    }

    if (!response.ok) throw new Error(`Data request failed (${response.status}): ${(await response.text()).slice(0, 200)}`)

    const json = await response.json()

    const cache = await openCache()
    cache?.put(url, new Response(JSON.stringify(json), {
        headers: { 'content-type': 'application/json', [CACHED_AT_HEADER]: Date.now().toString() }
    })).catch(() => {})

    return json
}

const memoryCache = new Map<string, Promise<any>>()
const fetchJson = (url: string, isQuery = false): Promise<any> => {
    let promise = memoryCache.get(url)

    if (!promise) {
        promise = (async () => {
            const cached = await (await openCache())?.match(url).catch(() => undefined)

            if (cached) {
                const age = Date.now() - parseInt(cached.headers.get(CACHED_AT_HEADER) ?? '0')
                if (age > REVALIDATE_AFTER) fetchFromNetwork(url, isQuery).catch(() => {})
                return cached.json()
            }

            return fetchFromNetwork(url, isQuery)
        })()
        .catch(error => {
            memoryCache.delete(url)
            throw error
        })

        memoryCache.set(url, promise)
    }

    return promise
}

export const fetchQuery = (query: string) =>
    fetchJson(`${SPARQL_ENDPOINT}?query=${encodeURIComponent(PREFIXES + query)}&format=json`, true)

const processSparqlBindings = (sparqlResults: { head: { vars: Array<string> }, results: { bindings: Array<any> }}, singular = false, labelVar?: string) => {
    const variables = sparqlResults.head.vars

    const results = sparqlResults.results.bindings.map(binding => {
        const item: Record<string, any> = {}

        for (const variable of variables) {
            const key = variable === labelVar ? 'label' : variable
            item[key] = binding[variable]?.value
        }

        return item
    })

    return singular ? results[0] : results
}

/**
 * Queries
 */

const personQuery = (identifier: string, langCode: string) => `
    SELECT
      (${idOf('?person')} AS ?id)
      ?personLabel
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (SAMPLE(?abstract) AS ?abstract)
      (SAMPLE(?wikipediaTitle) AS ?wikipediaTitle)
      (SAMPLE(STR(YEAR(?birthDate))) AS ?birth)
      (SAMPLE(STR(YEAR(?deathDate))) AS ?death)
      (COUNT(DISTINCT ?influenced) AS ?influence)
      (SAMPLE(?isHuman) AS ?isPerson)
    WHERE {
      BIND(wd:${assertId(identifier)} AS ?person)
      BIND(EXISTS { ?person wdt:P31 wd:Q5 } AS ?isHuman)

      OPTIONAL { ?person schema:description ?abstract . FILTER(lang(?abstract) = '${langCode}') }
      OPTIONAL {
        ?article schema:about ?person ;
                 schema:isPartOf <https://${langCode}.wikipedia.org/> ;
                 schema:name ?wikipediaTitle .
      }
      OPTIONAL { ?person wdt:P569 ?birthDate }
      OPTIONAL { ?person wdt:P570 ?deathDate }
      OPTIONAL { ?person wdt:P18 ?imageUrl }
      OPTIONAL { ?person ^wdt:P737 ?influenced }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${langCode},en". }
    }
    GROUP BY ?person ?personLabel
`

// P737 = influenced by
const relationship = (referType: 'person' | 'others') =>
    referType === 'person'
        ? `^wdt:P737`   // people that this person influenced
        : `wdt:P737`    // people that influenced this person

const influenceQuery = (identifier: string, referType: 'person' | 'others', langCode: string) => `
    SELECT
      (${idOf('?person')} AS ?id)
      ?personLabel
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (SAMPLE(STR(YEAR(?birthDate))) AS ?birth)
      (SAMPLE(STR(YEAR(?deathDate))) AS ?death)
      (COUNT(DISTINCT ?influenced) AS ?influence)
    WHERE {
      { SELECT DISTINCT ?person { wd:${assertId(identifier)} ${relationship(referType)} ?person . } }

      OPTIONAL { ?person wdt:P18 ?imageUrl }
      OPTIONAL { ?person wdt:P569 ?birthDate }
      OPTIONAL { ?person wdt:P570 ?deathDate }
      OPTIONAL { ?person ^wdt:P737 ?influenced }

      FILTER isIRI(?person)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${langCode},en". }
    }
    GROUP BY ?person ?personLabel
    ORDER BY DESC(?influence)
    LIMIT 1000
`

/**
 * Works, interests and ideas of a person in one request instead of three.
 * P50 = author, P101 = field of work, P800 = notable work, P577 = publication date.
 *
 * The label lookup must stay inside each branch: shared after the UNION, the query planner starts
 * from "all labels" and the query times out.
 */
const itemListsQuery = (identifier: string, langCode: string) => {
    const label = `?item rdfs:label ?label . FILTER(lang(?label) = '${langCode}')`

    return `
    SELECT ?kind (${idOf('?item')} AS ?id) ?label (MIN(STR(?pubDate)) AS ?date)
    WHERE {
      { ?item wdt:P50 wd:${assertId(identifier)} . ${label} OPTIONAL { ?item wdt:P577 ?pubDate } BIND("works" AS ?kind) }
      UNION { wd:${identifier} wdt:P101 ?item . ${label} BIND("interests" AS ?kind) }
      UNION { wd:${identifier} wdt:P800 ?item . ${label} BIND("ideas" AS ?kind) }
    }
    GROUP BY ?kind ?item ?label
`
}

const searchQuery = (searchString: string) => `
    # Only humans, the most influential first.
    SELECT ?uri ?uriLabel (SAMPLE(STR(?imageUrl)) AS ?image) (MIN(?num) AS ?ordinal) (COUNT(DISTINCT ?influenced) AS ?influence) WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "${escapeString(searchString)}" .
        bd:serviceParam mwapi:language "en" .
        bd:serviceParam wikibase:limit 100 .
        ?uri wikibase:apiOutputItem mwapi:item .
        ?num wikibase:apiOrdinal true .
      }
      ?uri wdt:P31 wd:Q5 .
      OPTIONAL { ?uri wdt:P18 ?imageUrl }
      OPTIONAL { ?uri ^wdt:P737 ?influenced }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    GROUP BY ?uri ?uriLabel
    ORDER BY DESC(?influence) ASC(?ordinal)
    LIMIT 20
`

/**
 * Public API
 */

/**
 * URLs and bookmarks may contain English Wikipedia titles (e.g. "Søren_Kierkegaard") instead of entity ids.
 * Resolve those via the Wikipedia API, which also follows renamed/redirected pages. Unknown titles are dropped.
 */
export const resolveTitleIds = async (identifiers: Array<string>): Promise<Array<string>> => {
    const titles = identifiers.filter(identifier => !isEntityId(identifier))
    if (!titles.length) return identifiers

    const json = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&origin=*&titles=${encodeURIComponent(titles.join('|'))}`)

    // Map every requested title through normalization + redirects to its final page title.
    const follow = (title: string) => {
        for (const step of ['normalized', 'redirects']) {
            const hit = (json?.query?.[step] ?? []).find((item: { from: string }) => item.from === title)
            if (hit) title = hit.to
        }
        return title
    }
    const pages = Object.values(json?.query?.pages ?? {}) as Array<{ title: string, pageprops?: { wikibase_item?: string } }>

    return identifiers
        .map(identifier => {
            if (isEntityId(identifier)) return identifier
            const title = follow(identifier.replace(/_/g, ' '))
            return pages.find(page => page.title === title)?.pageprops?.wikibase_item
        })
        .filter(Boolean) as Array<string>
}

const getWikipediaExtract = async (title: string, langCode: string): Promise<string> => {
    const json = await fetchJson(`https://${langCode}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&origin=*&titles=${encodeURIComponent(title)}`)
    const [page] = Object.values(json?.query?.pages ?? {}) as Array<{ extract?: string }>
    return page?.extract ?? ''
}

export const getPerson = async (identifier: string, langCode = 'en', fullAbstract = false): Promise<Person> => {
    const response = await fetchQuery(personQuery(identifier, langCode))
    const person = processSparqlBindings(response, true, 'personLabel') as unknown as Person

    if (fullAbstract && person.wikipediaTitle) {
        const extract = await getWikipediaExtract(person.wikipediaTitle, langCode).catch(() => '')
        if (extract) person.abstract = extract
    }

    return person
}

export const getInfluenced = async (identifier: string, langCode = 'en') => {
    const response = await fetchQuery(influenceQuery(identifier, 'person', langCode))
    return processSparqlBindings(response, false, 'personLabel')
}

export const getInfluencedBy = async (identifier: string, langCode = 'en') => {
    const response = await fetchQuery(influenceQuery(identifier, 'others', langCode))
    return processSparqlBindings(response, false, 'personLabel')
}

type ListItem = { id: string, label: string, date?: string }

// The three list getters share one (cached) request.
const getItemLists = async (identifier: string, langCode: string) => {
    const response = await fetchQuery(itemListsQuery(identifier, langCode))
    const lists: Record<'works' | 'interests' | 'ideas', Array<ListItem>> = { works: [], interests: [], ideas: [] }
    for (const { kind, ...item } of processSparqlBindings(response) as Array<ListItem & { kind: keyof typeof lists }>) {
        lists[kind]?.push(item)
    }
    return lists
}

export const getWorks = async (identifier: string, langCode = 'en') => (await getItemLists(identifier, langCode)).works
export const getInterests = async (identifier: string, langCode = 'en') => (await getItemLists(identifier, langCode)).interests
export const getNotableIdeas = async (identifier: string, langCode = 'en') => (await getItemLists(identifier, langCode)).ideas

export const doSearch = async (searchString: string): Promise<Array<any>> => {
    const response = await fetchQuery(searchQuery(searchString))
    return processSparqlBindings(response, false, 'uriLabel') as Array<any>
}

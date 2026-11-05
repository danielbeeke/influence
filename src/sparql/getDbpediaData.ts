import { Person } from "../types"

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql'

export const isWikidataId = (identifier: string) => /^Q\d+$/.test(identifier)

// Identifiers are interpolated into the queries, so only ever accept real Q-ids.
const assertId = (identifier: string) => {
    if (!isWikidataId(identifier)) throw new Error(`Not a Wikidata id: ${identifier}`)
    return identifier
}

const escapeString = (value: string) => value.replace(/[\\"]/g, '\\$&').replace(/[\r\n]/g, ' ')

/**
 * Old URLs and bookmarks use DBpedia resource names (= English Wikipedia titles, e.g. "Søren_Kierkegaard").
 * Resolve those to Wikidata Q-ids via the Wikipedia API, which also follows renamed/redirected pages.
 */
export const resolveLegacyIds = async (identifiers: Array<string>): Promise<Array<string>> => {
    const legacy = identifiers.filter(identifier => !isWikidataId(identifier))
    if (!legacy.length) return identifiers

    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&origin=*&titles=${encodeURIComponent(legacy.join('|'))}`
    const json = await fetch(url).then(response => response.json())

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
            if (isWikidataId(identifier)) return identifier
            const title = follow(identifier.replace(/_/g, ' '))
            return pages.find(page => page.title === title)?.pageprops?.wikibase_item
        })
        .filter(Boolean) as Array<string>
}

const relationship = (referType: 'person' | 'others') =>
    referType === 'person'
        ? `^wdt:P737`   // people that this person influenced
        : `wdt:P737`    // people that influenced this person

const personQuery = (identifier: string, langCode: string) => `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>

    SELECT
      (REPLACE(STR(?person), "http://www.wikidata.org/entity/", "") AS ?id)
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

const listQuery = (identifier: string, langCode: string, predicate: string) => `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>

    SELECT DISTINCT
      (SAMPLE(?abstractVal) AS ?abstract)
      ?label
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (REPLACE(STR(?item), "http://www.wikidata.org/entity/", "") AS ?id)
    WHERE {
      wd:${assertId(identifier)} ${predicate} ?item .
      ?item rdfs:label ?label .
      OPTIONAL { ?item schema:description ?abstractVal . FILTER(lang(?abstractVal) = '${langCode}') }
      OPTIONAL { ?item wdt:P18 ?imageUrl }
      FILTER(lang(?label) = '${langCode}')
    }
    GROUP BY ?item ?label
`

// wdt:P101 = field of work
const interestsQuery = (identifier: string, langCode: string) => listQuery(identifier, langCode, 'wdt:P101')
// wdt:P800 = notable work
const notableIdeaQuery = (identifier: string, langCode: string) => listQuery(identifier, langCode, 'wdt:P800')

const worksQuery = (identifier: string, langCode: string) => `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX schema: <http://schema.org/>

    SELECT DISTINCT
      (SAMPLE(?abstractVal) AS ?abstract)
      ?label
      (MIN(STR(?pubDate)) AS ?date)
      (SAMPLE(STR(?imageUrl)) AS ?image)
      (REPLACE(STR(?work), "http://www.wikidata.org/entity/", "") AS ?id)
    WHERE {
      ?work wdt:P50 wd:${assertId(identifier)} .
      ?work rdfs:label ?label .
      OPTIONAL { ?work schema:description ?abstractVal . FILTER(lang(?abstractVal) = '${langCode}') }
      OPTIONAL { ?work wdt:P577 ?pubDate }
      OPTIONAL { ?work wdt:P18 ?imageUrl }
      FILTER(lang(?label) = '${langCode}')
    }
    GROUP BY ?work ?label
    ORDER BY ASC(?date)
`

const searchQuery = (searchString: string) => `
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>

    # Like the old DBpedia search: only humans, the most influential first.
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

const influenceQuery = (identifier: string, referType: 'person' | 'others', langCode: string) => `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>

    SELECT
      (REPLACE(STR(?person), "http://www.wikidata.org/entity/", "") AS ?id)
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

// Cache the promise (not the result) so the many re-renders that ask for the same data
// while a request is in flight share it, instead of hammering the (rate limited) endpoint.
const staticCache = new Map<string, Promise<any>>()
export const fetchQuery = (query: string) => {
    let promise = staticCache.get(query)

    if (!promise) {
        promise = fetch(`${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`, {
            headers: { Accept: 'application/sparql-results+json' }
        })
        .then(async response => {
            if (!response.ok) throw new Error(`Wikidata query failed (${response.status}): ${(await response.text()).slice(0, 200)}`)
            return response.json()
        })
        .catch(error => {
            staticCache.delete(query)
            throw error
        })

        staticCache.set(query, promise)
    }

    return promise
}

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

const extractCache = new Map()
const getWikipediaExtract = async (title: string, langCode: string): Promise<string> => {
    const cacheKey = `${langCode}:${title}`
    if (extractCache.has(cacheKey)) return extractCache.get(cacheKey)

    const url = `https://${langCode}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&origin=*&titles=${encodeURIComponent(title)}`
    const response = await fetch(url)
    const json = await response.json()
    const [page] = Object.values(json?.query?.pages ?? {}) as Array<{ extract?: string }>
    const extract = page?.extract ?? ''

    extractCache.set(cacheKey, extract)
    return extract
}

export const getPerson = async (identifier: string, langCode = 'en', fullAbstract = false): Promise<Person> => {
    const response = await fetchQuery(personQuery(identifier, langCode))
    const person = processSparqlBindings(response, true, 'personLabel') as unknown as Person

    if (fullAbstract && person.wikipediaTitle) {
        const extract = await getWikipediaExtract(person.wikipediaTitle, langCode)
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

export const getWorks = async (identifier: string, langCode = 'en') => {
    const response = await fetchQuery(worksQuery(identifier, langCode))
    return processSparqlBindings(response)
}

export const getInterests = async (identifier: string, langCode = 'en') => {
    const response = await fetchQuery(interestsQuery(identifier, langCode))
    return processSparqlBindings(response)
}

export const getNotableIdeas = async (identifier: string, langCode = 'en') => {
    const response = await fetchQuery(notableIdeaQuery(identifier, langCode))
    return processSparqlBindings(response)
}

export const doSearch = async (searchString: string): Promise<Array<any>> => {
    const response = await fetchQuery(searchQuery(searchString))
    return processSparqlBindings(response, false, 'uriLabel') as Array<any>
}
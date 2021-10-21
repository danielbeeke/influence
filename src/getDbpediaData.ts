import { Person } from "./types"

const relationShip = (referType) => referType === 'person' ? `dbo:influenced|^dbo:influencedBy` : `dbo:influencedBy|^dbo:influenced`

const personQuery = (identifier:string , langCode: string) => `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image ?abstract ?birth ?death
    WHERE {
        <http://dbpedia.org/resource/${identifier}> rdfs:label ?label .

        BIND (<http://dbpedia.org/resource/${identifier}> as ?person)
   

        OPTIONAL { <http://dbpedia.org/resource/${identifier}> dbo:abstract  ?abstract }

        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}

        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbo:deathYear ?deathYear}

        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbo:deathDate ?deathDate}

        BIND (COALESCE(?deathDate, ?deathYear) as ?death)
        BIND (COALESCE(?birthDate, ?birthYear, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?birth)

        OPTIONAL {<http://dbpedia.org/resource/${identifier}> foaf:depiction ?image }
        FILTER (lang(?label) = '${langCode}')
        FILTER (lang(?abstract) = '${langCode}')
    }
`

const listQuery = (identifier:string , langCode: string, predicate: string) => `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT ?abstract ?label ?image (REPLACE(STR(?item), "http://dbpedia.org/resource/", "") as ?id)
    WHERE {
        <http://dbpedia.org/resource/${identifier}> ${predicate} ?item .
        ?item dbo:abstract ?abstract .
        ?item rdfs:label ?label .

        OPTIONAL {?item foaf:depiction ?image}
        FILTER (lang(?label) = '${langCode}')
        FILTER (lang(?abstract) = '${langCode}')
    }
    ORDER BY ASC(?date)
`

const interestsQuery = (identifier:string , langCode: string) => listQuery(identifier, langCode, 'dbo:mainInterest')
const notableIdeaQuery = (identifier:string , langCode: string) => listQuery(identifier, langCode, 'dbo:notableIdea')

const worksQuery = (identifier:string , langCode: string) => `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT ?abstract ?label ?pages ?date ?image (REPLACE(STR(?work), "http://dbpedia.org/resource/", "") as ?id)
    WHERE {
        ?work dbo:author <http://dbpedia.org/resource/${identifier}> .
        ?work dbo:abstract ?abstract .
        ?work dbp:name ?label .

        OPTIONAL {?work dbo:numberOfPages ?pages}
        
        OPTIONAL {?work dbo:releaseDate ?releaseDate}
        OPTIONAL {?work dbp:releaseDate ?releaseDateProperty}
        BIND (COALESCE(?releaseDate, ?releaseDateProperty) as ?date)

        OPTIONAL {?work foaf:depiction ?image}
        FILTER (lang(?label) = '${langCode}')
        FILTER (lang(?abstract) = '${langCode}')
    }
    ORDER BY ASC(?date)
`

const influenceQuery = (identifier: string, referType: 'person' | 'others', langCode: string) => `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image ?birth ?death
    WHERE {
        ?person rdfs:label ?label .
        { SELECT DISTINCT ?person { <http://dbpedia.org/resource/${identifier}> ${relationShip(referType)} ?person . }}

        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}

        OPTIONAL {?person foaf:depiction ?image }

        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbo:deathYear ?deathYear}

        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbo:deathDate ?deathDate}

        BIND (COALESCE(?deathDate, ?deathYear) as ?death)
        BIND (COALESCE(?birthDate, ?birthYear, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?birth)

        FILTER isIRI(?person) 
        FILTER exists { ?person a schema:Person }
        FILTER (lang(?label) = '${langCode}')
    }
    ORDER BY ASC(?birth)

    LIMIT 1000
`
const staticCache = new Map()
const fetchQuery = async (query) => {
    let result = staticCache.get(query)

    if (!result) {
        const cleanedQuery = query.replaceAll('\n', ' ')
        const response = await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${cleanedQuery}&format=application/json-ld`)
        result = await response.json()    
        staticCache.set(query, result)
    }

    return result
}

const processSparqlBindings = (sparqlResults: { head: { vars: Array<string> }, results: { bindings: Array<any> }}, singular = false) => {
    const variables = sparqlResults.head.vars

    const results = sparqlResults.results.bindings.map(binding => {
        const item = {}

        for (const variable of variables) {
            item[variable] = binding[variable]?.value
        }

        return item
    })

    return singular ? results[0] : results
}

export const getPerson = async (identifier, langCode = 'en'): Promise<Person> => {
    const response = await fetchQuery(personQuery(identifier, langCode))
    return processSparqlBindings(response, true) as unknown as Person
}

export const getInfluenced = async (identifier, langCode = 'en') => {
    const response = await fetchQuery(influenceQuery(identifier, 'person', langCode))
    return processSparqlBindings(response)
}

export const getInfluencedBy = async (identifier, langCode = 'en') => {
    const response = await fetchQuery(influenceQuery(identifier, 'others', langCode))
    return processSparqlBindings(response)
}

export const getWorks = async (identifier, langCode = 'en') => {
    const response = await fetchQuery(worksQuery(identifier, langCode))
    return processSparqlBindings(response)
}

export const getInterests = async (identifier, langCode = 'en') => {
    const response = await fetchQuery(interestsQuery(identifier, langCode))
    return processSparqlBindings(response)
}

export const getNotableIdeas = async (identifier, langCode = 'en') => {
    const response = await fetchQuery(notableIdeaQuery(identifier, langCode))
    return processSparqlBindings(response)
}
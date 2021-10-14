import { Person } from "./types"

function superEncodeURI(url) {

    var encodedStr = '', encodeChars = ["(", ")"];
    url = encodeURI(url);
  
    for(var i = 0, len = url.length; i < len; i++) {
      if (encodeChars.indexOf(url[i]) >= 0) {
          var hex = parseInt(url.charCodeAt(i)).toString(16);
          encodedStr += '%' + hex;
      }
      else {
          encodedStr += url[i];
      }
    }
  
    return encodedStr;
  }
  
const personQuery = (identifier:string , langCode: string) => `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image
    WHERE {
        <http://dbpedia.org/resource/${identifier}> rdfs:label ?label .
        BIND (<http://dbpedia.org/resource/${identifier}> as ?person)
        OPTIONAL {<http://dbpedia.org/resource/${identifier}> foaf:depiction ?image }
        FILTER (lang(?label) = '${langCode}')
    }
`

const influenceQuery = (identifier: string, referType: 'person' | 'others', langCode: string) => `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX dbr: <http://dbpedia.org/resource/>

    SELECT DISTINCT (REPLACE(STR(?person), "http://dbpedia.org/resource/", "") as ?id) ?label ?image
    WHERE {
        ?person rdfs:label ?label .
        { SELECT DISTINCT ?person { <http://dbpedia.org/resource/${identifier}> ${referType === 'person' ? `dbo:influenced|^dbo:influencedBy` : `dbo:influencedBy|^dbo:influenced`} ?person . }}
        OPTIONAL {?person dbo:birthDate ?birthDate}
        OPTIONAL {?person dbp:birthDate ?birthDateProperty}
        OPTIONAL {?person dbo:birthYear ?birthYear}
        OPTIONAL {?person dbp:birthYear ?birthYearProperty}
        OPTIONAL {?person dbo:activeYearsStartYear ?activeYearsStartYear}
        OPTIONAL {?person dbp:activeYearsStartYear ?activeYearsStartYearProperty}
        OPTIONAL {?person foaf:depiction ?image }
        BIND (COALESCE(?birthDate, ?birthDateProperty, ?birthYear, ?birthYearProperty, ?activeYearsStartYear, ?activeYearsStartYearProperty) as ?date)
        FILTER isIRI(?person) 
        FILTER (lang(?label) = '${langCode}')
    }
    ORDER BY ASC(?date)

    LIMIT 1000
`

const fetchQuery = async (query) => {
    query = query.replaceAll('\n', ' ')
    const response = await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${query}&format=application/json-ld`)
    return await response.json()
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
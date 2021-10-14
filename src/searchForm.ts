import { html } from 'https://cdn.skypack.dev/uhtml/async';
import { debounce } from './debounce.js';
import { thumbnailUrl } from './thumbnailUrl.js';
import { updateSuggestions, drawApp, suggestions } from './app.js';

/**
 * Returns the last part of an RDF URI. (After the # or : or /)
 * @param uri 
 */
 export const lastPart = (uri) => {
    const split = uri.split(/\/|#/)
    return split.pop()
  }

const search = async (event) => {
    if (event.target.value.length < 4) return
    
    const query = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo:  <http://dbpedia.org/ontology/>
        PREFIX bif: <bif:>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
        SELECT DISTINCT ?uri ?label ?image {
            ?uri rdfs:label ?label .
            ?uri a <http://xmlns.com/foaf/0.1/Person> .
            ?uri dbo:thumbnail ?image .
            ?label bif:contains '"${event.target.value}"' .
            filter langMatches(lang(?label), "en")
        }
    
        LIMIT 10        
    `

    const url = `https://dbpedia.org/sparql${'?query='}${encodeURIComponent(query)}&format=json`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/sparql-results+json',
        },
    })

    const json = await response.json()
    updateSuggestions(json.results.bindings.map(binding => {
        return {
            label: binding.label.value,
            image: binding.image.value,
            id: lastPart(binding.uri.value)
        }
    }))

    drawApp()
}

export const searchForm = () => {
    return html`
        <form class="search-form">
            <label>Please search for a person</label>
            <input onkeyup=${debounce(search, 500)} type="search" class="search-input">

            ${suggestions.map(suggestion => html`
                <a class="suggestion" href=${`/${suggestion.id}`} onclick=${() => updateSuggestions([])}>
                    <img class="image" src=${thumbnailUrl(suggestion.image)} />
                    <h3 class="title">${suggestion.label}</h3>
                </div>
            `)}

        </form>
    `
}

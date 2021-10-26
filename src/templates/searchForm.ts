import { html } from 'https://cdn.skypack.dev/uhtml/async';
import { debounce } from '../helpers/debounce.js';
import { thumbnailAlternative } from '../helpers/thumbnailAlternative.js';
import { drawApp } from '../app.js';
import { lastPart } from '../helpers/lastPart.js';
import { removeBookmark } from '../helpers/removeBookmark.js';


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


let suggestions = []

const updateSuggestions = (newSuggestions) => {
    suggestions = newSuggestions
}

export const searchForm = () => {
    const savedUrls = localStorage.saved ? JSON.parse(localStorage.saved) : []

    return html`


        <form class="search-form" onsubmit=${(e) => e.preventDefault()}>
        <header class="site-header">
            <img class="site-logo" src="/logo.svg" />
            <h1 class="site-title">Influence</h1>
        </header>

        <h3 class="title">Search for a philosopher or an influential thinker</h3>
            <div class="search-field-wrapper">
            <img class="search-icon" src="/zoom.svg" />
            <input onkeyup=${debounce(search, 500)} type="search" class="search-input">
            </div>

            ${suggestions.map(suggestion => html`
                <a class="suggestion" href=${`/${suggestion.id}`} onclick=${() => updateSuggestions([])}>
                    ${thumbnailAlternative(suggestion.image, suggestion.label)}
                    <h3 class="title">${suggestion.label}</h3>
                </div>
            `)}

            ${!suggestions.length ? html`
            <div class="hint">
            You can try <a href="/Søren_Kierkegaard">Søren Kierkegaard</a> or <a href="/Plato">Plato</a>
            </div>
            ` : null }

            ${savedUrls.length ? html`
                <div class="saved-bookmarks">
                    <h3 class="title"><img src="/bookmarks.svg"> Your bookmarks</h3>

                    <ul class="bookmark-list">
                    ${savedUrls.map(savedUrl => {
                        const people = savedUrl.substr(1).split(',').map(name => decodeURI(name).replaceAll('_', ' '))
                        const label = `${people[0]} > ${people[people.length - 1]} (${people.length})`

                        return html`
                        <li>
                            <a class="bookmark" href=${savedUrl}>${label}</a>
                            <img class="remove-bookmark" onclick=${() => { removeBookmark(savedUrl); drawApp() }} src="/delete.svg" />
                        </li>
                        `
                    })}

                    </ul>
                </div>
            ` : null}

        </form>
    `
}

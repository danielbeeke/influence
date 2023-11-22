import { html } from 'https://cdn.skypack.dev/uhtml@3.2.2/async';
import { debounce } from '../helpers/debounce.js';
import { thumbnailAlternative } from '../helpers/thumbnailAlternative.js';
import { drawApp } from '../app.js';
import { lastPart } from '../helpers/lastPart.js';
import { removeBookmark } from '../helpers/removeBookmark.js';
import { doSearch } from '../sparql/getDbpediaData'

const search = async (event) => {
    if (event.target.value.length < 4) return

    isSearching = true

    drawApp()

    const results = await doSearch(event.target.value)

    console.log(results)

    updateSuggestions(results.map(item => {
        return {
            label: item.label,
            image: item.image,
            id: lastPart(item.uri)
        }
    }))

    isSearching = false

    drawApp()
}


let suggestions = []

const updateSuggestions = (newSuggestions) => {
    suggestions = newSuggestions
}

let isSearching = false

export const searchForm = () => {
    const savedUrls = localStorage.saved ? JSON.parse(localStorage.saved) : []

    return html`


        <form class=${`search-form ${isSearching ? 'is-searching' : ''}`} onsubmit=${(e) => e.preventDefault()}>
        <header class="site-header">
            <img class="site-logo" src="/logo.svg" />
            <h1 class="site-title">Influence</h1>
        </header>

        <h3 class="title">Search for a philosopher or an influential thinker</h3>
            <div class="search-field-wrapper">
            <img class="search-icon" src="/zoom.svg" />
            <input onkeyup=${debounce(search, 500)} type="search" class="search-input">
            <img class="search-loading-icon" src="/loading.svg" />
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
                        const people = savedUrl.substr(1).split(',').map(name => decodeURI(name).replace(/_/g, ' '))
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

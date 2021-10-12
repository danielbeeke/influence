import { fetchResource } from './fetchResource.js';
import { getReferencesPeople } from './getReferencesPeople.js';
import { html, render } from 'https://cdn.skypack.dev/uhtml/async';
import { debounce } from './debounce.js';
import { thumbnailAlternative } from './thumbnailAlternative.js';
import { lastPart } from './JsonLdProxy.js';
import { thumbnailUrl } from './thumbnailUrl.js';

document.body.addEventListener('click', (event: Event) => {
    const element = (event as any).target.nodeName !== 'A' ? (event as any).target.closest('a') : (event as any).target
    if (element) {
      const href = element.getAttribute('href')
      if (href && href[0] === '/') {
        event.preventDefault()
        setTimeout(() => {
            history.pushState(null, null, href)
            drawApp()
        })
      }
    }
})

const removeIdFromUrl = (id: string, columnIndex: number) => {
    let parts = location.pathname.substr(1).split(',')
    parts.splice(columnIndex)
    return `/${parts.join(',')}`    
}

const addIdToUrl = (id: string, columnIndex: number) => {
    let parts = location.pathname.substr(1).split(',')

    if (columnIndex < 0) {
        parts = [id]

    }
    else {
        parts.splice(columnIndex)
        parts[columnIndex] = id
    }

    return `/${parts.join(',')}`    
}

const personTemplate = (jsonLd, index: number = 0, columnIndex: number) => {    
    if (!jsonLd) return null
    const isActive = addActiveClass(jsonLd._identifier, columnIndex)

    return html`
        <a 
            href=${isActive ? removeIdFromUrl(jsonLd._identifier, columnIndex) : addIdToUrl(jsonLd._identifier, columnIndex)} 
            class=${`person ${isActive ? 'active' : ''}`} 
            style=${`--index: ${index}`}
            data-id=${jsonLd._identifier}>
        
                ${thumbnailAlternative(jsonLd['depiction']?._, jsonLd['label']?._)}

                <h3 class="name">${jsonLd['label']?._}</h3>
        
        </a>
    `
}

const addActiveClass = (search: string, columnIndex: number) => {
    const ids = decodeURI(location.pathname).substr(1).split(',')
    return ids[columnIndex]  === search
}

const onscroll = (event) => {
    const inner = event.target.querySelector('.inner')
    inner.style = `--scroll: ${event.target.scrollTop}px; --half: ${event.target.clientHeight / 2}px`
}

const onref = (element) => {
    columns.push(element)
}

const columns = []
let suggestions = []
const drawApp = async () => {
    const ids = decodeURI(location.pathname).substr(1).trim().split(',').filter(Boolean)
    const people = await Promise.all(ids.map(fetchResource))

    // Unknown sorts become the first items. This works good in case of Abraham.
    const sortOrder = ['dbo:birthDate', 'dbo:birthYear', 'dbo:activeYearsStartYear']

    const createColumn = async (jsonLd, columnName: string, columnIndex: number) => {
        const items = jsonLd?.[columnName]?.length ? await getReferencesPeople(jsonLd[columnName], sortOrder) : []
        const hasActive = items.some(person => addActiveClass(person._identifier, columnIndex))

        return html`
        <div onscroll=${onscroll} style=${`--count: ${items.length}`} class=${`${columnName} column ${hasActive ? 'active' : ''}`}>
            <div ref=${onref} class="inner">
                ${items.map((person, index) => personTemplate(person, index, columnIndex))}
                <div class="scroll-maker"></div>
            </div>
        </div>
        `
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
        suggestions = json.results.bindings.map(binding => {
            return {
                label: binding.label.value,
                image: binding.image.value,
                id: lastPart(binding.uri.value)
            }
        })

        drawApp()
    }

    const searchForm = () => {
        return html`
            <form class="search-form">
                <label>Please search for a person</label>
                <input onkeyup=${debounce(search, 500)} type="search" class="search-input">

                ${suggestions.map(suggestion => html`
                    <a class="suggestion" href=${`/${suggestion.id}`} onclick=${() => suggestions = []}>
                        <img class="image" src=${thumbnailUrl(suggestion.image)} />
                        <h3 class="title">${suggestion.label}</h3>
                    </div>
                `)}

            </form>
        `
    }

    const columnsRender = () => html`
        <div class="people">

            ${createColumn(people[0], 'influences', -1)}
            <div class="selected column">${personTemplate(people[0], 0, 0)}</div>
            ${people.map((person, index) => createColumn(person, 'influenced', index + 1))}

        </div>
    `

    await render(document.body, ids.length ? columnsRender() : searchForm())

    for (const column of columns) {
        column.style = `--scroll: 0px; --half: ${column.clientHeight / 2}px`
    }
}

setTimeout(() => {
    document.body.classList.remove('is-loading')
}, 800)
drawApp()
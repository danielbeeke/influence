import { fetchResource } from './fetchResource.js';
import { getReferencesPeople } from './getReferencesPeople.js';
import { html, render } from 'https://cdn.skypack.dev/uhtml/async';
import { thumbnailAlternative } from './thumbnailAlternative.js';
import { searchForm } from './searchForm.js'

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

const removeIdFromUrl = (columnIndex: number) => {
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
            href=${isActive ? removeIdFromUrl(columnIndex) : addIdToUrl(jsonLd._identifier, columnIndex)} 
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
export let suggestions = []

export const updateSuggestions = (newSuggestions) => {
    suggestions = newSuggestions
}

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

export const drawApp = async () => {
    const ids = decodeURI(location.pathname).substr(1).trim().split(',').filter(Boolean)
    const people = await Promise.all(ids.map(fetchResource))

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
import { html, render } from 'https://cdn.skypack.dev/uhtml/async';
import { thumbnailAlternative } from './thumbnailAlternative.js';
import { searchForm } from './searchForm.js'
import { getPerson, getInfluenced, getInfluencedBy } from './getDbpediaData.js';
import { disableScroll, enableScroll } from './disableScroll'
import { Person } from './types'

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

const personTemplate = (person: Person, index: number = 0, columnIndex: number) => {    
    const isActive = addActiveClass(person.id, columnIndex)

    return html`
        <a 
            href=${isActive ? removeIdFromUrl(columnIndex) : addIdToUrl(person.id, columnIndex)} 
            class=${`person ${isActive ? 'active' : ''}`} 
            style=${`--index: ${index}`}
            data-id=${person.id}>
        
                ${thumbnailAlternative(person.image, person.label)}

                <h3 class="name">${person.label}</h3>
        
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

const createColumn = async (id, peopleGetter: Function, columnIndex: number) => {

    const people: Array<Person> = await peopleGetter(id)
    const hasActive = people.some(person => addActiveClass(person.id, columnIndex))

    return html`
    <div onscroll=${onscroll} style=${`--count: ${people.length}`} class=${`column ${hasActive ? 'active' : 'is-loading'}`}>
        <div ref=${onref} class="inner">
            ${people.map((person, index) => personTemplate(person, index, columnIndex))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `
}

const columnsRender = async (ids) => {
    const person = await getPerson(ids[0])

    return html`
    <div class="people">
        ${createColumn(ids[0], getInfluencedBy, -1)}
        <div class="selected column">${personTemplate(person, 0, 0)}</div>
        ${ids.map((id, index) => createColumn(id, getInfluenced, index + 1))}
    </div>
    `
}

export const drawApp = async () => {
    const ids = decodeURI(location.pathname).substr(1).trim().split(',').filter(Boolean)

    try {
        await render(document.body, ids.length ? columnsRender(ids) : searchForm())
    }
    catch (exception) {
        console.info(exception)
    }

    for (const [index, column] of columns.entries()) {
        if (column.parentElement.classList.contains('active')) {
            disableScroll(column.parentElement)
        }
        else {
            enableScroll(column.parentElement)
        }
        column.style = `--scroll: 0px; --half: ${column.clientHeight / 2}px`
        setTimeout(() => {
            column.parentElement.classList.remove('is-loading')
        }, 500)
    }    
}

setTimeout(() => {
    document.body.classList.remove('is-loading')
}, 800)
drawApp()

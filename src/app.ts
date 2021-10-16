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

window.addEventListener('popstate', (event) => {
    drawApp()
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
        <div 
            class=${`person ${isActive ? 'active' : ''}`} 
            style=${`--index: ${index}`}
            data-id=${person.id}>
        
                ${thumbnailAlternative(person.image, person.label)}

                <button class="zoom" onclick=${() => { location.hash = person.id; drawApp(); } }></button>

                <h3 class="name">
                <span>
                    ${person.label}
                    </span>
                        <a class="action-button" href=${isActive ? removeIdFromUrl(columnIndex) : addIdToUrl(person.id, columnIndex)}></a>        
                </h3>
        
        </div>
    `
}

const getIds = () => {
    const ids = decodeURI(location.pathname).substr(1).split(',').filter(Boolean)
    return ids
}

const addActiveClass = (search: string, columnIndex: number) => {
    const ids = getIds()
    return ids[columnIndex]  === search
}

const onscroll = (event) => {
    const inner = event.target.querySelector('.inner')
    inner.style = `--scroll: ${event.target.scrollTop}px; --half: ${event.target.clientHeight / 2}px`
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
    <div ref=${element => columns.push(element)} onscroll=${onscroll} style=${`--count: ${people.length}`} class=${`column ${hasActive ? 'active' : 'is-loading'}`}>
        <div class="inner" style=${`--scroll: 0px; --half: ${Math.min((people.length * 55) + 40, window.innerHeight - 40) / 2}px`}>
            ${people.map((person, index) => personTemplate(person, index, columnIndex))}
            <div class="scroll-maker"></div>
        </div>
    </div>
    `
}

const closePopup = () => {
    location.hash = ''
    drawApp()
}

const columnsRender = async (ids) => {
    const persons = await Promise.all(ids.map(id => getPerson(id)))
    let selectedPerson = null
    if (location.hash) {
        const id = decodeURI(location.hash).substr(1)
        selectedPerson = id ? await getPerson(id, 'en', true) : null
    }

    document.body.dataset.selectedPerson = (!!selectedPerson).toString()

    return html`
        ${selectedPerson ? html`
        <div class="selected-person">
            <h1 class="title">${selectedPerson.label} <button class="close" onclick=${closePopup}></button></h1>
            <div class="abstract">
                ${selectedPerson.image ? html`<img class="image" src=${`https://images.weserv.nl/?url=${selectedPerson.image}&w=300`} />` : null}
                ${selectedPerson.abstract}
            </div>
        </div>        
        ` : null}

        <div class="headers">
            <h3 class="column-title">${`Influencers of ${persons[0].label}`}</h3>
            <h3 class="column-title selected">Your starting selection:</h3>
            ${ids.map((id, index) => html`<h3 class="column-title">Influenced by ${persons[index].label}</h3>`)}
        </div>
        <div class="people">
            ${createColumn(ids[0], getInfluencedBy, -1)}
            <div class="selected column" style="--count: 1">
                <div class="inner" style="--half: 47px;">
                ${personTemplate(persons[0], 0, 0)}
                </div>
            </div>
            ${ids.map((id, index) => createColumn(id, getInfluenced, index + 1))}
        </div>
    `
}

export const drawApp = async () => {
    const ids = getIds()

    try {
        await render(document.body, ids.length ? columnsRender(ids) : searchForm())
    }
    catch (exception) {
        if (exception.message === 'NetworkError when attempting to fetch resource.') {
            render(document.body, html`<h1 class="dbpedia-offline">Unfortunatly DBpedia is down.<br>Please come back later.</h1>`)
        }
        else {
            console.info(exception.message)
        }
    }

    for (const [index, column] of columns.entries()) {
        column.classList.contains('active') ? disableScroll(column) : enableScroll(column)
        setTimeout(() => column.classList.remove('is-loading'), 500)
    }    
}

setTimeout(() => document.body.classList.remove('is-loading'), 800)
drawApp()

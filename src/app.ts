import { html, render } from 'https://cdn.skypack.dev/uhtml/async';
import { thumbnailAlternative } from './thumbnailAlternative.js';
import { searchForm } from './searchForm.js'
import { getPerson, getInfluenced, getInfluencedBy, getWorks, getInterests, getNotableIdeas } from './getDbpediaData.js';
import { disableScroll, enableScroll } from './disableScroll'
import { Person } from './types'

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://cd8164655d204832bba96a931a6a018e@o483393.ingest.sentry.io/6010247",
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

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
    const isActive = hasActivePerson(person.id, columnIndex)

    return html`
        <div 
            class=${`person ${isActive ? 'active' : ''}`} 
            style=${`--index: ${index}`}
            data-id=${person.id}>
        
                ${thumbnailAlternative(person.image, person.label)}

                <button class="zoom" onclick=${() => { location.hash = person.id; drawApp(); } }></button>

                <a class="name" href=${isActive ? removeIdFromUrl(columnIndex) : addIdToUrl(person.id, columnIndex)}>
                    ${person.birth ? html`<span class="dates">${person.birth.substr(0, 4)} ${person.death ? html` / ${person.death.substr(0, 4)}` : null}</span>` : null}
                    <span>${person.label}</span>
                </a>

                <span class="action-button"></span>
        
        </div>
    `
}

const getIds = () => {
    const ids = decodeURI(location.pathname).substr(1).split(',').filter(Boolean)
    return ids
}

const hasActivePerson = (search: string, columnIndex: number) => {
    const ids = getIds()
    return ids[columnIndex] === search
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

const cleanDate = (dateString: string) => {
    const matches = dateString?.match(/\d{4}/g).map(year => parseInt(year)) ?? []
    const year = Math.min(...matches)
    return year !== Infinity ? year : null
}

const showWorks = async (person) => {
    const works = await getWorks(person.id) as Array<{ label: string, date: string, cleanedDate: number, id: string }>
    for (const work of works) work.cleanedDate = cleanDate(work.date)
    works.sort((a, b) => a.cleanedDate - b.cleanedDate)

    return works.length ? html`
    <ul class="works item-list">
        <h3>Works:</h3>
        ${works.map(work => html`<li><a class="work item" href=${`#${work.id}`}>${work.label} ${work.date ? html`(${cleanDate(work.date)})` : null}</a></li>`)}
    </ul>
    ` : null
}

const showInterests = async (person) => {
    const interests = await getInterests(person.id) as Array<{ label: string, date: string, cleanedDate: number, id: string }>

    return interests.length ? html`
    <ul class="interests item-list">
        <h3>Interests:</h3>
        ${interests.map(interest => html`<li><a class="interest item" href=${`#${interest.id}`}>${interest.label}</a></li>`)}
    </ul>
    ` : null
}


const showIdeas = async (person) => {
    const ideas = await getNotableIdeas(person.id) as Array<{ label: string, date: string, cleanedDate: number, id: string }>

    return ideas.length ? html`
    <ul class="ideas item-list">
        <h3>Ideas:</h3>
        ${ideas.map(idea => html`<li><a class="idea item" href=${`#${idea.id}`}>${idea.label}</a></li>`)}
    </ul>
    ` : null
}

const createColumn = async (id, peopleGetter: Function, columnIndex: number) => {

    const people: Array<Person> = await peopleGetter(id)
    const activePerson = people.find(person => hasActivePerson(person.id, columnIndex))

    return html`
    <div ref=${element => columns.push(element)} onscroll=${onscroll} style=${`--count: ${people.length}`} class=${`column ${columnIndex === 0 ? 'selected' : ''} ${activePerson ? 'active' : 'is-loading'}`}>
        <div class="inner" style=${`--scroll: 0px; --half: ${Math.min((people.length * 55) + 40, window.innerHeight - 40) / 2}px`}>
            ${people.map((person, index) => personTemplate(person, index, columnIndex))}

            <div class="scroll-maker"></div>
        </div>

        <div class="item-lists">
            ${activePerson ? showWorks(activePerson) : null}
            ${activePerson ? showInterests(activePerson) : null}
            ${activePerson ? showIdeas(activePerson) : null}
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
        selectedPerson = id ? await getPerson(id, 'en') : null
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
            <h3 class="column-title">${`Influencers of ${(persons[0] as Person).label}`}</h3>
            <h3 class="column-title selected">Your starting selection:</h3>
            ${ids.map((id, index) => html`<h3 class="column-title">Influenced by ${(persons[index] as Person).label}</h3>`)}
        </div>
        <div class="people">
            ${createColumn(ids[0], getInfluencedBy, -1)}
            ${createColumn(ids[0], () => [persons[0]], 0)}
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

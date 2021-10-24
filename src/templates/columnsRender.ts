import { html } from 'https://cdn.skypack.dev/uhtml/async';
import { getPerson, getInfluenced, getInfluencedBy, getWorks, getInterests, getNotableIdeas } from '../sparql/getDbpediaData';
import { Person } from '../types'
import { hasActivePerson } from '../helpers/hasActivePerson';
import { personTemplate } from './personTemplate';
import { drawApp } from '../app';
import { cleanDate } from '../helpers/cleanDate';
import { getState } from '../helpers/getState';
import { continueColumnsRender } from '../helpers/continueColumnsRender'
import { debounce } from '../helpers/debounce';
import { unique } from '../helpers/unique'

const columns = []

const showIdeas = async (person) => {
    const ideas = await getNotableIdeas(person.id) as Array<{ label: string, date: string, cleanedDate: number, id: string }>

    return ideas.length ? html`
    <ul class="ideas item-list">
        <h3>Ideas:</h3>
        ${ideas.map(idea => html`<li><a class="idea item" href=${`#${idea.id}`}>${idea.label}</a></li>`)}
    </ul>
    ` : null
}

const showWorks = async (person) => {
    const works = await getWorks(person.id) as Array<{ label: string, date: string, cleanedDate: number, id: string }>
    for (const work of works) work.cleanedDate = cleanDate(work.date)
    works.sort((a, b) => a.cleanedDate - b.cleanedDate)

    return works.length ? html`
    <ul class="works item-list">
        <h3>Works:</h3>
        ${works.map(work => html`<li><a class="work item" href=${`#${work.id}`}>${work.label} ${cleanDate(work.date) ? html`(${cleanDate(work.date)})` : null}</a></li>`)}
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


let bookmarkState = ''

const saveToHomepage = async () => {
    let savedUrls = localStorage.saved ? JSON.parse(localStorage.saved) : []
    let innerBookmarkState = !savedUrls.includes(location.pathname) ? 'default' : 'bookmarked'

    if (innerBookmarkState === 'bookmarked') {
        savedUrls = savedUrls.filter(item => item !== location.pathname)
        bookmarkState = 'bookmark-removed'
    }
    else {
        savedUrls.push(location.pathname)
        bookmarkState = 'bookmark-added'
    }

    localStorage.saved = JSON.stringify(savedUrls)
    await drawApp()
    setTimeout(() => {
        bookmarkState = !savedUrls.includes(location.pathname) ? 'default' : 'bookmarked'
        drawApp()
    }, 1500)    

}

export let allInfluence = []
export const columnsRender = async (ids, skipBookmark = false) => {
    const persons = await Promise.all(ids.map(id => getPerson(id)))
    let selectedPerson = null
    if (location.hash) {
        const id = decodeURI(location.hash).substr(1)
        selectedPerson = id ? await getPerson(id, 'en') : null
    }

    document.body.dataset.selectedPerson = (!!selectedPerson).toString()

    if (!bookmarkState.includes('-')) {
        let savedUrls = localStorage.saved ? JSON.parse(localStorage.saved) : []
        bookmarkState = !savedUrls.includes(location.pathname) ? 'default' : 'bookmarked'    
    }
   
    Promise.all([
        getInfluencedBy(ids[0]),
        Promise.resolve([persons[0]]),
        ...ids.map(id => getInfluenced(id))
    ]).then(columnResults => {
        allInfluence = columnResults
            .flatMap(columnPeople => columnPeople.map(person => parseInt(person.influence)))
            .sort((a, b) => a - b)
            .filter(unique)
    })

    return html`
        ${selectedPerson ? html`
        <div class="selected-person">
            <h1 class="title">${selectedPerson.label} <button class="close" onclick=${() => {location.hash = ''; drawApp()}}></button></h1>
            <div class="abstract">
                ${selectedPerson.image ? html`<img class="image" src=${`https://images.weserv.nl/?url=${selectedPerson.image}&w=300`} />` : null}
                ${selectedPerson.abstract}
            </div>
        </div>        
        ` : null}

        <div class="people">
            ${createColumn(ids[0], getInfluencedBy, -1, `Influencers of ${(persons[0] as Person).label}`)}
            ${createColumn(ids[0], async () => [persons[0]], 0, `Your starting selection:`)}
            ${ids.map((id, index) => createColumn(id, getInfluenced, index + 1, `Influenced by ${(persons[index] as Person).label}`))}
        </div>

        <a class="fixed-button restart-button" href="/">
            <div class="icon"></div>
        </a>

        <button data-state=${bookmarkState} class="fixed-button bookmark-button" onclick=${saveToHomepage}>
            <span class="text removed">Bookmark removed</span>
            <span class="text added">Bookmark added to home</span>
            <div class="icon"></div>
        </button>
    `
}

const activeColumns = new Map()
const activateColumnSearch = async (index: number, input) => {
    activeColumns.set(index, true)
    await drawApp()
    input.focus()
}

export const deactivateColumnSearch = (columnIndex: number, input = null) => {
    activeColumns.set(columnIndex, false)
    columnSearches.set(columnIndex, '')
    if (input) input.value = ''
    drawApp()
}

const columnSearches = new Map()

const onColumnSearch = debounce((event, columnIndex) => {
    columnSearches.set(columnIndex, event.target.value)
    drawApp()
}, 100)

const onColumnBlur = (event, columnIndex) => {
    if (!event.target.value) deactivateColumnSearch(columnIndex)
}

const createColumn = async (id, peopleGetter: Function, columnIndex: number, title) => {

    const state = getState(id + ':' + columnIndex, {
        people: [],
        isLoading: true
    })

    if (state.isLoading) {
        peopleGetter(id).then(people => {
            state.people = people
            state.isLoading = false
            drawApp().then(continueColumnsRender)
        })
    }
    
    const activePerson = state.people.find(person => hasActivePerson(person.id, columnIndex))

    let input 

    const currentSearch = columnSearches.get(columnIndex)?.toLowerCase()

    return html`
    <div ref=${element => columns.push(element)} class=${`column ${columnIndex === 0 ? 'selected' : ''} ${activePerson ? 'active' : 'is-loading'}`}>
        <h3 class=${`column-title ${activeColumns.get(columnIndex) ? 'active-search' : ''}`}>
            ${title}
            <input .value=${columnSearches.get(columnIndex) ?? ''} placeholder="Filter" onblur=${(event => onColumnBlur(event, columnIndex))} onkeyup=${(event => onColumnSearch(event, columnIndex))} ref=${element => input = element} type="search" class="search-field">
            <button onclick=${() => activateColumnSearch(columnIndex, input)} class="do-search-icon"></button>
            <button onclick=${() => deactivateColumnSearch(columnIndex, input)} class="close-search-icon"></button>
        </h3>

        <div class="inner">
            ${state.people
                .filter(person => currentSearch ? person.label.toLowerCase().includes(currentSearch) : true)
                .map((person, index) => personTemplate(person, index, columnIndex))}

            <div class="scroll-maker"></div>
        </div>

        ${activePerson ? html`
        <div class="item-lists scroll-box">
            ${showWorks(activePerson)}
            ${showInterests(activePerson)}
            ${showIdeas(activePerson)}
        </div>
        ` : null}

    </div>
    `
}


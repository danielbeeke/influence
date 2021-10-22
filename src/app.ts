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

            const isActive = element.closest('.person')?.classList.contains('active')
            const isPerson = element.closest('.person')?.classList.contains('person')

            if (isPerson && isActive) {
                const columns = [...document.querySelectorAll('.column')]
                const clickedIndex = columns.indexOf(element.closest('.column'))
                
                if (clickedIndex === 1) {
                    history.pushState(null, null, href)
                    drawApp() 
                }
                else {
                    for (const [index, column] of columns.entries()) {
                        if (index > clickedIndex) {
                            column.addEventListener('animationend', () => {
                                history.pushState(null, null, href)
                                drawApp()    
                            }, { once: true })
                            column.classList.add('prepare-removal')
                        }
                    }    
                }
            }
            else {
                history.pushState(null, null, href)
                drawApp()    
            }
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

const state = new Map()
export const getState = (object, defaults) => {
  return state.has(object) ? state.get(object) : state.set(object, defaults) && state.get(object)
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

function waitForScrollEnd (element = window) {
    let last_changed_frame = 0
    let last_x = element.scrollX
    let last_y = element.scrollY

    return new Promise( resolve => {
        function tick(frames) {
            // We requestAnimationFrame either for 500 frames or until 20 frames with
            // no change have been observed.
            if (frames >= 500 || frames - last_changed_frame > 20) {
                resolve(null)
            } else {
                if (element.scrollX != last_x || element.scrollY != last_y) {
                    last_changed_frame = frames
                    last_x = element.scrollX
                    last_y = element.scrollY
                }
                requestAnimationFrame(tick.bind(null, frames + 1))
            }
        }
        tick(0)
    })
}


const createColumn = async (id, peopleGetter: Function, columnIndex: number, title) => {

    const state = getState(id + ':' + columnIndex, {
        people: [],
        isLoading: true
    })

    if (state.isLoading) {
        setTimeout(() => {
            peopleGetter(id).then(people => {
                state.people = people
                state.isLoading = false
                drawApp()
            })        
        })
    }
    
    const activePerson = state.people.find(person => hasActivePerson(person.id, columnIndex))

    return html`
    <div ref=${element => columns.push(element)} class=${`column ${columnIndex === 0 ? 'selected' : ''} ${activePerson ? 'active' : 'is-loading'}`}>
        <h3 class="column-title">${title}</h3>

        <div class="inner">
            ${state.people.map((person, index) => personTemplate(person, index, columnIndex))}

            <div class="scroll-maker"></div>
        </div>

        ${activePerson ? html`
        <div class="item-lists">
            ${showWorks(activePerson)}
            ${showInterests(activePerson)}
            ${showIdeas(activePerson)}
        </div>
        ` : null}

    </div>
    `
}

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
export function throttle(func, wait, options = { leading: true, trailing: true }) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

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

        <div class="people">
            ${createColumn(ids[0], getInfluencedBy, -1, `Influencers of ${(persons[0] as Person).label}`)}
            ${createColumn(ids[0], async () => [persons[0]], 0, `Your starting selection:`)}
            ${ids.map((id, index) => createColumn(id, getInfluenced, index + 1, `Influenced by ${(persons[index] as Person).label}`))}
        </div>
    `
}

const startTime = (new Date).getTime()

export const drawApp = throttle(async () => {
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

    if (ids.length) {
        const runTime = (new Date).getTime() - startTime
        for (const [index, column] of columns.entries()) {
            if (column.classList.contains('active')) {
                column.querySelector('.person.active').scrollIntoView({ behavior: runTime < 2000 ? 'auto' : 'smooth' })
                waitForScrollEnd(column).then(() => {
                    disableScroll(column)
                })
            }
            else {
                enableScroll(column)
            }
        }    
    
        setTimeout(() => {
            columns.at(-1).scrollIntoView({ behavior: 'smooth' })    

        }, 1000)
    
    }
}, 200)

drawApp()

import { fetchResource } from './fetchResource.js';
import { getReferencesPeople } from './getReferencesPeople.js';
import { html, render } from 'https://cdn.skypack.dev/uhtml/async';
import { thumbnailUrl } from './thumbnailUrl.js';
import { thumbnailAlternative } from './thumbnailAlternative.js';

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


const identifier = decodeURI(location.pathname.substr(1))
if (!identifier) throw new Error('Please type some as the pathname')
const jsonLd = await fetchResource(identifier)
jsonLd._identifier = identifier

// Unknown sorts become the first items. This works good in case of Abraham.
const sortOrder = ['dbo:birthDate', 'dbo:birthYear', 'dbo:activeYearsStartYear']
const influences = await getReferencesPeople(jsonLd['influences'], sortOrder)
const influenced = await getReferencesPeople(jsonLd['influenced'], sortOrder)

const addIdToUrl = (mainIdentifier: string, id: string, column: string) => {
    const search = new URLSearchParams(location.search)

    if (column) {
        let ids = search.get(column) ? [...search.get(column).split(','), id] : [id]
        search.set(column, ids.join(','))
    }
    else {
    return `/${mainIdentifier}`
    }
    
    return `/${mainIdentifier}?${search}`
}

const personTemplate = (jsonLd, index: number = 0, column: string = '') => {    
    return html`
        <a 
            href=${addIdToUrl(identifier, jsonLd._identifier, column)} 
            class=${`person ${addActiveClass(jsonLd._identifier)}`} 
            style=${`--index: ${index}`}
            data-id=${jsonLd._identifier}>
        
            ${jsonLd['depiction']?._ ? 
                html`<img class="image" src=${thumbnailUrl(jsonLd['depiction']._)} />` : 
                thumbnailAlternative(jsonLd['label']?._)}
    
                <h3 class="name">${jsonLd['label']?._}</h3>
        
        </a>
    `
}

const addActiveClass = (search: string) => {
    return decodeURI(location.toString()).includes(search) ? 'active' : ''
}

const onscroll = (event) => {
    const inner = event.target.querySelector('.inner')
    inner.style = `--scroll: ${event.target.scrollTop}px; --half: ${event.target.clientHeight / 2}px`
}

const onref = (element) => {
    setTimeout(() => {
        element.style = `--scroll: 0px; --half: ${element.clientHeight / 2}px`
    })
}

const drawApp = () => {
    render(document.body, html`

        <div class="people">

            <div onscroll=${onscroll} style=${`--count: ${influences.length}`} class=${`influences column ${addActiveClass('influences')}`}>
                <div ref=${onref} class="inner">
                    ${influences.map((person, index) => personTemplate(person, index, 'influences'))}
                    <div class="scroll-maker"></div>
                </div>
            </div>

            <div class="selected column">
                ${personTemplate(jsonLd)}
            </div>

            <div onscroll=${onscroll} style=${`--count: ${influenced.length}`} class=${`influenced column ${addActiveClass('influenced')}`}>
                <div ref=${onref} class="inner">
                    ${influenced.map((person, index) => personTemplate(person, index, 'influenced'))}
                    <div class="scroll-maker"></div>
                </div>
            </div>

        </div>
    `)
}

drawApp()
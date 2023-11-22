import { Person } from '../types'
import { hasActivePerson } from '../helpers/hasActivePerson'
import { html } from 'https://cdn.skypack.dev/uhtml@3.2.2/async';
import { thumbnailAlternative } from '../helpers/thumbnailAlternative';
import { drawApp } from '../app';
import { allInfluence } from './columnsRender';

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

export const personTemplate = (person: Person, index: number = 0, columnIndex: number) => {    
    const isActive = hasActivePerson(person.id, columnIndex)
    const position = allInfluence.indexOf(parseInt(person.influence))
    const influencePercentage = Math.round(100 / allInfluence.length * position)

    return html`
        <div 
            class=${`person ${isActive ? 'active' : ''}`} 
            style=${`--index: ${index}`}
            data-id=${person.id}>
        
                <button class="expand-button" onclick=${() => { location.hash = person.id; drawApp(); } }>
                    ${thumbnailAlternative(person.image, person.label)}
                    <img class="loading-icon" src="/loading.svg" />
                </button>

                <a class="name" href=${isActive ? removeIdFromUrl(columnIndex) : addIdToUrl(person.id, columnIndex)}>
                    ${person.birth ? html`<span class="dates">${person.birth.substr(0, 4)} ${person.death ? html` / ${person.death.substr(0, 4)}` : null}</span>` : null}
                    <span class="text">${person.label}</span>
                    ${influencePercentage ? html`<div class="progress-bar" style=${`--percentage: ${influencePercentage}`}></div>` : null}
                </a>

                <span class="action-button"></span>
        
        </div>
    `
}
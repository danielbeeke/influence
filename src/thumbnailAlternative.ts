import { stringToColor } from './stringToColor.js'
import { html } from 'https://cdn.skypack.dev/uhtml/async';
import kv from 'https://cdn.skypack.dev/@jacobmarshall/kv';
import { thumbnailUrl } from './thumbnailUrl.js'
import { drawApp } from './app.js';
const cache = kv('thumbnailAlternative')

export const thumbnailAlternative = async (preferredImage: string, label: string) => {
    const initials = label?.replace(/[^A-Z]/g,'').split('').map(name => name.substr(0, 1))
    let image = await cache.get(label)
    if (image === undefined) {
        image = preferredImage
    }

    const fallback = () => {
        return html`<div class="image-alternative" style=${`--color: #${stringToColor(label)}`}>
            <span>${initials.join('')}</span>
        </div>`
    }

    if (image === undefined) {
        const url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${label}&prop=pageimages&format=json&pithumbsize=400`
        const response = await fetch(url, {
            method: 'GET'
        })
        const json = await response.json()
        const [ pageId ] = Object.keys(json.query.pages)
        const page = json.query.pages[pageId]
        image = page.thumbnail?.source ?? false
        await cache.set(label, image)
    }

    const onerror = async (event) => {
        drawApp()
        await cache.set(label, false)
    }
    
    if (image === false) return fallback()

    return html`<img onerror=${[onerror, { once: true }]} class="image" src=${thumbnailUrl(image)} />`
}
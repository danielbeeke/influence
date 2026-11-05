import { stringToColor } from './stringToColor.js'
import { html } from 'https://cdn.skypack.dev/uhtml@3.2.2/async';
import kv from 'https://cdn.skypack.dev/@jacobmarshall/kv';
import { commonsThumbnail, thumbnailUrl } from './thumbnailUrl.js'
import { drawApp } from '../app.js';

// v2: the old store keyed failures by label, so one failed load (or a DBpedia-era miss) hid the
// Wikidata image for that person forever. Entries are now keyed by what they describe.
const cache = kv('thumbnailAlternative-v2')
const wikipediaKey = (label: string) => `wikipedia:${label}`
const failedKey = (image: string) => `failed:${image}`

export const thumbnailAlternative = async (preferredImage: string, label: string, size = 100, disableCover = false) => {
    const initials = label?.replace(/[^A-Z]/g,'').split('').map(name => name.substr(0, 1)) ?? []

    const fallback = () => {
        return html`<div class="image-alternative" style=${`--color: #${stringToColor(label)}`}>
            <span>${initials.join('')}</span>
        </div>`
    }

    // The image from Wikidata wins; only look one up on Wikipedia when there is none.
    let image: string | false | undefined = preferredImage
    if (!image && label) {
        image = await cache.get(wikipediaKey(label))

        if (image === undefined) {
            const url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(label)}&prop=pageimages&format=json&pithumbsize=${size * 3}`
            const json = await fetch(url).then(response => response.json()).catch(() => null)
            const [ page ] = Object.values(json?.query?.pages ?? {}) as Array<{ thumbnail?: { source: string } }>
            image = page?.thumbnail?.source ?? false
            await cache.set(wikipediaKey(label), image)
        }
    }

    if (!image || await cache.get(failedKey(image))) return fallback()

    const src = thumbnailUrl(image, size, disableCover)
    const direct = commonsThumbnail(image, size * 3)

    let triedDirect = false
    const onerror = async (event) => {
        // The proxy can fail on its own (rate limits, timeouts): try the image without it once.
        if (!triedDirect) {
            triedDirect = true
            ;(event.target as HTMLImageElement).src = direct
            return
        }

        await cache.set(failedKey(image as string), true)
        drawApp()
    }

    return html`<img onerror=${[onerror, { once: false }]} class="image" src=${src} />`
}

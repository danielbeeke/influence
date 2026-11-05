// Wikimedia only serves thumbnails efficiently (and without rate limiting) at standard widths.
const COMMONS_WIDTHS = [120, 250, 330, 500, 960, 1280, 1920]

/**
 * Wikidata images (P18) are Commons "Special:FilePath" URLs pointing to the full original, which can be
 * many megabytes. Ask Commons for a scaled thumbnail instead. Other URLs are returned untouched.
 */
export const commonsThumbnail = (url: string, width: number) => {
    if (!/commons\.wikimedia\.org\/wiki\/Special:FilePath\//.test(url)) return url
    const standardWidth = COMMONS_WIDTHS.find(standard => standard >= width) ?? COMMONS_WIDTHS[COMMONS_WIDTHS.length - 1]
    return `${url.replace(/^http:/, 'https:').split('?')[0]}?width=${standardWidth}`
}

export const thumbnailUrl = (url: string, size: number = 100, disableCover = false) =>
    `https://images.weserv.nl/?url=${encodeURIComponent(commonsThumbnail(url, size * 3))}&w=${size}${!disableCover ? `&h=${size}&fit=cover&a=attention` : ''}`

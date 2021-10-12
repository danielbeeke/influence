import kv from 'https://cdn.skypack.dev/@jacobmarshall/kv';
import { JsonLdProxy, lastPart } from './JsonLdProxy.js'
import { context } from './context.js'
const cache = kv('cache')

export const fetchResource = async (identifier: string) => {
    if (!identifier) throw new Error('We need an identifier')
    let json = await cache.get(identifier)

    if (!json) {
        const uri = `http://dbpedia.org/resource/${identifier}`
        const query = `DESCRIBE <${uri}>`
        const response = await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${query}&format=application/json-ld`)
        json = await response.json()
        await cache.set(identifier, json)
    }
    
    const allGraphs = JsonLdProxy(json, context, {}, ['rdfs', 'dbp', 'foaf'])
    return allGraphs[`dbr:${identifier}`]
}
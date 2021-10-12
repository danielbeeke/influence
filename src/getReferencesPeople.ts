import { lastPart } from './JsonLdProxy.js'
import { fetchResource } from './fetchResource.js';

export const getReferencesPeople = async (jsonLdArray: Array<any>, sortBy: Array<string> = null) => {
    const proxies = await Promise.all(jsonLdArray
    .map(i => lastPart(i._))
    .filter(Boolean)
    .map(async identifier => {
        const proxy = await fetchResource(identifier)
        proxy['_identifier'] = identifier
        return proxy
    }))

    const results = proxies.filter(item => item['rdf:type'].some(rdfClass => rdfClass._ === 'http://xmlns.com/foaf/0.1/Person'))

    if (!sortBy) return results

    return results.sort((a: any, b: any) => {
        const getString = (object) => {
            let string = ''
            for (const sortKey of sortBy) {
                string = object[sortKey]?._.toString()
                if (string) return string
            }

            return ''
        }

        const aString = getString(a)
        const bString = getString(b)

        return aString.localeCompare(bString)
    })
}

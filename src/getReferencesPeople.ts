import { lastPart } from './JsonLdProxy.js'
import { fetchResource, fetchResourceRaw } from './fetchResource.js';

const isPerson = (search) => {
    const knownPersonClasses = [
        'http://xmlns.com/foaf/0.1/Person',
        'http://dbpedia.org/class/yago/LivingThing100004258',
        'http://dbpedia.org/class/yago/Person100007846',
        'http://dbpedia.org/ontology/Person'
    ]

    return knownPersonClasses.includes(search)
}

export const getReferencesPeople = async (jsonLdArray: Array<any>, sortBy: Array<string> = null) => {
    let ids = jsonLdArray
    .map(i => lastPart(i._))
    .filter(Boolean)

    ids = ids.flatMap(id => id.replace(/ /g, '_').replaceAll('\n', '').split(/,|\*_/)).filter(Boolean)

    let proxies = await Promise.all(ids.map(fetchResource))

    const listIds = proxies
    .filter(proxy => proxy?.['http://www.w3.org/ns/prov#wasDerivedFrom']?._.includes('List_of_'))
    .flatMap(proxy => proxy['dbo:wikiPageWikiLink'].map(item => lastPart(item._)))

    const proxiesGatheredFromLists = await Promise.all(listIds.map(fetchResource))

    proxies = [...proxies, ...proxiesGatheredFromLists]

    const listsToUnwind = proxies.filter(item => !item?.['rdf:type']?.some(rdfClass => isPerson(rdfClass._)))
    .filter(item => item?.['rdf:type']?._ === undefined && item?.['dbo:wikiPageWikiLink'].length === 1)

    const unwindedListIds = listsToUnwind.map(list => lastPart(list['dbo:wikiPageWikiLink']?._))
    const unwindedLists = await Promise.all(unwindedListIds.map(list => fetchResourceRaw(list, 'data')))

    const personUrisFromUnwindedLists = unwindedLists.flatMap(object => Object.keys(object).map(lastPart))
    .filter(uri => !uri.includes('Category:'))

    const personsFromUnwindedLists = await Promise.all(personUrisFromUnwindedLists.map(fetchResource))

    proxies = [...proxies, ...personsFromUnwindedLists]

    const results = proxies.filter(item => {        
        return item?.['rdf:type']?.some(rdfClass => isPerson(rdfClass._))
    })

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

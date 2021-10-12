# Dbpedia Influence view

A little webapp to view relationships of influence between people that are on Wikipedia. 

Used libraries:

- [webreflection/uHTML](https://github.com/webreflection/uHTML)
- [@jacobmarshall/kv](https://github.com/@jacobmarshall/kv)

Inside the code there is much usage of JsonLdProxy. This helps accessing data from a JSON-ld object. It might take some time to get used to the syntax though.

```JavaScript
const person = JsonLdProxy(rawPersonJsonLdData, context, {}, ['rdfs', 'dbp', 'foaf'])
const name = person.name?._ // gives back if exists: rdfs:name or dbp:name or foaf:name

The underscore _ is used to tell the proxy to go down into the value object of the JSON-ld and get the value or the uri.

```
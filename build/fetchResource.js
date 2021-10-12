import kv from "https://cdn.skypack.dev/@jacobmarshall/kv";
import {JsonLdProxy, lastPart} from "./JsonLdProxy.js";
import {context} from "./context.js";
const cache = kv("cache");
export const fetchResource = async (identifier) => {
  if (!identifier)
    throw new Error("We need an identifier");
  let json = await cache.get(identifier);
  if (!json) {
    try {
      const uri = `http://dbpedia.org/resource/${identifier}`;
      const query = `DESCRIBE <${uri}>`;
      const response = await fetch(`https://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${query}&format=application/json-ld`);
      json = await response.json();
    } catch (exception) {
      json = false;
    }
    await cache.set(identifier, json);
    return null;
  }
  const allGraphs = JsonLdProxy(json, context, {}, ["rdfs", "dbp", "foaf"]);
  const proxy = allGraphs[`dbr:${identifier}`];
  if (proxy?.["dbo:wikiPageRedirects"]?._) {
    const redirect = proxy?.["dbo:wikiPageRedirects"]?._;
    return fetchResource(lastPart(redirect));
  }
  if (!proxy)
    return null;
  proxy._identifier = identifier;
  return proxy;
};

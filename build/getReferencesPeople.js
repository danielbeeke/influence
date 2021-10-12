import {lastPart} from "./JsonLdProxy.js";
import {fetchResource} from "./fetchResource.js";
export const getReferencesPeople = async (jsonLdArray, sortBy = null) => {
  let ids = jsonLdArray.map((i) => lastPart(i._)).filter(Boolean);
  ids = ids.flatMap((id) => id.replaceAll(" ", "_").split(",_"));
  const proxies = await Promise.all(ids.map(fetchResource));
  const results = proxies.filter((item) => {
    return item?.["rdf:type"]?.some((rdfClass) => rdfClass._ === "http://xmlns.com/foaf/0.1/Person");
  });
  if (!sortBy)
    return results;
  return results.sort((a, b) => {
    const getString = (object) => {
      let string = "";
      for (const sortKey of sortBy) {
        string = object[sortKey]?._.toString();
        if (string)
          return string;
      }
      return "";
    };
    const aString = getString(a);
    const bString = getString(b);
    return aString.localeCompare(bString);
  });
};

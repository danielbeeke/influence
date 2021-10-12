export const lastPart = (uri) => {
  const split = uri.split(/\/|#|\:/);
  return split.pop();
};
export const resolveLanguageItem = (items, langCode) => {
  return items.find((item) => item.lang === langCode) ?? items[0];
};
export const JsonLdProxy = (data, context, extraCommands = {}, defaultAliasses = []) => {
  if (typeof data !== "object")
    return data;
  const convertProp = (prop) => {
    if (prop.toString().includes(":")) {
      const propSplit = prop.toString().split(":");
      if (context?.[propSplit[0]]) {
        prop = prop.toString().replace(propSplit[0] + ":", context[propSplit[0]]);
      }
    }
    return prop;
  };
  return new Proxy(data, {
    get(target, prop, receiver) {
      if (prop === "_proxyType")
        return "JsonLdProxy";
      prop = convertProp(prop);
      if (prop === "$" && !("$" in extraCommands))
        return target;
      if (prop === "_alias")
        return defaultAliasses;
      if (prop === "_" && !("_" in extraCommands)) {
        const getFirst = (thing) => Array.isArray(thing) ? getFirst(resolveLanguageItem(thing, "en")) : thing?.["id"] ?? thing?.["value"] ?? thing;
        return JsonLdProxy(getFirst(target), context, extraCommands, defaultAliasses);
      }
      if (prop === "isProxy")
        return true;
      for (const [command, callback] of Object.entries(extraCommands)) {
        if (prop === command)
          return callback(target);
      }
      if (prop[0] === "*") {
        const lastPartToFind = prop.toString().substr(1);
        for (const key of Object.keys(target)) {
          if (lastPart(key) === lastPartToFind) {
            prop = key;
          }
        }
      }
      const isOurProperty = !Reflect.has({}, prop) && !Reflect.has([], prop) && Reflect.has(target, prop);
      if (defaultAliasses.length && !prop.toString().includes(":") && !Reflect.has({}, prop) && !Reflect.has([], prop)) {
        for (const defaultAlias of defaultAliasses) {
          const newProp = convertProp(defaultAlias + ":" + prop.toString());
          const isOurProperty2 = !Reflect.has({}, newProp) && !Reflect.has([], newProp) && Reflect.has(target, newProp);
          if (isOurProperty2 && Reflect.has(target, newProp) && target[newProp]) {
            return JsonLdProxy(target[newProp], context, extraCommands, defaultAliasses);
          }
        }
      }
      if (target[prop]?.[0]?.["@list"] && isOurProperty) {
        return JsonLdProxy(target[prop][0]["@list"], context, extraCommands, defaultAliasses);
      }
      if (isOurProperty && target[prop]) {
        return JsonLdProxy(target[prop], context, extraCommands, defaultAliasses);
      }
      if (["filter"].includes(prop.toString())) {
        const requestedMethod = Reflect.get(target, prop, receiver);
        return (...input) => {
          return requestedMethod.apply(target.map((item) => JsonLdProxy(item, context, extraCommands, defaultAliasses)), input);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value) {
      prop = convertProp(prop);
      target[prop] = value;
      return true;
    }
  });
};

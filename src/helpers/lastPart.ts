/**
 * Returns the last part of an RDF URI. (After the # or : or /)
 * @param uri 
 */
 export const lastPart = (uri) => {
    const split = uri.split(/\/|#/)
    return split.pop()
  }
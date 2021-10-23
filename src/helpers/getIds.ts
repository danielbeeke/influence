export const getIds = () => {
    const ids = decodeURI(location.pathname).substr(1).split(',').filter(Boolean)
    return ids
}
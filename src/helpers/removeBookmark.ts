export const removeBookmark = (url) => {
    let savedUrls = localStorage.saved ? JSON.parse(localStorage.saved) : []
    savedUrls = savedUrls.filter(item => item !== url)
    localStorage.saved = JSON.stringify(savedUrls)
}
export const cleanDate = (dateString: string) => {
    const matches = dateString?.match(/\d{4}/g)?.map(year => parseInt(year)) ?? []
    const year = Math.min(...matches)
    return year !== Infinity ? year : null
}

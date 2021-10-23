import { getIds } from "./getIds"

export const hasActivePerson = (search: string, columnIndex: number) => {
    const ids = getIds()
    return ids[columnIndex] === search
}
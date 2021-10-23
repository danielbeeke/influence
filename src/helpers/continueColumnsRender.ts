import { disableScroll, enableScroll } from '../helpers/disableScroll'
import { waitForScrollEnd } from '../helpers/waitForScrollEnd';

let runningScroll = false

const startTime = (new Date).getTime()
export const continueColumnsRender = async () => {
    const columns = [...document.querySelectorAll('.column')]

    if (!columns.length) return

    const lastColumn = columns.at(-1)

    const waiters = []
    const runTime = (new Date).getTime() - startTime

    for (const column of columns) {
        const activePerson = column.querySelector('.person.active')
        if (activePerson) {
            const top = (activePerson as HTMLElement).offsetTop - 20
            column.querySelector('.inner').scrollTo({ top: top, behavior: runTime < 2000 ? 'auto' : 'smooth' })
            waiters.push(waitForScrollEnd((column as HTMLElement)).then(() => {
                disableScroll(column.querySelector('.inner'), 'y')
            }))
        }
        else {
            enableScroll(column.querySelector('.inner'), 'y')
        }
    }

    await Promise.all(waiters)
    if (!runningScroll) {
        runningScroll = true

        setTimeout(() => {
            document.body.scrollTo({ left: document.body.scrollWidth, behavior: runTime < 2000 ? 'auto' : 'smooth' })
            waitForScrollEnd(document.body).then(() => {
                runningScroll = false
            })
        }, 600)
    }
}

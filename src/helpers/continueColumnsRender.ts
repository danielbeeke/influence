import { disableScroll, enableScroll } from '../helpers/disableScroll'
import { waitForScrollEnd } from '../helpers/waitForScrollEnd';

let runningScroll = false

const startTime = (new Date).getTime()
export const continueColumnsRender = async (forceDirectRender = false) => {
    const columns = [...document.querySelectorAll('.column')]

    if (!columns.length) return

    const waiters = []
    const runTime = (new Date).getTime() - startTime

    for (const column of columns) {
        const activePerson = column.querySelector('.person.active')
        if (activePerson) {
            const top = (activePerson as HTMLElement).offsetTop - 20
            const inner = column.querySelector('.inner')
            let behavior = runTime < 2000 ? 'auto' : 'smooth'
            if (forceDirectRender) behavior = 'auto'
            inner.scrollTo({ top: top, behavior: behavior })
            waiters.push(waitForScrollEnd((inner as HTMLElement)).then(() => {
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

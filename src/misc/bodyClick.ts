import { drawApp } from '../app'
import { disableScroll, enableScroll } from '../helpers/disableScroll'
import { waitForScrollEnd } from '../helpers/waitForScrollEnd';

let runningScroll = false

const startTime = (new Date).getTime()
export const continueColumnsRender = async () => {
    // console.trace()
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

document.body.addEventListener('click', (event: Event) => {
    const element = (event as any).target.nodeName !== 'A' ? (event as any).target.closest('a') : (event as any).target
    if (element) {
      const href = element.getAttribute('href')
      if (href && href[0] === '/') {
        event.preventDefault()
        const isActive = element.closest('.person')?.classList.contains('active')
        const isPerson = element.closest('.person')?.classList.contains('person')

        if (isPerson && isActive) {
            const columns = [...document.querySelectorAll('.column')]
            const clickedIndex = columns.indexOf(element.closest('.column'))
            
            if (clickedIndex === 1) {
                history.pushState(null, null, href)
                drawApp() 
            }
            else {
                for (const [index, column] of columns.entries()) {
                    if (index > clickedIndex) {
                        column.addEventListener('animationend', async () => {
                            history.pushState(null, null, href)
                            await drawApp()
                            continueColumnsRender()
                        }, { once: true })
                        column.classList.add('prepare-removal')
                    }
                }    
            }
        }
        else {
            history.pushState(null, null, href)
            drawApp()   
        }
      }
    }
})
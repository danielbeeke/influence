import { drawApp } from '../app'
import { continueColumnsRender } from '../helpers/continueColumnsRender'
import { deactivateColumnSearch } from '../templates/columnsRender'

document.body.addEventListener('click', (event: Event) => {
    const element = (event as any).target.nodeName !== 'A' ? (event as any).target.closest('a') : (event as any).target
    if (element) {
      const href = element.getAttribute('href')
      if (href && href[0] === '/') {
        event.preventDefault()
        const isActive = element.closest('.person')?.classList.contains('active')
        const isPerson = element.closest('.person')?.classList.contains('person')

        if (isPerson && !isActive) {
            element.closest('.person').classList.add('loading')
            setTimeout(continueColumnsRender, 400)
        }
        else if (isPerson && isActive) {
            element.closest('.person').classList.add('is-closing')
        }
        const columns = [...document.querySelectorAll('.column')]

        if (isPerson && isActive) {
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
                            deactivateColumnSearch(index - 1)
                            continueColumnsRender()
                            document.body.classList.remove('prepare-removal-column')
                        }, { once: true })
                        column.classList.add('prepare-removal')
                        document.body.classList.add('prepare-removal-column')
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
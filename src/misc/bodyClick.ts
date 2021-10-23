import { drawApp } from '../app'
import { continueColumnsRender } from '../helpers/continueColumnsRender'

document.body.addEventListener('click', (event: Event) => {
    const element = (event as any).target.nodeName !== 'A' ? (event as any).target.closest('a') : (event as any).target
    if (element) {
      const href = element.getAttribute('href')
      if (href && href[0] === '/') {
        event.preventDefault()
        const isActive = element.closest('.person')?.classList.contains('active')
        const isPerson = element.closest('.person')?.classList.contains('person')

        if (isPerson && !isActive) setTimeout(continueColumnsRender, 400)

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
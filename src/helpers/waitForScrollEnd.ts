export function waitForScrollEnd (element: Window | HTMLElement = window) {
    let last_changed_frame = 0
    let last_x = element === window ? window.scrollY : (element as HTMLElement).scrollTop
    let last_y = element === window ? window.scrollX : (element as HTMLElement).scrollLeft

    return new Promise( resolve => {
        function tick(frames) {
            const yProp = element === window ? window.scrollY : (element as HTMLElement).scrollTop
            const xProp = element === window ? window.scrollX : (element as HTMLElement).scrollLeft
        
            // We requestAnimationFrame either for 500 frames or until 20 frames with
            // no change have been observed.
            if (frames >= 500 || frames - last_changed_frame > 20) {
                resolve(null)
            } else {
                if (xProp != last_x || yProp != last_y) {
                    last_changed_frame = frames

                    last_x = xProp
                    last_y = yProp
                }
                
                requestAnimationFrame(tick.bind(null, frames + 1))
            }
        }
        tick(0)
    })
}
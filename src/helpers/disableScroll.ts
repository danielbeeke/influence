// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

const directionMap = new Map()
const elementMap = new Map()

const preventDefault = (e) => {
  const direction = elementMap.get(e.target)

  if (!direction) {
    e.preventDefault();
    return
  }

  const start = directionMap.get(e.target)

  const a = e.touches[0]['client' + direction.toUpperCase()]
  const b = start[direction]
  const diff = Math.abs(a - b)

  if (diff > 60) {
    e.preventDefault();
  }
}

function addDirectionHandler (e) {
  directionMap.set(e.target, {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  })
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
export function disableScroll(element, direction) {
    elementMap.set(element, direction)
    element.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    element.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    element.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    element.addEventListener('touchstart', addDirectionHandler, wheelOpt); // mobile
    element.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
export function enableScroll(element) {
    element.removeEventListener('DOMMouseScroll', preventDefault, false);
    element.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
    element.removeEventListener('touchmove', preventDefault, wheelOpt);
    element.removeEventListener('touchstart', addDirectionHandler, wheelOpt); // mobile
    element.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}
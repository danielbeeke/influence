// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

const preventDefaultCreator = (direction) => (e) => {
  if (!direction) {
    e.preventDefault()
    return
  }

  const xMovement = Math.abs(e.touches[0].clientX - e.target._startTouch.x)
  const yMovement = Math.abs(e.touches[0].clientY - e.target._startTouch.y)

  if (
    direction === 'y' && xMovement < yMovement * 3 ||
    direction === 'x' && yMovement < xMovement * 3
  ) {
    if (e.cancelable) e.preventDefault()
  }
}

const preventDefaultX = preventDefaultCreator('x')
const preventDefaultY = preventDefaultCreator('y')
const preventDefault = preventDefaultCreator(null)

function addDirectionHandler (e) {
  e.target._startTouch = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  }
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
    element.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    element.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    element.addEventListener('touchmove', direction === 'x' ? preventDefaultX : preventDefaultY, wheelOpt); // mobile
    element.addEventListener('touchstart', addDirectionHandler, wheelOpt); // mobile
    element.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
export function enableScroll(element, direction) {
    element.removeEventListener('DOMMouseScroll', preventDefault, false);
    element.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
    element.removeEventListener('touchmove', direction === 'x' ? preventDefaultX : preventDefaultY, wheelOpt);
    element.removeEventListener('touchstart', addDirectionHandler, wheelOpt); // mobile
    element.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}
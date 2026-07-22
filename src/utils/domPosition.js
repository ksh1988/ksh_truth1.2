/**
 * Waits for a number of milliseconds.
 * @param {*} ms - Input value used by wait.
 * @returns {*} The computed result or the documented side effect.
 */
export const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

/**
 * Waits for two animation frames so DOM rendering can settle.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
export const waitForRender = () => new Promise((resolve) => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
})

/**
 * Scrolls an element into the vertical center of the viewport.
 * @param {*} element - Input value used by scrollToCenter.
 * @returns {*} The computed result or the documented side effect.
 */
export const scrollToCenter = (element) => {
  if (element?.isConnected) element.scrollIntoView({ behavior: 'auto', block: 'center' })
}

/**
 * Scrolls to a target immediately and keeps it centered while its lazy media changes layout.
 * @param {Element} element - Rendered content node that should remain in view.
 * @param {number} duration - Maximum correction lifetime in milliseconds.
 * @returns {Function} Stops the pending layout observer and input listeners.
 */
export const scrollToCenterStable = (element, duration = 8000) => {
  if (!element?.isConnected) return () => {}

  let observer = null
  let frameId = 0
  let timerId = 0
  let stopped = false
  const inputEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown']

  const stop = () => {
    if (stopped) return
    stopped = true
    observer?.disconnect()
    window.cancelAnimationFrame(frameId)
    window.clearTimeout(timerId)
    inputEvents.forEach((eventName) => window.removeEventListener(eventName, stop, true))
  }

  const correctPosition = () => {
    if (stopped || !element.isConnected) {
      stop()
      return
    }

    const rect = element.getBoundingClientRect()
    const targetCenter = rect.top + rect.height / 2
    const viewportCenter = window.innerHeight / 2
    if (Math.abs(targetCenter - viewportCenter) > 8) scrollToCenter(element)
  }

  const scheduleCorrection = () => {
    window.cancelAnimationFrame(frameId)
    frameId = window.requestAnimationFrame(() => {
      frameId = window.requestAnimationFrame(correctPosition)
    })
  }

  scrollToCenter(element)
  if ('ResizeObserver' in window) {
    const layoutRoot = element.closest('.content') || document.body
    observer = new ResizeObserver(scheduleCorrection)
    observer.observe(layoutRoot)
    if (layoutRoot !== element) observer.observe(element)
  }
  scheduleCorrection()

  inputEvents.forEach((eventName) => window.addEventListener(eventName, stop, true))
  timerId = window.setTimeout(stop, duration)
  return stop
}


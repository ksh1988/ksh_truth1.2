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
 * Checks whether one element appears before another target element.
 * @param {*} element - Input value used by isBeforeTarget.
 * @param {*} target - Input value used by isBeforeTarget.
 * @returns {*} The computed result or the documented side effect.
 */
const isBeforeTarget = (element, target) => Boolean(
  element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING,
)

/**
 * Waits until one image has loaded, failed, or decoded.
 * @param {*} image - Input value used by waitForImage.
 * @returns {*} The computed result or the documented side effect.
 */
const waitForImage = (image) => {
  if (image.complete) return image.decode?.().catch(() => {}) || Promise.resolve()
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  }).then(() => image.decode?.().catch(() => {}))
}

/**
 * Waits for images before a target so scrolling lands accurately.
 * @param {*} root - Input value used by waitForImagesBeforeTarget.
 * @param {*} target - Input value used by waitForImagesBeforeTarget.
 * @param {*} timeout - Input value used by waitForImagesBeforeTarget.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
export const waitForImagesBeforeTarget = async (root, target, timeout = 8000) => {
  window.dispatchEvent(new CustomEvent('search-load-media-before-target', { detail: { target } }))
  await waitForRender()

  const images = [...root.querySelectorAll('img')].filter((image) => isBeforeTarget(image, target))
  if (!images.length) return

  await Promise.race([
    Promise.all(images.map(waitForImage)),
    wait(timeout),
  ])
  await waitForRender()
}


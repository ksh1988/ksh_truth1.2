export const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const waitForRender = () => new Promise((resolve) => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
})

export const scrollToCenter = (element) => {
  if (element?.isConnected) element.scrollIntoView({ behavior: 'auto', block: 'center' })
}

const isBeforeTarget = (element, target) => Boolean(
  element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING,
)

const waitForImage = (image) => {
  if (image.complete) return image.decode?.().catch(() => {}) || Promise.resolve()
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  }).then(() => image.decode?.().catch(() => {}))
}

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

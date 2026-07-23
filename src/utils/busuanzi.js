const BUSUANZI_SCRIPT_ID = 'busuanzi-counter-script'
const BUSUANZI_SCRIPT_URL = 'https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js'

let busuanziLoadPromise = null

/**
 * Loads the visitor counter only after Vue has rendered its target elements.
 * @param {Document} targetDocument - Browser document that receives the script element.
 * @returns {Promise<boolean>} Resolves true after the counter script loads.
 */
export function loadBusuanziCounter(targetDocument = document) {
  if (typeof window === 'undefined' || !targetDocument) return Promise.resolve(false)
  if (busuanziLoadPromise) return busuanziLoadPromise

  const existingScript = targetDocument.getElementById(BUSUANZI_SCRIPT_ID)
  if (existingScript?.dataset.loaded === 'true') return Promise.resolve(true)

  busuanziLoadPromise = new Promise((resolve, reject) => {
    const script = existingScript || targetDocument.createElement('script')

    const handleLoad = () => {
      script.dataset.loaded = 'true'
      resolve(true)
    }

    const handleError = () => {
      busuanziLoadPromise = null
      script.remove()
      reject(new Error('Unable to load the visitor counter.'))
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.id = BUSUANZI_SCRIPT_ID
      script.src = BUSUANZI_SCRIPT_URL
      script.async = true
      targetDocument.head.appendChild(script)
    }
  })

  return busuanziLoadPromise
}

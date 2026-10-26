const ENDPOINT = 'https://kshtruth.goatcounter.com'
export const HISTORICAL_SITE_VIEWS = 4300
let visitSent = false

// Count once per page load, not once per language or section change.
export function recordSiteVisit() {
  if (visitSent || !['kshtruth.com', 'www.kshtruth.com'].includes(location.hostname)) return
  visitSent = true
  const pixel = new Image()
  const timeout = setTimeout(cleanup, 12000)
  function cleanup() {
    clearTimeout(timeout)
    pixel.onload = null
    pixel.onerror = null
  }
  pixel.onload = cleanup
  pixel.onerror = cleanup
  const params = new URLSearchParams({ p: '/', t: 'KSH Truth', r: document.referrer, rnd: String(Date.now()) })
  pixel.src = `${ENDPOINT}/count?${params}`
}

export function parseSiteViews(value) {
  // The public counter uses spaces as thousands separators.
  const normalized = String(value ?? '').replace(/[\s,]/g, '')
  if (!/^\d+$/.test(normalized)) throw new Error('Invalid visitor count')
  const count = Number(normalized)
  if (!Number.isSafeInteger(count + HISTORICAL_SITE_VIEWS)) throw new Error('Invalid visitor count')
  return HISTORICAL_SITE_VIEWS + count
}

export async function readSiteViews(signal) {
  const response = await fetch(`${ENDPOINT}/counter/TOTAL.json`, { signal, credentials: 'omit' })
  if (!response.ok) throw new Error(`Visitor counter HTTP ${response.status}`)
  const data = await response.json()
  return parseSiteViews(data.count)
}

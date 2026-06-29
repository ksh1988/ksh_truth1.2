/**
 * Extracts a file extension from a media URL.
 * @param {string} src - Media URL, optionally with query or hash.
 * @returns {string} File extension, or jpg when it cannot be detected.
 */
const extensionFrom = (src) => {
  const clean = String(src).split('?')[0].split('#')[0]
  const extension = clean.match(/\.([a-zA-Z0-9]{2,5})$/)?.[1]
  return extension || 'jpg'
}

/**
 * Sanitizes text so it can be used as part of a filename.
 * @param {string} value - Raw title or filename part.
 * @returns {string} Safe short filename part.
 */
const safeFilePart = (value) => String(value || 'image')
  .replace(/[\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, '-')
  .slice(0, 60)

/**
 * Builds a download filename for one media item.
 * @param {object} params - Filename parameters.
 * @param {object} params.item - Entity that owns the image.
 * @param {string} params.lang - Current language code.
 * @param {string} params.src - Media URL.
 * @param {number} params.index - Image index within the entity.
 * @returns {string} Filename with extension.
 */
export const mediaFileName = ({ item, lang, src, index }) => {
  const title = item.title?.[lang] || item.title || item.event?.[lang] || item.event || 'image'
  return safeFilePart(title) + '-' + (index + 1) + '.' + extensionFrom(src)
}

/**
 * Detects whether the current browser is likely a mobile browser.
 * @returns {boolean} true when touch/mobile signals are present.
 */
const isMobileBrowser = () => window.matchMedia?.('(max-width: 820px)').matches
  || /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent || '')

/**
 * Creates a temporary link and triggers browser download.
 * @param {string} href - Blob URL or remote URL.
 * @param {string} filename - Suggested filename.
 * @returns {void}
 */
const clickDownloadLink = (href, filename) => {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/**
 * Creates an ASCII-only fallback filename.
 * @param {string} filename - Original filename.
 * @returns {string} ASCII-safe filename.
 */
const asciiFallbackName = (filename) => String(filename || 'image')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '') || 'image'

/**
 * Builds a Content-Disposition value for attachment download.
 * @param {string} filename - Original filename.
 * @returns {string} Attachment response header value.
 */
const attachmentDisposition = (filename) => {
  const fallback = asciiFallbackName(filename)
  return 'attachment; filename="' + fallback + '"; filename*=UTF-8\'\'' + encodeURIComponent(filename)
}

/**
 * Adds OSS response header parameters to a media URL.
 * @param {string} src - Original media URL.
 * @param {string} filename - Suggested filename.
 * @returns {string} URL with response-content-disposition parameter, or original URL if parsing fails.
 */
const withAttachmentHeader = (src, filename) => {
  try {
    const url = new URL(src, window.location.href)
    url.searchParams.set('response-content-disposition', attachmentDisposition(filename))
    return url.toString()
  } catch {
    return src
  }
}

/**
 * Fetches a media URL as a Blob for download or Web Share.
 * @param {string} src - Media URL.
 * @returns {Promise<Blob>} Image blob returned by the server.
 */
const fetchMediaBlob = async (src) => {
  const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
  if (!response.ok) throw new Error('download failed')
  return response.blob()
}

/**
 * Builds a browser File from a downloaded Blob.
 * @param {Blob} blob - Downloaded image blob.
 * @param {string} filename - Suggested filename.
 * @returns {File} File object accepted by Web Share API.
 */
const fileFromBlob = (blob, filename) => new File([blob], filename, {
  type: blob.type || 'image/jpeg',
})

/**
 * Shares one image file through the mobile system share sheet when supported.
 * @param {Blob} blob - Downloaded image blob.
 * @param {string} filename - Suggested filename.
 * @returns {Promise<boolean>} true when native sharing was invoked successfully.
 */
const shareMediaOnMobile = async (blob, filename) => {
  if (!isMobileBrowser()) return false
  if (!window.navigator.share || !window.navigator.canShare || typeof File === 'undefined') return false

  const file = fileFromBlob(blob, filename)
  const payload = { files: [file], title: filename }
  if (!window.navigator.canShare(payload)) return false

  await window.navigator.share(payload)
  return true
}

/**
 * Saves a Blob through the normal browser download path.
 * @param {Blob} blob - Downloaded image blob.
 * @param {string} filename - Suggested filename.
 * @returns {void}
 */
const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  clickDownloadLink(objectUrl, filename)
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

/**
 * Downloads media on desktop and uses native mobile sharing when available.
 * @param {object} params - Download parameters.
 * @param {string} params.src - Media URL.
 * @param {string} params.filename - Suggested filename.
 * @returns {Promise<void>} Resolves after download/share action has been triggered.
 */
export const downloadMedia = async ({ src, filename }) => {
  try {
    const blob = await fetchMediaBlob(src)
    if (await shareMediaOnMobile(blob, filename)) return
    downloadBlob(blob, filename)
  } catch (error) {
    if (error?.name === 'AbortError') return
    clickDownloadLink(withAttachmentHeader(src, filename), filename)
  }
}

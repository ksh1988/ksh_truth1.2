const extensionFrom = (src) => {
  const clean = String(src).split('?')[0].split('#')[0]
  const extension = clean.match(/\.([a-zA-Z0-9]{2,5})$/)?.[1]
  return extension || 'jpg'
}

const safeFilePart = (value) => String(value || 'image')
  .replace(/[\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, '-')
  .slice(0, 60)

export const mediaFileName = ({ item, lang, src, index }) => {
  const title = item.title?.[lang] || item.title || item.event?.[lang] || item.event || 'image'
  return safeFilePart(title) + '-' + (index + 1) + '.' + extensionFrom(src)
}

const clickDownloadLink = (href, filename) => {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const withAttachmentHeader = (src, filename) => {
  try {
    const url = new URL(src, window.location.href)
    url.searchParams.set('response-content-disposition', 'attachment; filename="' + filename + '"')
    return url.toString()
  } catch {
    return src
  }
}

export const downloadMedia = async ({ src, filename }) => {
  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error('download failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    clickDownloadLink(objectUrl, filename)
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch {
    clickDownloadLink(withAttachmentHeader(src, filename), filename)
  }
}

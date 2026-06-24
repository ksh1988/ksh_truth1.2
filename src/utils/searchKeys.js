const stableString = (value) => {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const hashText = (value) => {
  const text = stableString(value)
  let hash = 0
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36)
}

export const searchKeyFor = (item, index = 0) => {
  if (item?.id) return String(item.id)
  if (item?.index) return String(item.index)
  const base = item?.title || item?.event || item?.description || item || index
  return `auto-${hashText(base)}`
}

export const searchKeyForMatrixRow = (contentId, sectionId, row, rowIndex = 0) => {
  if (row?.id) return String(row.id)
  return `matrix-${contentId || 'content'}-${sectionId || 'section'}-${hashText(row || rowIndex)}`
}

export const cssEscape = (value) => {
  if (window.CSS?.escape) return window.CSS.escape(String(value))
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&')
}
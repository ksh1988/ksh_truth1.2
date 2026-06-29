/**
 * Converts a value into a stable string for hashing.
 * @param {*} value - Input value used by stableString.
 * @returns {*} The computed result or the documented side effect.
 */
const stableString = (value) => {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/**
 * Creates a short deterministic hash from a value.
 * @param {*} value - Input value used by hashText.
 * @returns {*} The computed result or the documented side effect.
 */
const hashText = (value) => {
  const text = stableString(value)
  let hash = 0
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36)
}

/**
 * Creates a stable search key for a normal content item.
 * @param {*} item - Input value used by searchKeyFor.
 * @param {*} index - Input value used by searchKeyFor.
 * @returns {*} The computed result or the documented side effect.
 */
export const searchKeyFor = (item, index = 0) => {
  if (item?.id) return String(item.id)
  if (item?.index) return String(item.index)
  const base = item?.title || item?.event || item?.description || item || index
  return 'auto-' + hashText(base)
}

/**
 * Creates a stable search key for a matrix row.
 * @param {*} contentId - Input value used by searchKeyForMatrixRow.
 * @param {*} sectionId - Input value used by searchKeyForMatrixRow.
 * @param {*} row - Input value used by searchKeyForMatrixRow.
 * @param {*} rowIndex - Input value used by searchKeyForMatrixRow.
 * @returns {*} The computed result or the documented side effect.
 */
export const searchKeyForMatrixRow = (contentId, sectionId, row, rowIndex = 0) => {
  if (row?.id) return String(row.id)
  return 'matrix-' + (contentId || 'content') + '-' + (sectionId || 'section') + '-' + hashText(row || rowIndex)
}

/**
 * Escapes dynamic values before using them in CSS selectors.
 * @param {*} value - Input value used by cssEscape.
 * @returns {*} The computed result or the documented side effect.
 */
export const cssEscape = (value) => {
  if (window.CSS?.escape) return window.CSS.escape(String(value))
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\$&')
}


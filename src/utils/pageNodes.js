import { entriesFor, itemTitle } from './contentHelpers'
import { searchKeyFor, searchKeyForMatrixRow } from './searchKeys'

/**
 * Builds right-side page-node navigation entries for current content.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
export const nodesForContent = ({ content, lang, timelineEntries = [] }) => {
  if (!content) return []

  if (content.layout === 'timeline') {
    return timelineEntries.map((item, index) => ({
      key: searchKeyFor(item, index),
      label: itemTitle(item, lang) || String(index + 1),
    }))
  }

  if (content.matrix_sections) {
    return [{
      key: content.id || 'matrix-content',
      label: itemTitle(content, lang) || 'Matrix',
    }]
  }

  return entriesFor(content, lang).map((item, index) => ({
    key: searchKeyFor(item, index),
    label: itemTitle(item, lang) || String(index + 1),
  }))
}


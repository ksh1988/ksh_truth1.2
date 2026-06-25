import { entriesFor, itemTitle } from './contentHelpers'
import { searchKeyFor } from './searchKeys'

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

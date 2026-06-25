import { entriesFor, isVisibleForLanguage, visibleRowsFor } from './contentHelpers'
import { localizeValue } from './localization'
import { searchKeyFor, searchKeyForMatrixRow } from './searchKeys'

const SKIPPED_KEYS = new Set(['imgs', 'url', 'src', 'link', 'videos', 'internal_link', 'zh_only'])
const LOCALIZED_KEYS = new Set(['zh', 'ko', 'en', 'shared'])

const normalize = (value) => String(value || '').trim().toLowerCase()

const cleanText = (value) => String(value || '')
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/==(.+?)==/g, '$1')
  .replace(/\*/g, '')

const collectText = (value, lang, bucket = []) => {
  if (value == null || !isVisibleForLanguage(value, lang)) return bucket

  if (typeof value === 'string' || typeof value === 'number') {
    bucket.push(cleanText(value))
    return bucket
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, lang, bucket))
    return bucket
  }

  if (typeof value === 'object') {
    const localized = localizeValue(value, lang)
    if (localized && localized !== value) collectText(localized, lang, bucket)

    Object.entries(value).forEach(([key, child]) => {
      if (!SKIPPED_KEYS.has(key) && !LOCALIZED_KEYS.has(key)) collectText(child, lang, bucket)
    })
  }

  return bucket
}

const contentMatches = (content, lang, query) => {
  const needle = normalize(query)
  if (!needle) return false
  return collectText(content, lang).some((text) => normalize(text).includes(needle))
}

const firstSnippet = (content, lang, query) => {
  const needle = normalize(query)
  const source = collectText(content, lang).find((text) => normalize(text).includes(needle)) || ''
  if (!source) return ''

  const index = normalize(source).indexOf(needle)
  const start = Math.max(0, index - 34)
  const end = Math.min(source.length, index + query.length + 46)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < source.length ? '...' : ''
  return `${prefix}${source.slice(start, end)}${suffix}`
}

const mediaSourceFor = (content, lang) => {
  if (content?.imgs) return content
  const firstWithImages = entriesFor(content, lang).find((item) => item?.imgs)
  return firstWithImages || content
}

const itemLabel = (item, lang) => localizeValue(item?.title || item?.event || item?.label, lang)

const resultFrom = ({ tab, category = null, subTab = null, item = null, itemIndex = 0, content, lang, query, focusKey = null, titleOverride = '' }) => {
  const path = [tab.label, category?.label, subTab?.label]
    .filter(Boolean)
    .map((label) => localizeValue(label, lang))
  const ownFocusKey = focusKey || (item ? searchKeyFor(item, itemIndex) : null)
  const title = titleOverride || itemLabel(item, lang) || path[path.length - 1] || localizeValue(tab.label, lang)

  return {
    id: [tab.id, category?.id, subTab?.id, ownFocusKey || title].filter(Boolean).join('__'),
    tab,
    category,
    subTab,
    item,
    focusKey: ownFocusKey,
    path,
    title: cleanText(title),
    snippet: firstSnippet(content, lang, query),
    mediaItem: mediaSourceFor(item || content, lang),
  }
}

const pushMatrixResults = ({ results, tab, category = null, subTab, content, lang, query }) => {
  let matched = false
  ;(content.matrix_sections || []).forEach((section) => {
    ;visibleRowsFor(section, lang).forEach((row, rowIndex) => {
      if (contentMatches(row, lang, query)) {
        matched = true
        results.push(resultFrom({
          tab,
          category,
          subTab,
          content: row,
          lang,
          query,
          focusKey: searchKeyForMatrixRow(content.id, section.id, row, rowIndex),
          titleOverride: localizeValue(section.title || section.label || subTab?.label, lang),
        }))
      }
    })
  })
  return matched
}

const pushContentResults = ({ results, tab, category = null, subTab = null, content, lang, query }) => {
  const matchedMatrix = content?.matrix_sections
    ? pushMatrixResults({ results, tab, category, subTab, content, lang, query })
    : false
  const entries = entriesFor(content, lang)
  let matchedChild = false

  entries.forEach((item, index) => {
    if (contentMatches(item, lang, query)) {
      matchedChild = true
      results.push(resultFrom({ tab, category, subTab, item, itemIndex: index, content: item, lang, query }))
    }
  })

  const ownContent = { ...content, entries: [], items: [], events: [], matrix_sections: [] }
  if (!matchedChild && !matchedMatrix && contentMatches(ownContent, lang, query)) {
    results.push(resultFrom({ tab, category, subTab, content, lang, query }))
  }
}

export const searchSiteSections = (tabs, lang, query) => {
  const needle = normalize(query)
  if (!needle) return []

  const results = []

  tabs.forEach((tab) => {
    const hasNestedSections = Boolean(tab.categories?.length || tab.sub_tabs?.length)
    if (!hasNestedSections) pushContentResults({ results, tab, content: tab, lang, query })

    ;(tab.categories || []).forEach((category) => {
      ;(category.sub_tabs || []).forEach((subTab) => {
        const content = { tabLabel: tab.label, categoryLabel: category.label, ...subTab }
        pushContentResults({ results, tab, category, subTab, content, lang, query })
      })
    })

    ;(tab.sub_tabs || []).forEach((subTab) => {
      const content = { tabLabel: tab.label, ...subTab }
      pushContentResults({ results, tab, subTab, content, lang, query })
    })
  })

  const uniqueResults = []
  const seen = new Set()

  results.forEach((result) => {
    const key = result.focusKey || result.id
    if (seen.has(key)) return
    seen.add(key)
    uniqueResults.push(result)
  })

  return uniqueResults
}
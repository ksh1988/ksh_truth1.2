import { entriesFor, isVisibleForLanguage, visibleRowsFor } from './contentHelpers'
import { localizeValue } from './localization'
import { searchKeyFor, searchKeyForMatrixRow } from './searchKeys'

const SKIPPED_KEYS = new Set(['imgs', 'url', 'src', 'link', 'internal_link', 'zh_only'])
const LOCALIZED_KEYS = new Set(['zh', 'ko', 'en', 'shared'])

/**
 * Normalizes a value for case-insensitive search comparison.
 * @param {*} value - Input value used by normalize.
 * @returns {*} The computed result or the documented side effect.
 */
const normalize = (value) => String(value || '').trim().toLowerCase()

/**
 * Removes lightweight formatting marks from text before display or search.
 * @param {*} value - Input value used by cleanText.
 * @returns {*} The computed result or the documented side effect.
 */
const cleanText = (value) => String(value || '')
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/==(.+?)==/g, '$1')
  .replace(/\*/g, '')

/**
 * Recursively collects searchable text from a content value.
 * @param {*} value - Input value used by collectText.
 * @param {*} lang - Input value used by collectText.
 * @param {*} bucket - Input value used by collectText.
 * @returns {*} The computed result or the documented side effect.
 */
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

/**
 * Checks whether a content block contains the current search query.
 * @param {*} content - Input value used by contentMatches.
 * @param {*} lang - Input value used by contentMatches.
 * @param {*} query - Input value used by contentMatches.
 * @returns {*} The computed result or the documented side effect.
 */
const contentMatches = (content, lang, query) => {
  const needle = normalize(query)
  if (!needle) return false
  return collectText(content, lang).some((text) => normalize(text).includes(needle))
}

/**
 * Builds a short search-result snippet around the first matching text.
 * @param {*} content - Input value used by firstSnippet.
 * @param {*} lang - Input value used by firstSnippet.
 * @param {*} query - Input value used by firstSnippet.
 * @returns {*} The computed result or the documented side effect.
 */
const firstSnippet = (content, lang, query) => {
  const needle = normalize(query)
  const source = collectText(content, lang).find((text) => normalize(text).includes(needle)) || ''
  if (!source) return ''

  const index = normalize(source).indexOf(needle)
  const start = Math.max(0, index - 34)
  const end = Math.min(source.length, index + query.length + 46)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < source.length ? '...' : ''
  return prefix + source.slice(start, end) + suffix
}

/**
 * Finds the entity that should provide preview media for a search result.
 * @param {*} content - Input value used by mediaSourceFor.
 * @param {*} lang - Input value used by mediaSourceFor.
 * @returns {*} The computed result or the documented side effect.
 */
const mediaSourceFor = (content, lang) => {
  if (content?.imgs || content?.videos) return content
  const firstWithMedia = entriesFor(content, lang).find((item) => item?.imgs || item?.videos)
  return firstWithMedia || content
}

/**
 * Returns the localized display label for an item.
 * @param {*} item - Input value used by itemLabel.
 * @param {*} lang - Input value used by itemLabel.
 * @returns {*} The computed result or the documented side effect.
 */
const itemLabel = (item, lang) => localizeValue(item?.title || item?.event || item?.label, lang)

/**
 * Builds one normalized search result object.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
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

/**
 * Adds matching matrix rows into the search result list.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
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

/**
 * Adds matching entries or page-level content into the search result list.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
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

/**
 * Searches all tabs and returns de-duplicated site search results.
 * @param {*} tabs - Input value used by searchSiteSections.
 * @param {*} lang - Input value used by searchSiteSections.
 * @param {*} query - Input value used by searchSiteSections.
 * @returns {*} The computed result or the documented side effect.
 */
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


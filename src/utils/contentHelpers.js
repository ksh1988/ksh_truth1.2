import { localizeValue } from './localization'

/**
 * Documents the isVisibleForLanguage helper.
 * @param {*} item - Input value used by isVisibleForLanguage.
 * @param {*} lang - Input value used by isVisibleForLanguage.
 * @returns {*} The computed result or the documented side effect.
 */
export const isVisibleForLanguage = (item, lang) => lang === 'zh' || item?.zh_only !== true

/**
 * Checks whether a content node should be rendered in navigation and search.
 * @param {object} item - Content node from site_data.json.
 * @returns {boolean} True when visible is omitted for old data, or explicitly set to true.
 */
export const isVisibleContent = (item) => item?.visible === undefined || item.visible === true

/**
 * Documents the entriesFor helper.
 * @param {*} content - Input value used by entriesFor.
 * @param {*} lang - Input value used by entriesFor.
 * @returns {*} The computed result or the documented side effect.
 */
export const entriesFor = (content, lang = 'zh') => (content?.entries || content?.items || content?.events || [])
  .filter((item) => isVisibleContent(item) && isVisibleForLanguage(item, lang))

/**
 * Documents the itemTitle helper.
 * @param {*} item - Input value used by itemTitle.
 * @param {*} lang - Input value used by itemTitle.
 * @returns {*} The computed result or the documented side effect.
 */
export const itemTitle = (item, lang) => localizeValue(item.title || item.event || item.label, lang)

/**
 * Documents the itemDescription helper.
 * @param {*} item - Input value used by itemDescription.
 * @param {*} lang - Input value used by itemDescription.
 * @returns {*} The computed result or the documented side effect.
 */
export const itemDescription = (item, lang) => localizeValue(item.description, lang)

/**
 * Documents the formatDate helper.
 * @param {*} date - Input value used by formatDate.
 * @returns {*} The computed result or the documented side effect.
 */
export const formatDate = (date) => {
  const raw = String(date || '')
  return /^d{8}$/.test(raw) ? raw.slice(0, 4) + '.' + raw.slice(4, 6) + '.' + raw.slice(6, 8) : raw
}

/**
 * Documents the visibleRowsFor helper.
 * @param {*} section - Input value used by visibleRowsFor.
 * @param {*} lang - Input value used by visibleRowsFor.
 * @returns {*} The computed result or the documented side effect.
 */
export const visibleRowsFor = (section, lang = 'zh') => (section?.rows || [])
  .filter((row) => isVisibleContent(row) && isVisibleForLanguage(row, lang))

/**
 * Documents the yearLabel helper.
 * @param {*} year - Input value used by yearLabel.
 * @param {*} lang - Input value used by yearLabel.
 * @returns {*} The computed result or the documented side effect.
 */
export const yearLabel = (year, lang) => {
  if (lang === 'zh') return year + '年'
  if (lang === 'ko') return year
  return year
}


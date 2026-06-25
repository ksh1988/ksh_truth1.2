import { localizeValue } from './localization'

export const isVisibleForLanguage = (item, lang) => lang === 'zh' || item?.zh_only !== true

export const entriesFor = (content, lang = 'zh') => (content?.entries || content?.items || content?.events || [])
  .filter((item) => isVisibleForLanguage(item, lang))

export const itemTitle = (item, lang) => localizeValue(item.title || item.event || item.label, lang)

export const itemDescription = (item, lang) => localizeValue(item.description, lang)

export const formatDate = (date) => {
  const raw = String(date || '')
  return /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)}` : raw
}

export const displayFieldsFor = (item) => Object.entries(item).filter(([key, value]) =>
  !['id', 'time', 'title', 'event', 'description', 'imgs', 'link', 'videos', 'extras', 'index', 'zh_only'].includes(key)
  && value !== ''
  && value != null
)

export const visibleRowsFor = (section, lang = 'zh') => (section?.rows || [])
  .filter((row) => isVisibleForLanguage(row, lang))

export const yearLabel = (year, lang) => {
  if (lang === 'zh') return `${year}年`
  if (lang === 'ko') return `${year}년`
  return year
}

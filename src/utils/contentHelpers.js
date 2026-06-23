import { localizeValue } from './localization'

export const entriesFor = (content) => content?.entries || content?.items || content?.events || []

export const itemTitle = (item, lang) => localizeValue(item.title || item.event || item.label, lang)

export const itemDescription = (item, lang) => localizeValue(item.description, lang)

export const formatDate = (date) => {
  const raw = String(date || '')
  return /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)}` : raw
}

export const displayFieldsFor = (item) => Object.entries(item).filter(([key, value]) =>
  !['id', 'time', 'title', 'event', 'description', 'imgs', 'link', 'videos', 'extras', 'index'].includes(key)
  && value !== ''
  && value != null
)

export const yearLabel = (year, lang) => {
  if (lang === 'zh') return `${year}年`
  if (lang === 'ko') return `${year}년`
  return year
}

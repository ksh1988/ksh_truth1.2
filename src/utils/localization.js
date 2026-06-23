export const localizeValue = (value, lang) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] ?? value.zh ?? value.en ?? value.ko ?? ''
  }
  return value ?? ''
}

export const localizedHtml = (value, lang) => String(localizeValue(value, lang))
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/==(.+?)==/g, '<mark>$1</mark>')
  .replace(/\n/g, '<br>')

/**
 * Reads the current-language value from localized data.
 * @param {*} value - Input value used by localizeValue.
 * @param {*} lang - Input value used by localizeValue.
 * @returns {*} The computed result or the documented side effect.
 */
export const localizeValue = (value, lang) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] ?? value.zh ?? value.en ?? value.ko ?? ''
  }
  return value ?? ''
}

/**
 * Returns localized text as a string for HTML rendering.
 * @param {*} value - Input value used by localizedHtml.
 * @param {*} lang - Input value used by localizedHtml.
 * @returns {*} The computed result or the documented side effect.
 */
export const localizedHtml = (value, lang) => String(localizeValue(value, lang))


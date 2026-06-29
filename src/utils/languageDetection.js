const LANGUAGE_STORAGE_KEY = 'kshtruth-language'

const CHINA_TIME_ZONES = new Set([
  'Asia/Shanghai',
  'Asia/Chongqing',
  'Asia/Harbin',
  'Asia/Urumqi',
  'Asia/Hong_Kong',
  'Asia/Macau',
  'Asia/Taipei',
])

const KOREA_TIME_ZONES = new Set(['Asia/Seoul'])

/**
 * Checks whether browser storage can be used safely.
 * @returns {Storage|null} Local storage object when available.
 */
const storage = () => {
  try { return typeof window !== 'undefined' ? window.localStorage : null }
  catch { return null }
}

/**
 * Returns the browser time zone when available.
 * @returns {string} IANA time zone name or an empty string.
 */
const browserTimeZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' }
  catch { return '' }
}

/**
 * Checks whether a language code exists in the site config.
 * @param {string} lang - Candidate language code.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {boolean} True when the language can be used by the site.
 */
const isSupported = (lang, supportedLanguages) => supportedLanguages.includes(lang)

/**
 * Returns the fallback language used outside China-related and Korean time zones.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {string} English when available, otherwise the first configured language.
 */
const defaultLanguage = (supportedLanguages) => (isSupported('en', supportedLanguages) ? 'en' : supportedLanguages[0] || 'en')

/**
 * Clears any language choice saved by older site versions.
 * @returns {void} Removes the legacy language key from browser storage.
 */
export const clearSavedLanguage = () => {
  storage()?.removeItem(LANGUAGE_STORAGE_KEY)
}

/**
 * Detects the initial language only from the visitor's local time zone.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {string} zh for China-related time zones, ko for Korea, and en for all others.
 */
export const detectInitialLanguage = (supportedLanguages = []) => {
  const timeZone = browserTimeZone()
  if (CHINA_TIME_ZONES.has(timeZone) && isSupported('zh', supportedLanguages)) return 'zh'
  if (KOREA_TIME_ZONES.has(timeZone) && isSupported('ko', supportedLanguages)) return 'ko'
  return defaultLanguage(supportedLanguages)
}

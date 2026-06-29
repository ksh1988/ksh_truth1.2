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
 * Returns all browser language hints in lowercase.
 * @returns {string[]} Browser language codes.
 */
const browserLanguages = () => {
  if (typeof navigator === 'undefined') return []
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  return langs.filter(Boolean).map((lang) => String(lang).toLowerCase())
}

/**
 * Checks whether a language code exists in the site config.
 * @param {string} lang - Candidate language code.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {boolean} True when the language can be used by the site.
 */
const isSupported = (lang, supportedLanguages) => supportedLanguages.includes(lang)

/**
 * Reads the language manually selected by the user.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {string} Saved language code or an empty string.
 */
export const savedLanguage = (supportedLanguages) => {
  const saved = storage()?.getItem(LANGUAGE_STORAGE_KEY) || ''
  return isSupported(saved, supportedLanguages) ? saved : ''
}

/**
 * Persists a user-selected language.
 * @param {string} lang - Selected language code.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {void} Saves the language when it is supported.
 */
export const saveLanguage = (lang, supportedLanguages) => {
  if (!isSupported(lang, supportedLanguages)) return
  storage()?.setItem(LANGUAGE_STORAGE_KEY, lang)
}

/**
 * Detects the best initial language from saved choice, time zone, and browser language.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {string} zh for China, ko for Korea, and en for all other visitors.
 */
export const detectInitialLanguage = (supportedLanguages = []) => {
  const saved = savedLanguage(supportedLanguages)
  if (saved) return saved

  const timeZone = browserTimeZone()
  if (CHINA_TIME_ZONES.has(timeZone) && isSupported('zh', supportedLanguages)) return 'zh'
  if (KOREA_TIME_ZONES.has(timeZone) && isSupported('ko', supportedLanguages)) return 'ko'
  if (timeZone) return isSupported('en', supportedLanguages) ? 'en' : supportedLanguages[0] || 'en'

  const langs = browserLanguages()
  if (langs.some((lang) => lang === 'zh' || lang.startsWith('zh-')) && isSupported('zh', supportedLanguages)) return 'zh'
  if (langs.some((lang) => lang === 'ko' || lang.startsWith('ko-')) && isSupported('ko', supportedLanguages)) return 'ko'

  return isSupported('en', supportedLanguages) ? 'en' : supportedLanguages[0] || 'en'
}

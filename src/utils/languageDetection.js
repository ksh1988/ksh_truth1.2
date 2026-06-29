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
const CHINA_COUNTRY_CODES = new Set(['CN', 'HK', 'MO', 'TW'])
const KOREA_COUNTRY_CODES = new Set(['KR'])

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
 * Maps a country code to the site language rule.
 * @param {string} countryCode - ISO country code returned by an IP geolocation service.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {string} zh for China-related regions, ko for Korea, en for all others.
 */
const languageFromCountryCode = (countryCode, supportedLanguages) => {
  const code = String(countryCode || '').toUpperCase()
  if (CHINA_COUNTRY_CODES.has(code) && isSupported('zh', supportedLanguages)) return 'zh'
  if (KOREA_COUNTRY_CODES.has(code) && isSupported('ko', supportedLanguages)) return 'ko'
  return isSupported('en', supportedLanguages) ? 'en' : supportedLanguages[0] || 'en'
}

/**
 * Checks whether a language code exists in the site config.
 * @param {string} lang - Candidate language code.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {boolean} True when the language can be used by the site.
 */
const isSupported = (lang, supportedLanguages) => supportedLanguages.includes(lang)

/**
 * Clears any language choice saved by older site versions.
 * @returns {void} Removes the legacy language key from browser storage.
 */
export const clearSavedLanguage = () => {
  storage()?.removeItem(LANGUAGE_STORAGE_KEY)
}

/**
 * Detects the best initial language from time zone and browser language.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {string} zh for China, ko for Korea, and en for all other visitors.
 */
export const detectInitialLanguage = (supportedLanguages = []) => {
  const timeZone = browserTimeZone()
  if (CHINA_TIME_ZONES.has(timeZone) && isSupported('zh', supportedLanguages)) return 'zh'
  if (KOREA_TIME_ZONES.has(timeZone) && isSupported('ko', supportedLanguages)) return 'ko'
  if (timeZone) return isSupported('en', supportedLanguages) ? 'en' : supportedLanguages[0] || 'en'

  const langs = browserLanguages()
  if (langs.some((lang) => lang === 'zh' || lang.startsWith('zh-')) && isSupported('zh', supportedLanguages)) return 'zh'
  if (langs.some((lang) => lang === 'ko' || lang.startsWith('ko-')) && isSupported('ko', supportedLanguages)) return 'ko'

  return isSupported('en', supportedLanguages) ? 'en' : supportedLanguages[0] || 'en'
}

/**
 * Detects visitor language from public IP country and falls back to time zone rules.
 * @param {string[]} supportedLanguages - Languages declared by site_data.json.
 * @returns {Promise<string>} Language selected by IP country or local fallback.
 */
export const detectLanguageFromIp = async (supportedLanguages = []) => {
  try {
    const response = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (!response.ok) throw new Error('ip lookup failed')
    const data = await response.json()
    return languageFromCountryCode(data.country_code || data.country, supportedLanguages)
  } catch {
    return detectInitialLanguage(supportedLanguages)
  }
}

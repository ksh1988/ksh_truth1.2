/**
 * Checks whether a media source is already an external or browser-native URL.
 * @param {string} src - Raw media source from site_data.json.
 * @returns {boolean} True when the source should be used without local path rewriting.
 */
const isExternalSource = (src) => /^(https?:)?\/\//i.test(src) || /^(data|blob):/i.test(src)

/**
 * Normalizes slash direction so JSON can use Windows or URL style paths.
 * @param {string} src - Raw media source from site_data.json.
 * @returns {string} Source path with forward slashes.
 */
const normalizeSlashes = (src) => String(src || '').trim().replace(/\\/g, '/')

/**
 * Prefixes a public asset path with the Vite base path.
 * @param {string} path - Public asset path beginning with a slash.
 * @returns {string} Runtime URL that works with the current Vite base setting.
 */
const withBasePath = (path) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return base + path
}

/**
 * Converts JSON media values into browser-loadable URLs.
 * @param {string} rawSrc - Raw image or video source from site_data.json.
 * @returns {string} External URL unchanged, or a public asset URL for local files.
 */
export const resolveMediaSrc = (rawSrc) => {
  const src = normalizeSlashes(rawSrc)
  if (!src || isExternalSource(src)) return src

  const withoutDot = src.replace(/^\.\//, '')
  const publicPath = withoutDot
    .replace(/^public\//, '')
    .replace(/^src\/images\//, 'images/')
    .replace(/^@images\//, 'images/')

  if (publicPath.startsWith('/images/')) return withBasePath(publicPath)
  if (publicPath.startsWith('images/')) return withBasePath('/' + publicPath)
  if (publicPath.startsWith('/')) return withBasePath(publicPath)
  return withBasePath('/images/' + publicPath)
}

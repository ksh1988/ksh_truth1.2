import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const targets = [
  'src',
  'site_data.json',
  'CODE_RULES.md',
  'README.md',
  'index.html',
  'vite.config.js',
]
const allowedExtensions = new Set(['.js', '.vue', '.css', '.json', '.md', '.html'])
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'src/images'])
const unicodeEscapePattern = new RegExp('\\\\' + 'u[0-9a-fA-F]{4}')
const checks = [
  { name: 'question mark placeholder cluster', pattern: /\?{3,}/ },
  { name: 'replacement character', pattern: /\uFFFD/ },
  { name: 'unicode escape text', pattern: unicodeEscapePattern },
  { name: 'year question-mark suffix', pattern: /year\s*\+\s*['"]\?['"]/ },
  { name: 'common mojibake text', pattern: /(浠ュ|淇濆|瀹夊|鍥剧|鐨|涓€|銆|锛|靸|Дк)/ },
]

/**
 * Checks whether a path should be skipped during text integrity scanning.
 * @param {string} absolutePath - Absolute filesystem path being considered.
 * @returns {boolean} True when the path is generated, vendored, or intentionally ignored.
 */
const isIgnored = (absolutePath) => {
  const relative = path.relative(root, absolutePath).replace(/\\/g, '/')
  return [...ignoredDirs].some((dir) => relative === dir || relative.startsWith(dir + '/'))
}

/**
 * Recursively collects text files from one file or directory target.
 * @param {string} target - Relative target path to collect from.
 * @returns {string[]} Absolute file paths that should be scanned.
 */
const collectFiles = (target) => {
  const absolute = path.join(root, target)
  if (!fs.existsSync(absolute) || isIgnored(absolute)) return []
  const stat = fs.statSync(absolute)
  if (stat.isFile()) return allowedExtensions.has(path.extname(absolute)) ? [absolute] : []
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolute, entry.name)
    if (isIgnored(child)) return []
    if (entry.isDirectory()) return collectFiles(path.relative(root, child))
    return allowedExtensions.has(path.extname(child)) ? [child] : []
  })
}

/**
 * Returns line and column for a character offset in a text file.
 * @param {string} text - Full file text.
 * @param {number} index - Character offset of the match.
 * @returns {{line: number, column: number}} One-based line and column position.
 */
const positionFor = (text, index) => {
  const before = text.slice(0, index).split(/\r?\n/)
  return { line: before.length, column: before[before.length - 1].length + 1 }
}

/**
 * Scans one UTF-8 text file for known encoding and placeholder mistakes.
 * @param {string} file - Absolute file path to scan.
 * @returns {object[]} List of problems found in the file.
 */
const scanFile = (file) => {
  const text = fs.readFileSync(file, 'utf8')
  return checks.flatMap((check) => {
    const match = check.pattern.exec(text)
    if (!match) return []
    const position = positionFor(text, match.index)
    return [{ file, check: check.name, sample: match[0], ...position }]
  })
}

const files = targets.flatMap(collectFiles)
const problems = files.flatMap(scanFile)

if (problems.length) {
  console.error('Text integrity check failed:')
  for (const problem of problems) {
    const relative = path.relative(root, problem.file).replace(/\\/g, '/')
    console.error(`- ${relative}:${problem.line}:${problem.column} ${problem.check}: ${problem.sample}`)
  }
  process.exit(1)
}

console.log(`Text integrity check passed (${files.length} files).`)

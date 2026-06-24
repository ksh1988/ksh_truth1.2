import { nextTick } from 'vue'
import { wait, waitForImagesBeforeTarget, waitForRender, scrollToCenter } from '../utils/domPosition'
import { cssEscape } from '../utils/searchKeys'

const waitForTarget = async (root, focusKey) => {
  if (!focusKey) return root
  const selector = '[data-search-key="' + cssEscape(focusKey) + '"]'

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const target = root.querySelector(selector)
    if (target) return target
    await wait(100)
    await waitForRender()
  }

  return null
}

export const useSearchFocus = () => {
  const clearSearchHighlight = () => {
    document.querySelectorAll('mark.search-focus-hit').forEach((node) => {
      const parent = node.parentNode
      if (!parent) return
      parent.replaceChild(document.createTextNode(node.textContent || ''), node)
      parent.normalize()
    })

    document.querySelectorAll('.search-focus-scope').forEach((node) => {
      node.classList.remove('search-focus-scope')
    })
  }

  const findTextNode = (root, keyword) => {
    const needle = keyword.toLowerCase()
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        if (parent.closest('.return-floating')) return NodeFilter.FILTER_REJECT
        if (parent.closest('mark.search-focus-hit')) return NodeFilter.FILTER_REJECT
        if (['SCRIPT', 'STYLE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT
        return node.nodeValue.toLowerCase().includes(needle)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP
      },
    })
    return walker.nextNode()
  }

  const focusSearchText = async ({ query, focusKey }) => {
    const keyword = String(query || '').trim()
    if (!keyword) return false

    await nextTick()
    await waitForRender()
    clearSearchHighlight()

    const root = document.querySelector('.content')
    if (!root) return false

    const scope = await waitForTarget(root, focusKey)
    if (!scope) return false

    await waitForImagesBeforeTarget(root, scope)

    if (scope !== root) {
      scope.classList.add('search-focus-scope')
      scrollToCenter(scope)
      await waitForRender()
    }

    const node = findTextNode(scope, keyword)
    if (!node) return false

    const source = node.nodeValue
    const index = source.toLowerCase().indexOf(keyword.toLowerCase())
    if (index < 0) return false

    const range = document.createRange()
    range.setStart(node, index)
    range.setEnd(node, index + keyword.length)

    const mark = document.createElement('mark')
    mark.className = 'search-focus-hit'
    range.surroundContents(mark)
    await waitForImagesBeforeTarget(root, mark)
    scrollToCenter(mark)
    return true
  }

  return {
    clearSearchHighlight,
    focusSearchText,
  }
}

import { computed, nextTick, ref } from 'vue'
import { scrollToCenter, waitForImagesBeforeTarget, waitForRender } from '../utils/domPosition'
import { cssEscape } from '../utils/searchKeys'

/**
 * Restores scroll position to a search result card.
 * @param {*} resultKey - Input value used by scrollToSearchResult.
 * @param {*} fallbackY - Input value used by scrollToSearchResult.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
const scrollToSearchResult = async (resultKey, fallbackY = 0) => {
  await nextTick()
  await waitForRender()

  if (resultKey) {
    const selector = '[data-search-result-key="' + cssEscape(resultKey) + '"]'
    const target = document.querySelector(selector)
    if (target) {
      const root = document.querySelector('.content') || document.body
      await waitForImagesBeforeTarget(root, target)
      scrollToCenter(target)
      return
    }
  }

  window.scrollTo({ top: fallbackY || 0, behavior: 'auto' })
}

/**
 * Module documentation.
 * @param {...*} args - Inputs are declared by the following code.
 * @returns {*} The computed result or side effect.
 */
export const useSearchNavigation = ({
  clearSearchHighlight,
  sidebarVisible,
  expandedTabs,
  focusSearchText,
  navigateInternal,
  searchQuery,
  selectDirectSubTab,
  selectSubTab,
  selectTab,
  selection,
  mobileSidebarVisible,
  submittedSearchQuery,
}) => {
  const returnView = ref(null)
  const returnEnabled = ref(false)
  const activeSearchQuery = computed(() => submittedSearchQuery.value.trim())
  const canReturn = computed(() => Boolean(returnView.value && returnEnabled.value))

  /**
 * Captures the current view so a later return can restore it.
 * @param {*} extra - Input value used by captureView.
 * @returns {*} The computed result or the documented side effect.
 */
  const captureView = (extra = {}) => ({
    searchQuery: searchQuery.value,
    submittedSearchQuery: submittedSearchQuery.value,
    selection: { ...selection.value },
    expandedTabs: [...expandedTabs.value],
    scrollY: window.scrollY || 0,
    ...extra,
  })

  /**
 * Clears the saved return view.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const clearReturn = () => {
    returnView.value = null
    returnEnabled.value = false
  }

  /**
 * Restores a previously captured view state.
 * @param {*} view - Input value used by restoreView.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
  const restoreView = async (view) => {
    searchQuery.value = view.searchQuery || ''
    submittedSearchQuery.value = view.submittedSearchQuery || ''
    selection.value = { ...view.selection }
    expandedTabs.value = new Set(view.expandedTabs || [])
    clearSearchHighlight()

    if (view.searchResultKey) {
      await scrollToSearchResult(view.searchResultKey, view.scrollY)
      return
    }

    await nextTick()
    window.scrollTo({ top: view.scrollY || 0, behavior: 'auto' })
  }

  /**
 * Clears search state and active highlight.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const clearSearch = () => {
    searchQuery.value = ''
    submittedSearchQuery.value = ''
    clearSearchHighlight()
  }

  /**
 * Updates the search input value and exits search when empty.
 * @param {*} value - Input value used by updateSearch.
 * @returns {*} The computed result or the documented side effect.
 */
  const updateSearch = (value) => {
    searchQuery.value = value
    if (!value.trim()) {
      submittedSearchQuery.value = ''
      clearSearchHighlight()
      clearReturn()
    }
  }

  /**
 * Scrolls the search results page to the top.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
  const scrollSearchResultsToTop = async () => {
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  /**
 * Submits the current search query and opens the results page.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
  const submitSearch = async () => {
    const query = searchQuery.value.trim()
    submittedSearchQuery.value = query
    clearReturn()
    clearSearchHighlight()
    if (query) {
      sidebarVisible.value = false
      mobileSidebarVisible.value = false
      await scrollSearchResultsToTop()
    }
  }

  /**
 * Opens a selected search result in the main content.
 * @param {*} result - Input value used by openSearchResult.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
  const openSearchResult = async (result) => {
    const previousView = captureView({ searchResultKey: result.id })
    const query = activeSearchQuery.value
    submittedSearchQuery.value = ''
    returnView.value = previousView
    returnEnabled.value = true

    if (result.subTab && result.category) {
      selectSubTab(result.tab, result.category, result.subTab)
    } else if (result.subTab) {
      selectDirectSubTab(result.tab, result.subTab)
    } else {
      selectTab(result.tab)
    }

    await focusSearchText({ query, focusKey: result.focusKey })
  }

  /**
 * Opens a site-internal link and stores return state.
 * @param {*} target - Input value used by openInternalLink.
 * @returns {*} The computed result or the documented side effect.
 */
  const openInternalLink = (target) => {
    returnView.value = captureView()
    returnEnabled.value = true
    clearSearch()
    navigateInternal(target)
  }

  /**
 * Restores the previously captured view.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
  const returnToPreviousView = async () => {
    const target = returnView.value
    clearReturn()
    if (target) await restoreView(target)
  }

  /**
 * Clears search and return state before manual navigation.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const resetJumpState = () => {
    clearReturn()
    clearSearch()
  }

  return {
    activeSearchQuery,
    canReturn,
    openInternalLink,
    openSearchResult,
    resetJumpState,
    returnToPreviousView,
    submitSearch,
    updateSearch,
  }
}


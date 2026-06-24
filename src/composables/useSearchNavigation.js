import { computed, nextTick, ref } from 'vue'
import { scrollToCenter, waitForImagesBeforeTarget, waitForRender } from '../utils/domPosition'
import { cssEscape } from '../utils/searchKeys'


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

  const captureView = (extra = {}) => ({
    searchQuery: searchQuery.value,
    submittedSearchQuery: submittedSearchQuery.value,
    selection: { ...selection.value },
    expandedTabs: [...expandedTabs.value],
    scrollY: window.scrollY || 0,
    ...extra,
  })

  const clearReturn = () => {
    returnView.value = null
    returnEnabled.value = false
  }

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

  const clearSearch = () => {
    searchQuery.value = ''
    submittedSearchQuery.value = ''
    clearSearchHighlight()
  }

  const updateSearch = (value) => {
    searchQuery.value = value
    if (!value.trim()) {
      submittedSearchQuery.value = ''
      clearSearchHighlight()
      clearReturn()
    }
  }

  const scrollSearchResultsToTop = async () => {
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

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

  const openInternalLink = (target) => {
    returnView.value = captureView()
    returnEnabled.value = true
    clearSearch()
    navigateInternal(target)
  }

  const returnToPreviousView = async () => {
    const target = returnView.value
    clearReturn()
    if (target) await restoreView(target)
  }

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

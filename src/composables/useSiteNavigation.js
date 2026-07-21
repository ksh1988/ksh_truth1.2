import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { localizeValue } from '../utils/localization'
import { entriesFor, isVisibleContent } from '../utils/contentHelpers'
import { buildNavigationTree, expandedIdsForPath, navigationPathForSelection } from '../utils/navigationTree'
import { scrollToCenter, waitForImagesBeforeTarget, waitForRender } from '../utils/domPosition'
import { cssEscape } from '../utils/searchKeys'

/**
 * Finds the default child content for a root tab.
 * @param {*} tab - Input value used by firstContentInTab.
 * @returns {*} The computed result or the documented side effect.
 */
const firstContentInTab = (tab) => {
  const category = tab.categories?.filter(isVisibleContent)[0]
  const subTab = category?.sub_tabs?.filter(isVisibleContent)[0] || tab.sub_tabs?.filter(isVisibleContent)[0]
  if (category && !category.sub_tabs?.length) {
    return { categoryId: category.id, subTabId: null }
  }
  return {
    categoryId: category?.sub_tabs?.length ? category.id : null,
    subTabId: subTab?.id || null,
  }
}

/**
 * Creates navigation state and page selection actions.
 * @param {*} siteData - Input value used by useSiteNavigation.
 * @param {*} lang - Input value used by useSiteNavigation.
 * @returns {*} The computed result or the documented side effect.
 */
export const useSiteNavigation = (siteData, lang) => {
  const mobileSidebarVisible = ref(false)
  const sidebarVisible = ref(true)
  const expandedTabs = ref(new Set())
  const timelineOrder = ref('desc')
  const selectedYear = ref('all')

  const visibleTabs = siteData.tabs.filter(isVisibleContent)
  const defaultTab = visibleTabs.find((tab) => tab.id === 'rights') || visibleTabs[0] || siteData.tabs[0]
  const defaultContent = firstContentInTab(defaultTab)
  const selection = ref({
    tabId: defaultTab.id,
    categoryId: defaultContent.categoryId,
    subTabId: defaultContent.subTabId,
  })

  /**
 * Returns the current-language value for a localized field.
 * @param {*} value - Input value used by localize.
 * @returns {*} The computed result or the documented side effect.
 */
  const localize = (value) => localizeValue(value, lang.value)

  const activeTab = computed(() => visibleTabs.find((tab) => tab.id === selection.value.tabId) || defaultTab)
  const activeCategory = computed(() => activeTab.value.categories?.filter(isVisibleContent).find((cat) => cat.id === selection.value.categoryId))
  const activeContent = computed(() => {
    if (activeTab.value.layout !== 'two-level') return activeTab.value

    const directSubTab = activeTab.value.sub_tabs?.filter(isVisibleContent).find((sub) => sub.id === selection.value.subTabId)
    return activeCategory.value?.sub_tabs?.filter(isVisibleContent).find((sub) => sub.id === selection.value.subTabId)
      || directSubTab
      || (!activeCategory.value?.sub_tabs?.length ? activeCategory.value : null)
      || activeCategory.value?.sub_tabs?.filter(isVisibleContent)[0]
      || activeTab.value.sub_tabs?.filter(isVisibleContent)[0]
      || activeTab.value
  })
  const pageTitle = computed(() => localize(activeContent.value.label) || localize(activeTab.value.label))
  const navigationTree = computed(() => buildNavigationTree(siteData))
  const activeNavigationPath = computed(() => navigationPathForSelection(navigationTree.value, selection.value))
  const activeNavigationPathIds = computed(() => activeNavigationPath.value.map((node) => node.id))
  const activeNavigationNodeId = computed(() => activeNavigationPath.value.at(-1)?.id || '')

  /**
 * Resets sidebar expansion to the current active navigation path.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const expandActiveNavigationPath = () => {
    expandedTabs.value = expandedIdsForPath(activeNavigationPath.value)
  }

  /**
 * Closes the mobile sidebar drawer.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const closeMobileMenu = () => {
    mobileSidebarVisible.value = false
  }

  /**
 * Scrolls the document back to the top after navigation.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  /**
 * Scrolls to the top again after Vue has rendered the selected page.
 * @param {void} none - Uses the current document as the scroll target.
 * @returns {Promise<void>} Resolves after the post-render scroll reset finishes.
 */
  const scrollToTopAfterRender = async () => {
    scrollToTop()
    await nextTick()
    await waitForRender()
    scrollToTop()
  }

  /**
 * Applies a page selection and performs shared navigation side effects.
 * @param {*} nextSelection - Input value used by activateSelection.
 * @returns {*} The computed result or the documented side effect.
 */
  const activateSelection = (nextSelection) => {
    selection.value = nextSelection
    closeMobileMenu()
    scrollToTop()
  }

  /**
 * Selects a root tab and opens its default content when needed.
 * @param {*} tab - Input value used by selectTab.
 * @returns {*} The computed result or the documented side effect.
 */
  const selectTab = (tab) => {
    if (tab.layout === 'two-level') {
      const next = firstContentInTab(tab)
      selection.value = { tabId: tab.id, ...next }
      expandActiveNavigationPath()
    } else {
      selection.value = { tabId: tab.id, categoryId: null, subTabId: null }
    }
    closeMobileMenu()
    scrollToTop()
  }

  /**
 * Selects a leaf page that is attached directly to a root tab.
 * @param {*} tab - Input value used by selectDirectSubTab.
 * @param {*} subTab - Input value used by selectDirectSubTab.
 * @returns {*} The computed result or the documented side effect.
 */
  const selectDirectSubTab = (tab, subTab) => {
    activateSelection({ tabId: tab.id, categoryId: null, subTabId: subTab.id })
  }

  /**
 * Selects a leaf page represented directly by a category without sub-tabs.
 * @param {*} tab - Parent root tab.
 * @param {*} category - Category object that also owns page content.
 * @returns {void} Activates the category page.
 */
  const selectCategory = (tab, category) => {
    activateSelection({ tabId: tab.id, categoryId: category.id, subTabId: null })
  }

  /**
 * Selects a leaf page under a category.
 * @param {*} tab - Input value used by selectSubTab.
 * @param {*} category - Input value used by selectSubTab.
 * @param {*} subTab - Input value used by selectSubTab.
 * @returns {*} The computed result or the documented side effect.
 */
  const selectSubTab = (tab, category, subTab) => {
    activateSelection({ tabId: tab.id, categoryId: category.id, subTabId: subTab.id })
  }

  /**
 * Scrolls to a specific entity after an internal page jump finishes rendering.
 * @param {string} entryId - Target entity id that is also rendered as data-search-key.
 * @returns {Promise<void>} Scrolls to the target entity when it exists.
 */
  const scrollToInternalEntry = async (entryId) => {
    if (!entryId) {
      scrollToTop()
      return
    }

    await nextTick()
    await waitForRender()

    const selector = '[data-search-key="' + cssEscape(entryId) + '"]'
    const target = document.querySelector(selector)
    if (!target) {
      scrollToTop()
      return
    }

    const root = document.querySelector('.content') || document.body
    await waitForImagesBeforeTarget(root, target)
    scrollToCenter(target)
  }

  /**
 * Navigates to a page described by an internal_link target.
 * @param {object} target - Target tab/category/sub-tab ids, with optional entry_id for entity focus.
 * @returns {Promise<void>} Updates the active page and scrolls to the requested place.
 */
  const navigateInternal = async (target) => {
    const tab = siteData.tabs.filter(isVisibleContent).find((item) => item.id === target.tab_id)
    const category = tab?.categories?.filter(isVisibleContent).find((item) => item.id === target.category_id)
    const subTab = category?.sub_tabs?.filter(isVisibleContent).find((item) => item.id === target.sub_tab_id)
      || tab?.sub_tabs?.filter(isVisibleContent).find((item) => item.id === target.sub_tab_id)
    const categoryPage = category && !category.sub_tabs?.length ? category : null

    if (!tab || (!subTab && !categoryPage)) return

    selection.value = {
      tabId: tab.id,
      categoryId: category?.id || null,
      subTabId: subTab?.id || null,
    }
    expandActiveNavigationPath()
    closeMobileMenu()
    await scrollToInternalEntry(target.entry_id)
  }

  /**
 * Toggles one sidebar tree node in the expanded set.
 * @param {*} id - Input value used by toggleExpanded.
 * @returns {*} The computed result or the documented side effect.
 */
  const toggleExpanded = (id) => {
    const next = new Set(expandedTabs.value)
    next.has(id) ? next.delete(id) : next.add(id)
    expandedTabs.value = next
  }

  const timelineYears = computed(() => [...new Set(entriesFor(activeContent.value, lang.value)
    .map((item) => String(item.time || '').slice(0, 4))
    .filter((year) => /^\d{4}$/.test(year)))]
    .sort((a, b) => Number(b) - Number(a)))

  const timelineEntries = computed(() => entriesFor(activeContent.value, lang.value)
    .filter((item) => selectedYear.value === 'all' || String(item.time || '').startsWith(selectedYear.value))
    .slice()
    .sort((a, b) => {
      const comparison = String(a.time || '').localeCompare(String(b.time || ''))
      return timelineOrder.value === 'desc' ? -comparison : comparison
    }))

  /**
 * Handles global keyboard shortcuts used by navigation.
 * @param {*} event - Input value used by onKeydown.
 * @returns {*} The computed result or the documented side effect.
 */
  const onKeydown = (event) => {
    if (event.key === 'Escape') closeMobileMenu()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))

  watch(lang, () => {
    document.documentElement.lang = lang.value === 'zh' ? 'zh-CN' : lang.value
  }, { immediate: true })

  watch(activeContent, () => {
    selectedYear.value = 'all'
    timelineOrder.value = activeContent.value?.default_order === 'asc' ? 'asc' : 'desc'
  }, { immediate: true })

  watch(selection, expandActiveNavigationPath, { immediate: true, deep: true })

  return {
    activeCategory,
    activeContent,
    activeNavigationNodeId,
    activeNavigationPathIds,
    activeTab,
    sidebarVisible,
    expandedTabs,
    localize,
    expandActiveNavigationPath,
    navigateInternal,
    navigationTree,
    pageTitle,
    scrollToTopAfterRender,
    selectCategory,
    selectDirectSubTab,
    selectSubTab,
    selectTab,
    selectedYear,
    selection,
    mobileSidebarVisible,
    timelineEntries,
    timelineOrder,
    timelineYears,
    toggleExpanded,
  }
}

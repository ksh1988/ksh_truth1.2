import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { localizeValue } from '../utils/localization'
import { entriesFor } from '../utils/contentHelpers'

const firstContentInTab = (tab) => {
  const category = tab.categories?.[0]
  const subTab = category?.sub_tabs?.[0] || tab.sub_tabs?.[0]
  return {
    categoryId: category?.sub_tabs?.length ? category.id : null,
    subTabId: subTab?.id || null,
  }
}

export const useSiteNavigation = (siteData, lang) => {
  const mobileSidebarVisible = ref(false)
  const sidebarVisible = ref(true)
  const expandedTabs = ref(new Set())
  const timelineOrder = ref('desc')
  const selectedYear = ref('all')

  const defaultTab = siteData.tabs.find((tab) => tab.id === 'rights') || siteData.tabs[0]
  const defaultContent = firstContentInTab(defaultTab)
  const selection = ref({
    tabId: defaultTab.id,
    categoryId: defaultContent.categoryId,
    subTabId: defaultContent.subTabId,
  })

  const localize = (value) => localizeValue(value, lang.value)

  const activeTab = computed(() => siteData.tabs.find((tab) => tab.id === selection.value.tabId) || defaultTab)
  const activeCategory = computed(() => activeTab.value.categories?.find((cat) => cat.id === selection.value.categoryId))
  const activeContent = computed(() => {
    if (activeTab.value.layout !== 'two-level') return activeTab.value

    const directSubTab = activeTab.value.sub_tabs?.find((sub) => sub.id === selection.value.subTabId)
    return activeCategory.value?.sub_tabs?.find((sub) => sub.id === selection.value.subTabId)
      || directSubTab
      || activeCategory.value?.sub_tabs?.[0]
      || activeTab.value.sub_tabs?.[0]
      || activeTab.value
  })
  const pageTitle = computed(() => localize(activeContent.value.label) || localize(activeTab.value.label))

  const closeMobileMenu = () => {
    mobileSidebarVisible.value = false
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const activateSelection = (nextSelection) => {
    selection.value = nextSelection
    closeMobileMenu()
    scrollToTop()
  }

  const selectTab = (tab) => {
    if (tab.layout === 'two-level') {
      const next = firstContentInTab(tab)
      selection.value = { tabId: tab.id, ...next }
      expandedTabs.value = new Set([tab.id, next.categoryId].filter(Boolean))
    } else {
      selection.value = { tabId: tab.id, categoryId: null, subTabId: null }
    }
    closeMobileMenu()
    scrollToTop()
  }

  const selectDirectSubTab = (tab, subTab) => {
    activateSelection({ tabId: tab.id, categoryId: null, subTabId: subTab.id })
  }

  const selectSubTab = (tab, category, subTab) => {
    activateSelection({ tabId: tab.id, categoryId: category.id, subTabId: subTab.id })
  }

  const navigateInternal = (target) => {
    const tab = siteData.tabs.find((item) => item.id === target.tab_id)
    const category = tab?.categories?.find((item) => item.id === target.category_id)
    const subTab = category?.sub_tabs?.find((item) => item.id === target.sub_tab_id)
      || tab?.sub_tabs?.find((item) => item.id === target.sub_tab_id)

    if (!tab || !subTab) return

    selection.value = {
      tabId: tab.id,
      categoryId: category?.id || null,
      subTabId: subTab.id,
    }
    expandedTabs.value = new Set([tab.id, category?.id].filter(Boolean))
    closeMobileMenu()
    scrollToTop()
  }

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
  })

  return {
    activeCategory,
    activeContent,
    activeTab,
    sidebarVisible,
    expandedTabs,
    localize,
    navigateInternal,
    pageTitle,
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

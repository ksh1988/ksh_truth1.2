import { computed, reactive, ref } from 'vue'
import { uiText } from '../config/uiText'
import { searchSiteSections } from '../utils/siteSearch'
import { useSearchFocus } from './useSearchFocus'
import { useSearchNavigation } from './useSearchNavigation'
import { useSiteNavigation } from './useSiteNavigation'

export const useAppController = (siteData) => {
  const lang = ref(siteData.meta.default_language || 'zh')
  const searchQuery = ref('')
  const submittedSearchQuery = ref('')

  const navigation = useSiteNavigation(siteData, lang)
  const searchFocus = useSearchFocus()
  const searchNavigation = useSearchNavigation({
    clearSearchHighlight: searchFocus.clearSearchHighlight,
    sidebarVisible: navigation.sidebarVisible,
    expandedTabs: navigation.expandedTabs,
    focusSearchText: searchFocus.focusSearchText,
    navigateInternal: navigation.navigateInternal,
    searchQuery,
    selectDirectSubTab: navigation.selectDirectSubTab,
    selectSubTab: navigation.selectSubTab,
    selectTab: navigation.selectTab,
    selection: navigation.selection,
    mobileSidebarVisible: navigation.mobileSidebarVisible,
    submittedSearchQuery,
  })

  const activeTitle = computed(() => searchNavigation.activeSearchQuery.value
    ? uiText[lang.value].searchResultTitle
    : navigation.pageTitle.value)
  const returnLabel = computed(() => uiText[lang.value].returnPrevious)
  const searchResults = computed(() => searchSiteSections(siteData.tabs, lang.value, searchNavigation.activeSearchQuery.value))

  const selectTabFromMenu = (tab) => {
    searchNavigation.resetJumpState()
    navigation.selectTab(tab)
  }

  const selectDirectSubTabFromMenu = (tab, subTab) => {
    searchNavigation.resetJumpState()
    navigation.selectDirectSubTab(tab, subTab)
  }

  const selectSubTabFromMenu = (tab, category, subTab) => {
    searchNavigation.resetJumpState()
    navigation.selectSubTab(tab, category, subTab)
  }

  const openMenu = () => {
    navigation.sidebarVisible.value = true
    navigation.mobileSidebarVisible.value = true
  }

  const toggleSidebarVisible = () => {
    navigation.sidebarVisible.value = !navigation.sidebarVisible.value
    if (!navigation.sidebarVisible.value) navigation.mobileSidebarVisible.value = false
  }

  return reactive({
    ...navigation,
    ...searchNavigation,
    activeTitle,
    lang,
    openMenu,
    toggleSidebarVisible,
    returnLabel,
    searchQuery,
    searchResults,
    selectDirectSubTabFromMenu,
    selectSubTabFromMenu,
    selectTabFromMenu,
    uiText,
  })
}

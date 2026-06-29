import { computed, reactive, ref } from 'vue'
import { uiText } from '../config/uiText'
import { clearSavedLanguage, detectInitialLanguage } from '../utils/languageDetection'
import { searchSiteSections } from '../utils/siteSearch'
import { useSearchFocus } from './useSearchFocus'
import { useSearchNavigation } from './useSearchNavigation'
import { useSiteNavigation } from './useSiteNavigation'

/**
 * Creates the top-level reactive controller used by App.vue.
 * @param {*} siteData - Input value used by useAppController.
 * @returns {*} The computed result or the documented side effect.
 */
export const useAppController = (siteData) => {
  const supportedLanguages = siteData.meta.languages || ['zh', 'ko', 'en']
  clearSavedLanguage()
  const lang = ref(detectInitialLanguage(supportedLanguages))
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

  /**
 * Applies a language selected by the visitor for the current page session.
 * @param {string} nextLang - Language code selected from the top bar.
 * @returns {void} Updates current language when supported.
 */
  const setLanguage = (nextLang) => {
    if (!supportedLanguages.includes(nextLang)) return
    lang.value = nextLang
  }


  /**
 * Selects a root tab from the sidebar menu and clears jump state.
 * @param {*} tab - Input value used by selectTabFromMenu.
 * @returns {*} The computed result or the documented side effect.
 */
  const selectTabFromMenu = (tab) => {
    searchNavigation.resetJumpState()
    navigation.selectTab(tab)
  }

  /**
 * Selects a direct leaf page from the sidebar and clears jump state.
 * @param {*} tab - Input value used by selectDirectSubTabFromMenu.
 * @param {*} subTab - Input value used by selectDirectSubTabFromMenu.
 * @returns {*} The computed result or the documented side effect.
 */
  const selectDirectSubTabFromMenu = (tab, subTab) => {
    searchNavigation.resetJumpState()
    navigation.selectDirectSubTab(tab, subTab)
  }

  /**
 * Selects a category leaf page from the sidebar and clears jump state.
 * @param {*} tab - Input value used by selectSubTabFromMenu.
 * @param {*} category - Input value used by selectSubTabFromMenu.
 * @param {*} subTab - Input value used by selectSubTabFromMenu.
 * @returns {*} The computed result or the documented side effect.
 */
  const selectSubTabFromMenu = (tab, category, subTab) => {
    searchNavigation.resetJumpState()
    navigation.selectSubTab(tab, category, subTab)
  }

  /**
 * Sets sidebar visibility through one shared code path.
 * @param {*} visible - Input value used by setSidebarVisible.
 * @returns {*} The computed result or the documented side effect.
 */
  const setSidebarVisible = (visible) => {
    if (visible) navigation.expandActiveNavigationPath()
    navigation.sidebarVisible.value = visible
    navigation.mobileSidebarVisible.value = visible
  }

  /**
 * Opens the sidebar.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const openSidebar = () => setSidebarVisible(true)

  /**
 * Closes the sidebar.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const closeSidebar = () => setSidebarVisible(false)

  /**
 * Toggles sidebar visibility.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
  const toggleSidebarVisible = () => setSidebarVisible(!navigation.sidebarVisible.value)

  return reactive({
    ...navigation,
    ...searchNavigation,
    activeTitle,
    lang,
    closeSidebar,
    openSidebar,
    toggleSidebarVisible,
    returnLabel,
    searchQuery,
    searchResults,
    setLanguage,
    selectDirectSubTabFromMenu,
    selectSubTabFromMenu,
    selectTabFromMenu,
    uiText,
  })
}


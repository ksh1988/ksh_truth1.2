<script setup>
/**
 * Vue component that renders a focused part of the site UI.
 * @param {object} props - Component props declared below when this is a Vue component.
 * @returns {void} Renders UI or exports module helpers.
 */
import { computed, ref } from 'vue'
import { resolveMediaSrc } from '../../utils/mediaSource'
import NavigationTreePanel from './NavigationTreePanel.vue'
import SidebarTreeNode from './SidebarTreeNode.vue'

const treeOpen = ref(false)
const pressConferenceVideoUrl = 'https://video.ltwebstatic.com/video/2026/07/19/17844256013748481883.mp4'

const props = defineProps({
  activeNavigationNodeId: { type: String, default: '' },
  activeNavigationPathIds: { type: Array, default: () => [] },
  activeTab: { type: Object, required: true },
  sidebarVisible: Boolean,
  expandedTabs: { type: Object, required: true },
  navigationTree: { type: Array, required: true },
  lang: { type: String, required: true },
  localize: { type: Function, required: true },
  searchQuery: { type: String, default: '' },
  selection: { type: Object, required: true },
  siteData: { type: Object, required: true },
  mobileSidebarVisible: Boolean,
  ui: { type: Object, required: true },
})

// Keeps the press conference button text in sync with the active language.
const pressConferenceButtonLabel = computed(() => props.ui[props.lang]?.pressConferenceButton || props.ui.zh.pressConferenceButton)

const emit = defineEmits([
  'close-menu',
  'search-change',
  'submit-search',
  'select-category',
  'select-direct-sub-tab',
  'select-sub-tab',
  'select-tab',
  'toggle-sidebar-visible',
  'toggle-expanded',
])

/**
 * Forwards a direct sub-tab selection from the full tree panel.
 * @param {*} tab - Input value used by forwardDirectSubTab.
 * @param {*} subTab - Input value used by forwardDirectSubTab.
 * @returns {*} The computed result or the documented side effect.
 */
const forwardDirectSubTab = (tab, subTab) => emit('select-direct-sub-tab', tab, subTab)
/**
 * Forwards a direct category page selection from the full tree panel.
 * @param {*} tab - Parent root tab.
 * @param {*} category - Category object that also owns page content.
 * @returns {void} Emits category page selection.
 */
const forwardCategory = (tab, category) => emit('select-category', tab, category)
/**
 * Forwards a category sub-tab selection from the full tree panel.
 * @param {*} tab - Input value used by forwardSubTab.
 * @param {*} category - Input value used by forwardSubTab.
 * @param {*} subTab - Input value used by forwardSubTab.
 * @returns {*} The computed result or the documented side effect.
 */
const forwardSubTab = (tab, category, subTab) => emit('select-sub-tab', tab, category, subTab)
/**
 * Forwards a root tab selection from the full tree panel.
 * @param {*} tab - Input value used by forwardTab.
 * @returns {*} The computed result or the documented side effect.
 */
const forwardTab = (tab) => emit('select-tab', tab)
/**
 * Opens the KSH press conference video from the sidebar brand button.
 * @param {MouseEvent} event - Click event from the press conference brand button.
 * @returns {void} Opens a new browser tab when the video URL has been configured.
 */
const openPressConferenceVideo = (event) => {
  event.preventDefault()
  if (!pressConferenceVideoUrl) return
  window.open(resolveMediaSrc(pressConferenceVideoUrl), '_blank', 'noopener,noreferrer')
}
/**
 * Dispatches a recursive sidebar node selection to the correct event.
 * @param {*} node - Input value used by selectNavigationNode.
 * @returns {*} The computed result or the documented side effect.
 */
const selectNavigationNode = (node) => {
  if (node.kind === 'tab') {
    emit('select-tab', node.tab)
    return
  }
  if (node.kind === 'category' && !node.children?.length) {
    emit('select-category', node.tab, node.category)
    return
  }
  if (node.kind === 'subTab' && node.category) {
    emit('select-sub-tab', node.tab, node.category, node.subTab)
    return
  }
  if (node.kind === 'subTab') emit('select-direct-sub-tab', node.tab, node.subTab)
}
</script>

<template>
  <div v-if="mobileSidebarVisible" class="scrim" @click="$emit('close-menu')" />
  <aside class="sidebar" :class="{ open: mobileSidebarVisible, hidden: !sidebarVisible }">
    <div class="brand">
      <button
        class="brand-mark"
        type="button"
        :aria-label="pressConferenceButtonLabel"
        :title="pressConferenceButtonLabel"
        @click="openPressConferenceVideo"
      >
        <span class="brand-mark-text">{{ pressConferenceButtonLabel }}</span>
        <span class="brand-mark-arrow" aria-hidden="true"></span>
      </button>
      <button
        v-if="sidebarVisible"
        class="tree-icon-button"
        :class="{ active: treeOpen }"
        aria-label="Toggle directory tree"
        @click="treeOpen = !treeOpen"
      >
        <span aria-hidden="true" class="tree-icon-triangle"></span>
      </button>
    </div>

    <form v-if="sidebarVisible" class="site-search" role="search" @submit.prevent="$emit('submit-search')">
      <label class="site-search-box">
        <input
          :value="searchQuery"
          type="search"
          :placeholder="ui[lang].searchPlaceholder"
          aria-label="Search site text"
          enterkeyhint="search"
          @input="$emit('search-change', $event.target.value)"
        >
        <button
          class="search-submit"
          type="submit"
          aria-label="Search"
        >
          <span class="search-icon" aria-hidden="true"></span>
        </button>
      </label>
    </form>

    <NavigationTreePanel
      v-if="sidebarVisible && treeOpen"
      :localize="localize"
      :site-data="siteData"
      @select-category="forwardCategory"
      @select-direct-sub-tab="forwardDirectSubTab"
      @select-sub-tab="forwardSubTab"
      @select-tab="forwardTab"
    />

    <nav aria-label="Main navigation">
      <SidebarTreeNode
        v-for="node in navigationTree"
        :key="node.id"
        :active-node-id="activeNavigationNodeId"
        :active-path-ids="activeNavigationPathIds"
        :expanded-ids="expandedTabs"
        :localize="localize"
        :node="node"
        @select-node="selectNavigationNode"
        @toggle-expanded="$emit('toggle-expanded', $event)"
      />
    </nav>

    <button
      class="sidebar-toggle-button"
      :aria-label="sidebarVisible ? ui[lang].closeMenu : ui[lang].openMenu"
      @click="$emit('toggle-sidebar-visible')"
    >
      {{ sidebarVisible ? '<' : '>' }}
      <span v-if="sidebarVisible">{{ ui[lang].closeMenu }}</span>
    </button>
  </aside>
</template>
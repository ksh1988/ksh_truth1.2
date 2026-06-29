<script setup>
/**
 * Vue component that renders a focused part of the site UI.
 * @param {object} props - Component props declared below when this is a Vue component.
 * @returns {void} Renders UI or exports module helpers.
 */
import { ref } from 'vue'
import NavigationTreePanel from './NavigationTreePanel.vue'
import SidebarTreeNode from './SidebarTreeNode.vue'

const treeOpen = ref(false)

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

const emit = defineEmits([
  'close-menu',
  'search-change',
  'submit-search',
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
 * Dispatches a recursive sidebar node selection to the correct event.
 * @param {*} node - Input value used by selectNavigationNode.
 * @returns {*} The computed result or the documented side effect.
 */
const selectNavigationNode = (node) => {
  if (node.kind === 'tab') {
    emit('select-tab', node.tab)
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
      <div class="brand-mark">KSH</div>
      <div v-if="sidebarVisible" class="brand-copy">
        <strong>{{ localize(siteData.meta.title) }}</strong>
        <span>{{ ui[lang].progress }}</span>
      </div>
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
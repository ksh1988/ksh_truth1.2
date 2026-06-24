<script setup>
import { ref } from 'vue'
import NavigationTreePanel from './NavigationTreePanel.vue'

const treeOpen = ref(false)

const props = defineProps({
  activeTab: { type: Object, required: true },
  sidebarVisible: Boolean,
  expandedTabs: { type: Object, required: true },
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

const tabIndex = (tab) => String(props.siteData.tabs.findIndex((item) => item.id === tab.id) + 1).padStart(2, '0')
const forwardDirectSubTab = (tab, subTab) => emit('select-direct-sub-tab', tab, subTab)
const forwardSubTab = (tab, category, subTab) => emit('select-sub-tab', tab, category, subTab)
const forwardTab = (tab) => emit('select-tab', tab)
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

    <div v-if="sidebarVisible" class="site-search">
      <label class="site-search-box">
        <input
          :value="searchQuery"
          type="search"
          :placeholder="ui[lang].searchPlaceholder"
          aria-label="Search site text"
          @input="$emit('search-change', $event.target.value)"
        >
        <button
          class="search-submit"
          type="button"
          aria-label="Search"
          @click="$emit('submit-search')"
        >
          <span class="search-icon" aria-hidden="true"></span>
        </button>
      </label>
    </div>

    <NavigationTreePanel
      v-if="sidebarVisible && treeOpen"
      :localize="localize"
      :site-data="siteData"
      @select-direct-sub-tab="forwardDirectSubTab"
      @select-sub-tab="forwardSubTab"
      @select-tab="forwardTab"
    />

    <nav aria-label="Main navigation">
      <div v-for="tab in siteData.tabs" :key="tab.id" class="nav-group">
        <button
          class="nav-item top"
          :class="{ active: activeTab.id === tab.id }"
          @click="tab.layout === 'two-level' ? $emit('toggle-expanded', tab.id) : $emit('select-tab', tab)"
        >
          <span class="nav-index">{{ tabIndex(tab) }}</span>
          <span v-if="sidebarVisible" class="nav-text">{{ localize(tab.label) }}</span>
          <span v-if="sidebarVisible && tab.layout === 'two-level'" class="chevron">
            {{ expandedTabs.has(tab.id) ? '-' : '+' }}
          </span>
        </button>

        <div v-if="sidebarVisible && tab.layout === 'two-level' && expandedTabs.has(tab.id)" class="subnav">
          <div v-for="category in tab.categories || []" :key="category.id">
            <button
              v-if="category.sub_tabs?.length === 1"
              class="sub-item category-single"
              :class="{ active: selection.subTabId === category.sub_tabs[0].id }"
              @click="$emit('select-sub-tab', tab, category, category.sub_tabs[0])"
            >
              {{ localize(category.sub_tabs[0].label) }}
            </button>

            <template v-else>
              <button class="category" @click="$emit('toggle-expanded', category.id)">
                <span>{{ localize(category.label) }}</span>
                <span>{{ expandedTabs.has(category.id) ? '-' : '+' }}</span>
              </button>
              <div v-if="expandedTabs.has(category.id)">
                <button
                  v-for="sub in category.sub_tabs"
                  :key="sub.id"
                  class="sub-item"
                  :class="{ active: selection.subTabId === sub.id }"
                  @click="$emit('select-sub-tab', tab, category, sub)"
                >
                  {{ localize(sub.label) }}
                </button>
              </div>
            </template>
          </div>

          <button
            v-for="sub in tab.sub_tabs || []"
            :key="sub.id"
            class="sub-item direct-sub-item"
            :class="{ active: selection.subTabId === sub.id }"
            @click="$emit('select-direct-sub-tab', tab, sub)"
          >
            {{ localize(sub.label) }}
          </button>
        </div>
      </div>
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
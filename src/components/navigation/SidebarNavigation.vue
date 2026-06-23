<script setup>
defineProps({
  activeTab: { type: Object, required: true },
  collapsed: Boolean,
  expandedTabs: { type: Object, required: true },
  lang: { type: String, required: true },
  localize: { type: Function, required: true },
  selection: { type: Object, required: true },
  siteData: { type: Object, required: true },
  sidebarOpen: Boolean,
  ui: { type: Object, required: true },
})

defineEmits([
  'close-menu',
  'select-direct-sub-tab',
  'select-sub-tab',
  'select-tab',
  'toggle-collapse',
  'toggle-expanded',
])
</script>

<template>
  <div v-if="sidebarOpen" class="scrim" @click="$emit('close-menu')" />
  <aside class="sidebar" :class="{ open: sidebarOpen, collapsed }">
    <div class="brand">
      <div class="brand-mark">KSH</div>
      <div v-if="!collapsed" class="brand-copy">
        <strong>{{ localize(siteData.meta.title) }}</strong>
        <span>{{ ui[lang].progress }}</span>
      </div>
    </div>

    <div v-if="!collapsed" class="nav-label">{{ ui[lang].menu }}</div>
    <nav aria-label="Main navigation">
      <div v-for="(tab, tabIndex) in siteData.tabs" :key="tab.id" class="nav-group">
        <button
          class="nav-item top"
          :class="{ active: activeTab.id === tab.id }"
          @click="tab.layout === 'two-level' ? $emit('toggle-expanded', tab.id) : $emit('select-tab', tab)"
        >
          <span class="nav-index">{{ String(tabIndex + 1).padStart(2, '0') }}</span>
          <span v-if="!collapsed" class="nav-text">{{ localize(tab.label) }}</span>
          <span
            v-if="!collapsed && tab.layout === 'two-level'"
            class="chevron"
            :class="{ rotate: expandedTabs.has(tab.id) }"
          >⌄</span>
        </button>

        <div v-if="!collapsed && tab.layout === 'two-level' && expandedTabs.has(tab.id)" class="subnav">
          <button
            v-for="sub in tab.sub_tabs || []"
            :key="sub.id"
            class="sub-item direct-sub-item"
            :class="{ active: selection.subTabId === sub.id }"
            @click="$emit('select-direct-sub-tab', tab, sub)"
          >
            {{ localize(sub.label) }}
          </button>

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
                <span>{{ expandedTabs.has(category.id) ? '−' : '+' }}</span>
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
        </div>
      </div>
    </nav>

    <button
      class="collapse-button"
      :aria-label="collapsed ? ui[lang].openMenu : ui[lang].closeMenu"
      @click="$emit('toggle-collapse')"
    >
      {{ collapsed ? '›' : '‹' }}
      <span v-if="!collapsed">{{ ui[lang].closeMenu }}</span>
    </button>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import siteData from '../site_data.json'
import { uiText } from './config/uiText'
import { useSiteNavigation } from './composables/useSiteNavigation'
import CardListView from './components/content/CardListView.vue'
import GenericTableView from './components/content/GenericTableView.vue'
import PageHeading from './components/content/PageHeading.vue'
import TimelineView from './components/content/TimelineView.vue'
import MatrixSections from './components/MatrixSections.vue'
import SidebarNavigation from './components/navigation/SidebarNavigation.vue'
import TopBar from './components/navigation/TopBar.vue'

const lang = ref(siteData.meta.default_language || 'zh')
const {
  activeContent,
  activeTab,
  collapsed,
  expandedTabs,
  localize,
  navigateInternal,
  pageTitle,
  selectDirectSubTab,
  selectSubTab,
  selectTab,
  selectedYear,
  selection,
  sidebarOpen,
  timelineEntries,
  timelineOrder,
  timelineYears,
  toggleExpanded,
} = useSiteNavigation(siteData, lang)

const openMenu = () => {
  if (collapsed.value) {
    collapsed.value = false
    return
  }
  sidebarOpen.value = true
}
</script>

<template>
  <div class="site-shell">
    <SidebarNavigation
      :active-tab="activeTab"
      :collapsed="collapsed"
      :expanded-tabs="expandedTabs"
      :lang="lang"
      :localize="localize"
      :selection="selection"
      :sidebar-open="sidebarOpen"
      :site-data="siteData"
      :ui="uiText"
      @close-menu="sidebarOpen = false"
      @select-direct-sub-tab="selectDirectSubTab"
      @select-sub-tab="selectSubTab"
      @select-tab="selectTab"
      @toggle-collapse="collapsed = !collapsed"
      @toggle-expanded="toggleExpanded"
    />

    <main class="main" :class="{ expanded: collapsed }">
      <TopBar
        :active-tab="activeTab"
        :collapsed="collapsed"
        :lang="lang"
        :localize="localize"
        :site-data="siteData"
        :title="pageTitle"
        :ui="uiText"
        @open-menu="openMenu"
        @update:lang="lang = $event"
      />

      <section class="content">
        <PageHeading :active-tab="activeTab" :localize="localize" :title="pageTitle" />

        <TimelineView
          v-if="activeContent.layout === 'timeline'"
          v-model:order="timelineOrder"
          v-model:selected-year="selectedYear"
          :empty-text="uiText[lang].empty"
          :entries="timelineEntries"
          :lang="lang"
          :source-label="uiText[lang].sources"
          :years="timelineYears"
        />

        <MatrixSections
          v-else-if="activeContent.matrix_sections"
          :content="activeContent"
          :lang="lang"
        />

        <GenericTableView
          v-else-if="activeContent.layout === 'matrix' || activeContent.layout === 'comparison'"
          :content="activeContent"
          :details-label="uiText[lang].details"
          :empty-text="uiText[lang].empty"
          :lang="lang"
          :source-label="uiText[lang].sources"
          :title="pageTitle"
        />

        <CardListView
          v-else
          :content="activeContent"
          :empty-text="uiText[lang].empty"
          :lang="lang"
          :source-label="uiText[lang].sources"
          @navigate-internal="navigateInternal"
        />
      </section>
    </main>
  </div>
</template>

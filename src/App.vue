<script setup>
/**
 * Root shell component that wires global app state into layout components.
 * @param {object} props - Component props declared below when this is a Vue component.
 * @returns {void} Renders UI or exports module helpers.
 */
import siteData from '../site_data.json'
import { useAppController } from './composables/useAppController'
import CardListView from './components/content/CardListView.vue'
import GenericTableView from './components/content/GenericTableView.vue'
import PageHeading from './components/content/PageHeading.vue'
import SearchResultsView from './components/content/SearchResultsView.vue'
import TimelineView from './components/content/TimelineView.vue'
import MatrixSections from './components/MatrixSections.vue'
import FloatingReturnButton from './components/navigation/FloatingReturnButton.vue'
import PageNodeNavigator from './components/navigation/PageNodeNavigator.vue'
import SidebarNavigation from './components/navigation/SidebarNavigation.vue'
import SiteFooter from './components/SiteFooter.vue'
import TopBar from './components/navigation/TopBar.vue'

const app = useAppController(siteData)
</script>

<template>
  <div class="site-shell">
    <SidebarNavigation
      :active-navigation-node-id="app.activeNavigationNodeId"
      :active-navigation-path-ids="app.activeNavigationPathIds"
      :active-tab="app.activeTab"
      :sidebar-visible="app.sidebarVisible"
      :expanded-tabs="app.expandedTabs"
      :lang="app.lang"
      :localize="app.localize"
      :search-query="app.searchQuery"
      :selection="app.selection"
      :mobile-sidebar-visible="app.mobileSidebarVisible"
      :navigation-tree="app.navigationTree"
      :site-data="siteData"
      :ui="app.uiText"
      @close-menu="app.closeSidebar"
      @search-change="app.updateSearch"
      @submit-search="app.submitSearch"
      @select-direct-sub-tab="app.selectDirectSubTabFromMenu"
      @select-sub-tab="app.selectSubTabFromMenu"
      @select-tab="app.selectTabFromMenu"
      @toggle-sidebar-visible="app.toggleSidebarVisible"
      @toggle-expanded="app.toggleExpanded"
    />

    <main class="main" :class="{ 'sidebar-hidden': !app.sidebarVisible }">
      <TopBar
        :active-tab="app.activeTab"
        :lang="app.lang"
        :localize="app.localize"
        :site-data="siteData"
        :title="app.activeTitle"
        :ui="app.uiText"
        @open-menu="app.openSidebar"
        @update:lang="app.setLanguage"
      />

      <section class="content">
        <SearchResultsView
          v-if="app.activeSearchQuery"
          :empty-text="app.uiText[app.lang].empty"
          :lang="app.lang"
          :query="app.activeSearchQuery"
          :results="app.searchResults"
          @open-result="app.openSearchResult"
        />

        <template v-else>
          <PageHeading :active-tab="app.activeTab" :localize="app.localize" :title="app.pageTitle" />

          <TimelineView
            v-if="app.activeContent.layout === 'timeline'"
            v-model:order="app.timelineOrder"
            v-model:selected-year="app.selectedYear"
            :empty-text="app.uiText[app.lang].empty"
            :entries="app.timelineEntries"
            :lang="app.lang"
            :source-label="app.uiText[app.lang].sources"
            :years="app.timelineYears"
            :show-year-filter="app.activeContent.show_year_filter !== false"
          />

          <MatrixSections
            v-else-if="app.activeContent.matrix_sections"
            :content="app.activeContent"
            :lang="app.lang"
          />

          <GenericTableView
            v-else-if="app.activeContent.layout === 'matrix' || app.activeContent.layout === 'comparison'"
            :content="app.activeContent"
            :details-label="app.uiText[app.lang].details"
            :empty-text="app.uiText[app.lang].empty"
            :lang="app.lang"
            :source-label="app.uiText[app.lang].sources"
            :title="app.pageTitle"
          />

          <CardListView
            v-else
            :content="app.activeContent"
            :empty-text="app.uiText[app.lang].empty"
            :lang="app.lang"
            :source-label="app.uiText[app.lang].sources"
            @navigate-internal="app.openInternalLink"
          />
        </template>
      </section>

      <SiteFooter />
    </main>

    <PageNodeNavigator
      v-if="!app.activeSearchQuery"
      :content="app.activeContent"
      :lang="app.lang"
      :timeline-entries="app.timelineEntries"
    />

    <FloatingReturnButton
      v-if="app.canReturn"
      :label="app.returnLabel"
      @return="app.returnToPreviousView"
    />
  </div>
</template>

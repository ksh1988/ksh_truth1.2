<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import siteData from '../site_data.json'
import MediaBlock from './components/MediaBlock.vue'
import LinkBlock from './components/LinkBlock.vue'
import MatrixSections from './components/MatrixSections.vue'

const ui = {
  zh: { menu: '资料目录', progress: '司法进展', sources: '资料来源', details: '详细信息', empty: '暂无此语言的图片', openMenu: '打开菜单', closeMenu: '收起菜单' },
  ko: { menu: '자료 목록', progress: '사법 진행', sources: '자료 출처', details: '상세 정보', empty: '이 언어의 이미지가 없습니다', openMenu: '메뉴 열기', closeMenu: '메뉴 닫기' },
  en: { menu: 'Contents', progress: 'Legal progress', sources: 'Sources', details: 'Details', empty: 'No images in this language', openMenu: 'Open menu', closeMenu: 'Close menu' },
}

const languageNames = { zh: '中文', ko: '한국어', en: 'English' }
const timelineUi = {
  zh: { year: '年份筛选', all: '全部年份', order: '时间顺序', desc: '最新优先', asc: '最早优先' },
  ko: { year: '연도 필터', all: '전체 연도', order: '시간 순서', desc: '최신순', asc: '오래된순' },
  en: { year: 'Filter by year', all: 'All years', order: 'Date order', desc: 'Newest first', asc: 'Oldest first' },
}
const fieldLabels = {
  nature: { zh: '进展性质', ko: '진행 성격', en: 'Nature' },
  plaintiff: { zh: '原告 / 举报方', ko: '원고 / 신고자', en: 'Plaintiff / Reporter' },
  defendant: { zh: '被告 / 被举报方', ko: '피고 / 피신고자', en: 'Defendant / Reported Party' },
  charge: { zh: '涉及事由', ko: '혐의 / 사유', en: 'Charge / Matter' },
  result: { zh: '处理结果', ko: '처리 결과', en: 'Result' },
}
const lang = ref(siteData.meta.default_language || 'zh')
const sidebarOpen = ref(false)
const collapsed = ref(false)
const expandedTabs = ref(new Set())
const timelineOrder = ref('desc')
const selectedYear = ref('all')
const defaultTab = siteData.tabs.find((tab) => tab.id === 'rights') || siteData.tabs[0]
const defaultSubTab = defaultTab.sub_tabs?.[0] || defaultTab.categories?.[0]?.sub_tabs?.[0]
const selection = ref({ tabId: defaultTab.id, categoryId: null, subTabId: defaultSubTab?.id || null })

const localize = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang.value] ?? value.zh ?? value.en ?? value.ko ?? ''
  }
  return value ?? ''
}

const activeTab = computed(() => siteData.tabs.find((tab) => tab.id === selection.value.tabId) || defaultTab)
const activeCategory = computed(() => activeTab.value.categories?.find((cat) => cat.id === selection.value.categoryId))
const activeContent = computed(() => {
  if (activeTab.value.layout !== 'two-level') return activeTab.value
  const directSubTab = activeTab.value.sub_tabs?.find((sub) => sub.id === selection.value.subTabId)
  return directSubTab || activeCategory.value?.sub_tabs?.find((sub) => sub.id === selection.value.subTabId) || activeTab.value.sub_tabs?.[0] || activeCategory.value?.sub_tabs?.[0] || activeTab.value
})
const title = computed(() => localize(activeContent.value.label) || localize(activeTab.value.label))

const selectTab = (tab) => {
  if (tab.layout === 'two-level') {
    const category = tab.categories?.[0]
    const subTab = tab.sub_tabs?.[0] || category?.sub_tabs?.[0]
    selection.value = { tabId: tab.id, categoryId: tab.sub_tabs?.length ? null : category?.id || null, subTabId: subTab?.id || null }
    expandedTabs.value = new Set([tab.id, category?.id].filter(Boolean))
  } else {
    selection.value = { tabId: tab.id, categoryId: null, subTabId: null }
  }
  sidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const navigateInternal = (target) => {
  const tab = siteData.tabs.find((item) => item.id === target.tab_id)
  const category = tab?.categories?.find((item) => item.id === target.category_id)
  const subTab = category?.sub_tabs?.find((item) => item.id === target.sub_tab_id) || tab?.sub_tabs?.find((item) => item.id === target.sub_tab_id)
  if (!tab || !subTab) return
  selection.value = { tabId: tab.id, categoryId: category?.id || null, subTabId: subTab.id }
  expandedTabs.value = new Set([tab.id, category?.id].filter(Boolean))
  sidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const selectDirectSubTab = (tab, subTab) => {
  selection.value = { tabId: tab.id, categoryId: null, subTabId: subTab.id }
  sidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const selectSubTab = (tab, category, subTab) => {
  selection.value = { tabId: tab.id, categoryId: category.id, subTabId: subTab.id }
  sidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleExpanded = (id) => {
  const next = new Set(expandedTabs.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedTabs.value = next
}

const imagesFor = (item) => [...(item.imgs?.[lang.value] || []), ...(item.imgs?.shared || [])]
const itemTitle = (item) => localize(item.title || item.event || item.label)
const itemDescription = (item) => localize(item.description)
const fieldLabel = (key) => localize(fieldLabels[key]) || key
const entriesFor = (content) => content.entries || content.items || content.events || []
const timelineYears = computed(() => [...new Set(entriesFor(activeContent.value)
  .map((item) => String(item.time || '').slice(0, 4))
  .filter((year) => /^\d{4}$/.test(year)))]
  .sort((a, b) => Number(b) - Number(a)))
const timelineEntries = computed(() => entriesFor(activeContent.value)
  .filter((item) => selectedYear.value === 'all' || String(item.time || '').startsWith(selectedYear.value))
  .slice()
  .sort((a, b) => {
    const comparison = String(a.time || '').localeCompare(String(b.time || ''))
    return timelineOrder.value === 'desc' ? -comparison : comparison
  }))
const yearOptionLabel = (year) => lang.value === 'zh' ? `${year}年` : lang.value === 'ko' ? `${year}년` : year
const displayFields = (item) => Object.entries(item).filter(([key, value]) =>
  !['id', 'time', 'title', 'event', 'description', 'imgs', 'link', 'videos', 'extras', 'index'].includes(key) && value !== '' && value != null
)
const formatDate = (date) => {
  const raw = String(date || '')
  return /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)}` : raw
}
const safeText = (text) => String(localize(text))
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/==(.+?)==/g, '<mark>$1</mark>')
  .replace(/\n/g, '<br>')

const onKeydown = (event) => {
  if (event.key === 'Escape') sidebarOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
watch(lang, () => { document.documentElement.lang = lang.value === 'zh' ? 'zh-CN' : lang.value })
</script>

<template>
  <div class="site-shell">
    <div v-if="sidebarOpen" class="scrim" @click="sidebarOpen = false" />
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
        <div v-for="tab in siteData.tabs" :key="tab.id" class="nav-group">
          <button class="nav-item top" :class="{ active: activeTab.id === tab.id }" @click="tab.layout === 'two-level' ? toggleExpanded(tab.id) : selectTab(tab)">
            <span class="nav-index">{{ String(siteData.tabs.indexOf(tab) + 1).padStart(2, '0') }}</span>
            <span v-if="!collapsed" class="nav-text">{{ localize(tab.label) }}</span>
            <span v-if="!collapsed && tab.layout === 'two-level'" class="chevron" :class="{ rotate: expandedTabs.has(tab.id) }">⌄</span>
          </button>
          <div v-if="!collapsed && tab.layout === 'two-level' && expandedTabs.has(tab.id)" class="subnav">
            <button v-for="sub in tab.sub_tabs || []" :key="sub.id" class="sub-item direct-sub-item" :class="{ active: selection.subTabId === sub.id }" @click="selectDirectSubTab(tab, sub)">
              {{ localize(sub.label) }}
            </button>
            <div v-for="category in tab.categories || []" :key="category.id">
              <button v-if="category.sub_tabs?.length === 1" class="sub-item category-single" :class="{ active: selection.subTabId === category.sub_tabs[0].id }" @click="selectSubTab(tab, category, category.sub_tabs[0])">
                {{ localize(category.sub_tabs[0].label) }}
              </button>
              <template v-else>
                <button class="category" @click="toggleExpanded(category.id)">
                  <span>{{ localize(category.label) }}</span><span>{{ expandedTabs.has(category.id) ? '−' : '+' }}</span>
                </button>
                <div v-if="expandedTabs.has(category.id)">
                  <button v-for="sub in category.sub_tabs" :key="sub.id" class="sub-item" :class="{ active: selection.subTabId === sub.id }" @click="selectSubTab(tab, category, sub)">
                    {{ localize(sub.label) }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </nav>
      <button class="collapse-button" @click="collapsed = !collapsed" :aria-label="collapsed ? ui[lang].openMenu : ui[lang].closeMenu">
        {{ collapsed ? '›' : '‹' }}<span v-if="!collapsed">{{ ui[lang].closeMenu }}</span>
      </button>
    </aside>

    <main class="main" :class="{ expanded: collapsed }">
      <header class="topbar">
        <button class="mobile-menu" @click="collapsed ? collapsed = false : sidebarOpen = true" :aria-label="ui[lang].openMenu"><span></span><span></span><span></span></button>
        <div class="breadcrumb"><span>{{ localize(activeTab.label) }}</span><b>/</b><strong>{{ title }}</strong></div>
        <div class="languages" aria-label="Language selector">
          <button v-for="code in siteData.meta.languages" :key="code" :class="{ active: lang === code }" @click="lang = code">{{ languageNames[code] }}</button>
        </div>
      </header>

      <section class="content">
        <div class="page-heading">
          <span v-if="activeTab.layout === 'two-level' && title !== localize(activeTab.label)" class="eyebrow">{{ localize(activeTab.label) }}</span>
          <h1>{{ title }}</h1>
          <div class="heading-line"></div>
        </div>

        <div v-if="activeContent.layout === 'timeline'" class="timeline">
          <div class="timeline-controls">
            <label class="year-filter">
              <span>{{ timelineUi[lang].year }}</span>
              <select v-model="selectedYear" :aria-label="timelineUi[lang].year">
                <option value="all">{{ timelineUi[lang].all }}</option>
                <option v-for="year in timelineYears" :key="year" :value="year">{{ yearOptionLabel(year) }}</option>
              </select>
            </label>
            <div class="order-control" role="group" :aria-label="timelineUi[lang].order">
              <span>{{ timelineUi[lang].order }}</span>
              <div class="order-buttons">
                <button :class="{ active: timelineOrder === 'desc' }" @click="timelineOrder = 'desc'">{{ timelineUi[lang].desc }}</button>
                <button :class="{ active: timelineOrder === 'asc' }" @click="timelineOrder = 'asc'">{{ timelineUi[lang].asc }}</button>
              </div>
            </div>
          </div>
          <article v-for="(item, index) in timelineEntries" :key="item.id || index" class="timeline-item">
            <div class="timeline-rail"><span class="dot"></span><span class="line"></span></div>
            <div class="timeline-card">
              <time>{{ formatDate(item.time) }}</time>
              <h2>{{ itemTitle(item) }}</h2>
              <div v-if="displayFields(item).length" class="case-meta">
                <div v-for="([key, value]) in displayFields(item)" :key="key"><span>{{ fieldLabel(key) }}</span><strong>{{ localize(value) }}</strong></div>
              </div>
              <MediaBlock :item="item" :lang="lang" :empty-text="ui[lang].empty" />
              <LinkBlock :links="item.link" :label="ui[lang].sources" />
            </div>
          </article>
        </div>

        <MatrixSections v-else-if="activeContent.matrix_sections" :content="activeContent" :lang="lang" />

        <div v-else-if="activeContent.layout === 'matrix' || activeContent.layout === 'comparison'" class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>{{ title }}</th><th>{{ ui[lang].details }}</th><th>{{ ui[lang].sources }}</th></tr></thead>
            <tbody>
              <tr v-for="(item, index) in entriesFor(activeContent)" :key="item.id || index">
                <td>{{ String(index + 1).padStart(2, '0') }}</td>
                <td><strong>{{ itemTitle(item) }}</strong><div v-if="itemDescription(item)" class="rich" v-html="safeText(itemDescription(item))"></div></td>
                <td><dl><template v-for="([key, value]) in Object.entries(item.extras || {})" :key="key"><dt>{{ key }}</dt><dd>{{ localize(value) }}</dd></template></dl></td>
                <td><MediaBlock :item="item" :lang="lang" :compact="true" :empty-text="ui[lang].empty" /><LinkBlock :links="item.link" :label="ui[lang].sources" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="card-list">
          <article v-for="(item, index) in entriesFor(activeContent)" :key="item.id || index" class="evidence-card">
            <div class="card-number">{{ String(item.index || index + 1).padStart(2, '0') }}</div>
            <div class="card-body">
              <h2>
                <button v-if="item.internal_link" class="internal-card-link" @click="navigateInternal(item.internal_link)">
                  <span>{{ itemTitle(item) }}</span><b aria-hidden="true">→</b>
                </button>
                <template v-else>{{ itemTitle(item) }}</template>
              </h2>
              <div v-if="itemDescription(item)" class="rich" v-html="safeText(itemDescription(item))"></div>
              <div v-if="Object.keys(item.extras || {}).length" class="facts extra-facts">
                <div v-for="([key, value]) in Object.entries(item.extras)" :key="key"><span>{{ key }}</span><strong>{{ localize(value) }}</strong></div>
              </div>
              <MediaBlock :item="item" :lang="lang" :empty-text="ui[lang].empty" />
              <LinkBlock :links="item.link" :label="ui[lang].sources" />
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

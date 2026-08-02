<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { loadBusuanziCounter } from '../utils/busuanzi'

const HISTORICAL_SITE_VIEWS = 1643
const displayedSiteViews = ref('...')
let counterObserver = null

/**
 * Renders site-level footer information such as visitor statistics.
 * @param {string} lang - Current language code used to pick translated labels.
 * @param {object} ui - UI text map keyed by language.
 * @returns {void} Renders footer UI only.
 */
defineProps({
  lang: { type: String, required: true },
  ui: { type: Object, required: true },
})

/**
 * Reads the current external count and adds the recovered historical total.
 * @returns {void} Updates the visible site view count when a numeric value is available.
 */
function updateDisplayedSiteViews() {
  const source = document.getElementById('busuanzi_site_pv')
  const currentViews = Number.parseInt(String(source?.textContent || '').replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(currentViews)) return
  displayedSiteViews.value = (HISTORICAL_SITE_VIEWS + currentViews).toLocaleString('en-US')
}

/**
 * Observes the raw counter value written by the external service.
 * @returns {void} Updates the displayed total whenever the source node changes.
 */
function observeVisitorCounter() {
  const source = document.getElementById('busuanzi_site_pv')
  if (!source) return
  counterObserver = new MutationObserver(updateDisplayedSiteViews)
  counterObserver.observe(source, { childList: true, characterData: true, subtree: true })
  updateDisplayedSiteViews()
}

/**
 * Loads the current visitor count and combines it with the recovered historical total.
 * @returns {Promise<void>} Starts observing the external counter source.
 */
async function initializeVisitorCounter() {
  await nextTick()
  observeVisitorCounter()
  await loadBusuanziCounter().catch(() => false)
  updateDisplayedSiteViews()
}

/**
 * Stops observing the third-party counter when the footer leaves the page.
 * @returns {void} Disconnects the active mutation observer.
 */
function stopVisitorCounterObserver() {
  counterObserver?.disconnect()
}

onMounted(initializeVisitorCounter)
onBeforeUnmount(stopVisitorCounterObserver)
</script>

<template>
  <footer class="site-footer" aria-label="Site statistics">
    <span id="busuanzi_container_site_pv" class="site-views">
      <span>{{ ui[lang].siteViewsPrefix }}</span>
      <span id="busuanzi_site_pv" class="busuanzi-counter-source" aria-hidden="true"></span>
      <span class="site-views-count" aria-live="polite">{{ displayedSiteViews }}</span>
      <span v-if="ui[lang].siteViewsSuffix">{{ ui[lang].siteViewsSuffix }}</span>
    </span>
  </footer>
</template>

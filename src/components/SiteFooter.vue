<script setup>
import { nextTick, onMounted } from 'vue'
import { loadBusuanziCounter } from '../utils/busuanzi'

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
 * Loads the visitor counter after Vue has inserted the footer target elements.
 * @returns {Promise<void>} Updates the counter DOM through the external script.
 */
async function initializeVisitorCounter() {
  await nextTick()
  await loadBusuanziCounter().catch(() => false)
}

onMounted(initializeVisitorCounter)
</script>

<template>
  <footer class="site-footer" aria-label="Site statistics">
    <span id="busuanzi_container_site_pv" class="site-views">
      <span>{{ ui[lang].siteViewsPrefix }}</span>
      <span id="busuanzi_value_site_pv" aria-live="polite">...</span>
      <span v-if="ui[lang].siteViewsSuffix">{{ ui[lang].siteViewsSuffix }}</span>
    </span>
  </footer>
</template>

<script setup>
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
</script>

<template>
  <footer class="site-footer" aria-label="Site statistics">
    <span id="busuanzi_container_site_pv" class="site-views">
      <span>{{ ui[lang].siteViewsPrefix }}</span>
      <span id="busuanzi_value_site_pv"></span>
      <span v-if="ui[lang].siteViewsSuffix">{{ ui[lang].siteViewsSuffix }}</span>
    </span>
  </footer>
</template>

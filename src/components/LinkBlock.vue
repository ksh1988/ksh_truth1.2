<script setup>
/**
 * Displays external source links with localized titles.
 * @param {object} props - Component props declared below.
 * @returns {void} Renders source links for the current language.
 */
import { localizeValue } from '../utils/localization'

defineProps({
  lang: { type: String, default: 'zh' },
  links: { type: Array, default: () => [] },
  label: { type: String, default: '' },
})

/**
 * Returns the visible title for one external source link.
 * @param {object} link - Source link data from site_data.json.
 * @param {string} lang - Current language code.
 * @returns {string} Localized link title or URL fallback.
 */
const linkTitle = (link, lang) => localizeValue(link.title, lang) || link.url
</script>

<template>
  <div v-if="links.length" class="source-links">
    <span>{{ label }}</span>
    <a v-for="(link, index) in links" :key="link.url + '-' + index" :href="link.url" target="_blank" rel="noopener noreferrer">{{ linkTitle(link, lang) }} &rarr;</a>
  </div>
</template>

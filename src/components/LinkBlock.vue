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

const emit = defineEmits(['navigate-internal'])

/**
 * Returns the visible title for one external source link.
 * @param {object} link - Source link data from site_data.json.
 * @param {string} lang - Current language code.
 * @returns {string} Localized link title or URL fallback.
 */
const linkTitle = (link, lang) => localizeValue(link.title, lang) || link.url

/**
 * Emits a site-internal navigation request for a source item.
 * @param {object} target - Internal target ids used by site navigation.
 * @returns {void} Notifies the parent component to navigate.
 */
const openInternalLink = (target) => {
  if (target) emit('navigate-internal', target)
}
</script>

<template>
  <div v-if="links.length" class="source-links">
    <span>{{ label }}</span>
    <template v-for="(link, index) in links" :key="(link.url || linkTitle(link, lang)) + '-' + index">
      <button v-if="link.internal_link" class="source-internal-link" type="button" @click="openInternalLink(link.internal_link)">{{ linkTitle(link, lang) }} &rarr;</button>
      <a v-else-if="link.url" :href="link.url" target="_blank" rel="noopener noreferrer">{{ linkTitle(link, lang) }} &rarr;</a>
      <span v-else class="source-link-text">{{ linkTitle(link, lang) }}</span>
    </template>
  </div>
</template>

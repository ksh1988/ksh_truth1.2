<script setup>
defineProps({
  links: { type: Array, default: () => [] },
  label: { type: String, default: '' },
})
</script>

<template>
  <div v-if="links.length" class="source-links">
    <span>{{ label }}</span>
    <a v-for="(link, index) in links" :key="`${link.url}-${index}`" :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.title || link.url }} ↗</a>
  </div>
</template>

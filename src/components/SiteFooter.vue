<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { recordSiteVisit, readSiteViews } from '../utils/goatcounter'

defineProps({
  lang: { type: String, required: true },
  ui: { type: Object, required: true },
})

const displayedSiteViews = ref('...')
const unavailable = ref(false)
const controller = new AbortController()
let timeout
let disposed = false

onMounted(async () => {
  recordSiteVisit()
  timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const count = await readSiteViews(controller.signal)
    if (!disposed) displayedSiteViews.value = count.toLocaleString('en-US')
  } catch {
    if (!disposed) unavailable.value = true
  } finally {
    clearTimeout(timeout)
  }
})

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(timeout)
  controller.abort()
})
</script>

<template>
  <footer class="site-footer" aria-label="Site statistics">
    <span class="site-views">
      <span>{{ ui[lang].siteViewsPrefix }}</span>
      <span class="site-views-count" aria-live="polite">{{ unavailable ? ui[lang].siteViewsUnavailable : displayedSiteViews }}</span>
      <span v-if="!unavailable && ui[lang].siteViewsSuffix">{{ ui[lang].siteViewsSuffix }}</span>
    </span>
  </footer>
</template>

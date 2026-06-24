<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  lang: { type: String, required: true },
  compact: Boolean,
  emptyText: { type: String, default: '' },
})

const failed = ref(new Set())
const container = ref(null)
const shouldLoad = ref(false)
let observer

const images = computed(() => [
  ...(props.item.imgs?.[props.lang] || []),
  ...(props.item.imgs?.shared || []),
])
const loadingText = computed(() => ({ zh: '图片将在滚动到此处时加载', ko: '스크롤하면 이미지가 로드됩니다', en: 'Images load as you scroll' })[props.lang] || 'Images load as you scroll')

const loadNow = () => {
  shouldLoad.value = true
  observer?.disconnect()
}

const isBeforeTarget = (target) => {
  if (!container.value || !target) return false
  return Boolean(container.value.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)
}

const forceLoadBeforeSearchTarget = (event) => {
  if (isBeforeTarget(event.detail?.target)) loadNow()
}

onMounted(() => {
  window.addEventListener('search-load-media-before-target', forceLoadBeforeSearchTarget)

  if (!('IntersectionObserver' in window)) {
    loadNow()
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadNow()
  }, { rootMargin: '120px 0px' })
  if (container.value) observer.observe(container.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('search-load-media-before-target', forceLoadBeforeSearchTarget)
})
watch(() => props.lang, () => { failed.value = new Set() })
const markFailed = (src) => { failed.value = new Set([...failed.value, src]) }
</script>

<template>
  <div v-if="images.length" ref="container" class="media-observer">
    <div v-if="shouldLoad" class="media-grid" :class="{ compact }">
      <a v-for="(src, index) in images" :key="`${src}-${index}`" :href="src" target="_blank" rel="noopener noreferrer" class="media-item">
        <img v-if="!failed.has(src)" :src="src" :alt="item.title || item.event || '资料图片'" loading="lazy" decoding="async" fetchpriority="low" referrerpolicy="no-referrer" @error="markFailed(src)">
        <span v-else class="image-error">{{ emptyText }}<small>{{ src }}</small></span>
      </a>
    </div>
    <div v-else class="media-deferred" aria-live="off">
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

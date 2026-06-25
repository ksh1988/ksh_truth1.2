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
const downloadLabel = computed(() => ({ zh: '下载图片', ko: '이미지 다운로드', en: 'Download image' })[props.lang] || 'Download image')

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

const extensionFrom = (src) => {
  const clean = String(src).split('?')[0].split('#')[0]
  const extension = clean.match(/.([a-zA-Z0-9]{2,5})$/)?.[1]
  return extension || 'jpg'
}

const safeTitle = () => String(props.item.title?.[props.lang] || props.item.title || props.item.event?.[props.lang] || props.item.event || 'image')
  .replace(/[\/:*?"<>|]+/g, '-')
  .replace(/s+/g, '-')
  .slice(0, 60)

const imageFileName = (src, index) => {
  const title = safeTitle() || 'image'
  return title + '-' + (index + 1) + '.' + extensionFrom(src)
}

const saveDownload = (href, filename) => {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const downloadImage = async (event, src, index) => {
  event.preventDefault()
  event.stopPropagation()

  const filename = imageFileName(src, index)
  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error('download failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    saveDownload(objectUrl, filename)
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch {
    saveDownload(src, filename)
  }
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
      <a v-for="(src, index) in images" :key="src + '-' + index" :href="src" target="_blank" rel="noopener noreferrer" class="media-item">
        <img v-if="!failed.has(src)" :src="src" :alt="item.title || item.event || '资料图片'" loading="lazy" decoding="async" fetchpriority="low" referrerpolicy="no-referrer" @error="markFailed(src)">
        <button
          v-if="!failed.has(src)"
          class="image-download-button"
          type="button"
          :aria-label="downloadLabel"
          :title="downloadLabel"
          @click="downloadImage($event, src, index)"
        >
          <span aria-hidden="true"></span>
        </button>
        <span v-else class="image-error">{{ emptyText }}<small>{{ src }}</small></span>
      </a>
    </div>
    <div v-else class="media-deferred" aria-live="off">
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

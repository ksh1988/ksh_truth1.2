<script setup>
/**
 * Renders image evidence, download actions, and an in-page preview carousel.
 * @param {object} props - Component props declared below.
 * @returns {void} Renders media UI for one content entity.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { downloadMedia, mediaFileName, shouldUsePreviewSaveFallback } from '../utils/mediaDownload'
import { resolveMediaSrc } from '../utils/mediaSource'

const props = defineProps({
  item: { type: Object, required: true },
  lang: { type: String, required: true },
  compact: Boolean,
  emptyText: { type: String, default: '' },
})

const failed = ref(new Set())
const container = ref(null)
const shouldLoad = ref(false)
const previewIndex = ref(-1)
const saveHintVisible = ref(false)
const previewZoomed = ref(false)
const touchStartX = ref(0)
let observer

const images = computed(() => [
  ...(props.item.imgs?.[props.lang] || []),
  ...(props.item.imgs?.shared || []),
].map(resolveMediaSrc).filter(Boolean))
const loadingText = computed(() => ({ zh: 'Images load as you scroll', ko: 'Images load as you scroll', en: 'Images load as you scroll' })[props.lang] || 'Images load as you scroll')
const downloadLabel = computed(() => ({ zh: '保存图片', ko: 'Save image', en: 'Save image' })[props.lang] || 'Save image')
const closeLabel = computed(() => ({ zh: 'Close image preview', ko: 'Close image preview', en: 'Close image preview' })[props.lang] || 'Close image preview')
const previousLabel = computed(() => ({ zh: 'Previous image', ko: 'Previous image', en: 'Previous image' })[props.lang] || 'Previous image')
const nextLabel = computed(() => ({ zh: 'Next image', ko: 'Next image', en: 'Next image' })[props.lang] || 'Next image')
const saveHintLabel = computed(() => ({ zh: '安卓微信请长按图片保存到手机', ko: 'In Android WeChat, long press the image to save it', en: 'In Android WeChat, long press the image to save it' })[props.lang] || 'Long press the image to save it')
const previewOpen = computed(() => previewIndex.value >= 0 && images.value[previewIndex.value])
const previewSrc = computed(() => previewOpen.value ? images.value[previewIndex.value] : '')
const hasMultipleImages = computed(() => images.value.length > 1)
const zoomLabel = computed(() => ({ zh: '放大图片', ko: '이미지 확대', en: 'Zoom image' })[props.lang] || 'Zoom image')

/**
 * Forces the media block to load immediately.
 * @returns {void} Enables image rendering and disconnects lazy observer.
 */
const loadNow = () => {
  shouldLoad.value = true
  observer?.disconnect()
}

/**
 * Checks whether this media block appears before a search target.
 * @param {Element} target - Search focus target element.
 * @returns {boolean} True when this block is before the target.
 */
const isBeforeTarget = (target) => {
  if (!container.value || !target) return false
  return Boolean(container.value.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)
}

/**
 * Loads media before the target used by search positioning.
 * @param {CustomEvent} event - Search preload event.
 * @returns {void} Loads images when needed.
 */
const forceLoadBeforeSearchTarget = (event) => {
  if (isBeforeTarget(event.detail?.target)) loadNow()
}

/**
 * Handles media download button clicks.
 * @param {MouseEvent} event - Button click event.
 * @param {string} src - Image URL to download.
 * @param {number} index - Image index used for filename.
 * @returns {Promise<void>} Resolves when download or share action is triggered.
 */
const downloadImage = async (event, src, index) => {
  event.preventDefault()
  event.stopPropagation()

  if (shouldUsePreviewSaveFallback()) {
    saveHintVisible.value = true
    openPreview(index)
    return
  }

  const filename = mediaFileName({ item: props.item, lang: props.lang, src, index })
  await downloadMedia({ src, filename })
}

/**
 * Opens the in-page image preview at the selected image.
 * @param {number} index - Image index to preview.
 * @returns {void} Updates preview state and locks background scroll.
 */
const openPreview = (index) => {
  previewIndex.value = index
  previewZoomed.value = false
  document.body.classList.add('media-preview-open')
}

/**
 * Closes the in-page image preview and restores normal page scrolling.
 * @returns {void} Clears preview state.
 */
const closePreview = () => {
  previewIndex.value = -1
  saveHintVisible.value = false
  previewZoomed.value = false
  document.body.classList.remove('media-preview-open')
}

/**
 * Moves the preview carousel by one step with wraparound.
 * @param {number} step - Positive for next image, negative for previous image.
 * @returns {void} Updates the preview index.
 */
const movePreview = (step) => {
  if (!previewOpen.value || !images.value.length) return
  previewZoomed.value = false
  previewIndex.value = (previewIndex.value + step + images.value.length) % images.value.length
}

/**
 * Toggles between fit-to-screen preview and scrollable original-size preview.
 * @returns {void} Updates preview zoom state.
 */
const togglePreviewZoom = () => {
  previewZoomed.value = !previewZoomed.value
}

/**
 * Handles keyboard shortcuts for the preview carousel.
 * @param {KeyboardEvent} event - Window keyboard event.
 * @returns {void} Closes or navigates the preview.
 */
const handlePreviewKeydown = (event) => {
  if (!previewOpen.value) return
  if (event.key === 'Escape') closePreview()
  if (event.key === 'Enter' || event.key === ' ') togglePreviewZoom()
  if (!previewZoomed.value && event.key === 'ArrowLeft') movePreview(-1)
  if (!previewZoomed.value && event.key === 'ArrowRight') movePreview(1)
}

/**
 * Stores the start position for a touch swipe gesture.
 * @param {TouchEvent} event - Touch start event.
 * @returns {void} Saves the first touch x position.
 */
const handleTouchStart = (event) => {
  touchStartX.value = event.touches?.[0]?.clientX || 0
}

/**
 * Converts a horizontal touch swipe into previous or next navigation.
 * @param {TouchEvent} event - Touch end event.
 * @returns {void} Moves the preview when swipe distance is large enough.
 */
const handleTouchEnd = (event) => {
  if (previewZoomed.value) return
  const endX = event.changedTouches?.[0]?.clientX || 0
  const delta = endX - touchStartX.value
  if (Math.abs(delta) < 42) return
  movePreview(delta > 0 ? -1 : 1)
}

onMounted(() => {
  window.addEventListener('search-load-media-before-target', forceLoadBeforeSearchTarget)
  window.addEventListener('keydown', handlePreviewKeydown)

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
  window.removeEventListener('keydown', handlePreviewKeydown)
  document.body.classList.remove('media-preview-open')
})

watch(() => props.lang, () => { failed.value = new Set() })
watch(images, () => { if (previewIndex.value >= images.value.length) closePreview() })

/**
 * Marks an image URL as failed so the fallback UI is shown.
 * @param {string} src - Failed image URL.
 * @returns {void} Adds the URL to the failed set.
 */
const markFailed = (src) => { failed.value = new Set([...failed.value, src]) }
</script>

<template>
  <div v-if="images.length" ref="container" class="media-observer">
    <div v-if="shouldLoad" class="media-grid" :class="{ compact }">
      <div v-for="(src, index) in images" :key="src + '-' + index" class="media-item">
        <button v-if="!failed.has(src)" type="button" class="media-preview-button" @click="openPreview(index)">
          <img :src="src" :alt="item.title || item.event || 'image'" loading="lazy" decoding="async" fetchpriority="low" referrerpolicy="no-referrer" @error="markFailed(src)">
        </button>
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
      </div>
    </div>
    <div v-else class="media-deferred" aria-live="off">
      <span>{{ loadingText }}</span>
    </div>
    <Teleport to="body">
      <div v-if="previewOpen" class="media-preview-actions">
        <button type="button" class="media-preview-zoom" :class="{ active: previewZoomed }" :aria-label="zoomLabel" @click="togglePreviewZoom"></button>
        <button type="button" class="media-preview-close" :aria-label="closeLabel" @click="closePreview"></button>
      </div>
      <div
        v-if="previewOpen"
        :class="{ zoomed: previewZoomed }"
        class="media-preview-layer"
        role="dialog"
        aria-modal="true"
        @click.self="closePreview"
        @touchstart.passive="handleTouchStart"
        @touchend.passive="handleTouchEnd"
      >
        <button v-if="hasMultipleImages" type="button" class="media-preview-nav previous" :aria-label="previousLabel" @click="movePreview(-1)"></button>
        <div v-if="saveHintVisible" class="media-save-hint">{{ saveHintLabel }}</div>
        <figure class="media-preview-frame" :class="{ zoomed: previewZoomed }">
          <img :src="previewSrc" alt="" class="media-preview-image" :class="{ zoomed: previewZoomed }" referrerpolicy="no-referrer" @click.stop="togglePreviewZoom">
          <figcaption v-if="hasMultipleImages" class="media-preview-count">{{ previewIndex + 1 }} / {{ images.length }}</figcaption>
        </figure>
        <button v-if="hasMultipleImages" type="button" class="media-preview-nav next" :aria-label="nextLabel" @click="movePreview(1)"></button>
      </div>
    </Teleport>
  </div>
</template>

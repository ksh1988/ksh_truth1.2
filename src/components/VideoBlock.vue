<script setup>
/**
 * Displays video evidence attached to one content entity.
 * @param {object} props - Component props declared below.
 * @returns {void} Renders video cards for the current language.
 */
import { computed } from 'vue'
import { downloadMedia, mediaFileName } from '../utils/mediaDownload'
import { localizeValue } from '../utils/localization'
import { resolveMediaSrc } from '../utils/mediaSource'

const props = defineProps({
  item: { type: Object, required: true },
  lang: { type: String, required: true },
  compact: Boolean,
})

/**
 * Normalizes a raw video item into an object with title and src fields.
 * @param {string|object} video - Raw video value from site_data.json.
 * @returns {{ title: string, src: string }} Normalized video metadata.
 */
const normalizeVideo = (video) => {
  if (typeof video === 'string') return { title: '', src: resolveMediaSrc(video) }
  return {
    title: localizeValue(video?.title, props.lang),
    src: resolveMediaSrc(localizeValue(video?.src, props.lang) || video?.src || ''),
  }
}

/**
 * Returns the video list visible for the active language.
 * @returns {Array<{ title: string, src: string }>} Normalized videos with usable src values.
 */
const videos = computed(() => {
  const raw = props.item.videos
  const list = Array.isArray(raw)
    ? raw
    : [
      ...(raw?.[props.lang] || []),
      ...(raw?.shared || []),
    ]

  return list.map(normalizeVideo).filter((video) => video.src)
})

/**
 * Builds a stable title for one video card.
 * @param {{ title: string }} video - Normalized video metadata.
 * @param {number} index - Video index in the visible list.
 * @returns {string} Display title for the video card.
 */
const videoTitle = (video, index) => video.title || 'Video ' + (index + 1)

const downloadLabel = computed(() => ({ zh: '下载视频', ko: 'Download video', en: 'Download video' })[props.lang] || 'Download video')

/**
 * Downloads one video file from the card action button.
 * @param {MouseEvent} event - Button click event.
 * @param {{ src: string, title: string }} video - Normalized video metadata.
 * @param {number} index - Video index used for filename.
 * @returns {Promise<void>} Resolves after the browser download/share action is triggered.
 */
const downloadVideo = async (event, video, index) => {
  event.preventDefault()
  event.stopPropagation()

  const filename = mediaFileName({
    item: { ...props.item, title: video.title || props.item.title },
    lang: props.lang,
    src: video.src,
    index,
  })
  await downloadMedia({ src: video.src, filename })
}
</script>

<template>
  <div v-if="videos.length" class="video-grid" :class="{ compact }">
    <figure v-for="(video, index) in videos" :key="video.src + '-' + index" class="video-card">
      <figcaption>{{ videoTitle(video, index) }}</figcaption>
      <button
        class="video-download-button image-download-button"
        type="button"
        :aria-label="downloadLabel"
        :title="downloadLabel"
        @click="downloadVideo($event, video, index)"
      >
        <span aria-hidden="true"></span>
      </button>
      <video
        :src="video.src"
        controls
        playsinline
        preload="metadata"
        controlslist="nodownload"
      ></video>
      <a :href="video.src" target="_blank" rel="noopener noreferrer">{{ video.src }}</a>
    </figure>
  </div>
</template>

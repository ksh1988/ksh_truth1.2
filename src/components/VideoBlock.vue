<script setup>
/**
 * Displays video evidence attached to one content entity.
 * @param {object} props - Component props declared below.
 * @returns {void} Renders video cards for the current language.
 */
import { computed } from 'vue'
import { localizeValue } from '../utils/localization'

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
  if (typeof video === 'string') return { title: '', src: video }
  return {
    title: localizeValue(video?.title, props.lang),
    src: localizeValue(video?.src, props.lang) || video?.src || '',
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
</script>

<template>
  <div v-if="videos.length" class="video-grid" :class="{ compact }">
    <figure v-for="(video, index) in videos" :key="video.src + '-' + index" class="video-card">
      <figcaption>{{ videoTitle(video, index) }}</figcaption>
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

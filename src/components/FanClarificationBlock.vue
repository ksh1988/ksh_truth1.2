<script setup>
/**
 * Renders the nested fan clarification block inside one evidence card.
 * @param {object} props - Component props declared below.
 * @returns {void} Displays fan text, fan images, and fan source links for the active language.
 */
import { computed } from 'vue'
import { localizedHtml, localizeValue } from '../utils/localization'
import LinkBlock from './LinkBlock.vue'
import MediaBlock from './MediaBlock.vue'
import VideoBlock from './VideoBlock.vue'

const props = defineProps({
  emptyText: { type: String, required: true },
  fan: { type: Object, default: null },
  lang: { type: String, required: true },
})

const title = computed(() => localizeValue(props.fan?.title, props.lang))
const description = computed(() => localizeValue(props.fan?.description, props.lang))
const fanList = computed(() => (props.fan?.list || []).filter(hasFanItemContent))

/**
 * Checks whether one fan clarification node has visible user-provided content.
 * @param {object} item - Fan clarification root object or one child item.
 * @returns {boolean} True when localized text, media, links, or videos exist.
 */
function hasFanItemContent(item) {
  if (!item) return false
  const hasText = Boolean(localizeValue(item.description, props.lang))
  const images = item.imgs || {}
  const hasImages = Boolean((images[props.lang] || []).length || (images.shared || []).length)
  const hasLinks = Boolean((item.link || []).length)
  const videos = item.videos || []
  const localizedVideos = item.videos?.[props.lang] || []
  const sharedVideos = item.videos?.shared || []
  const hasVideos = Array.isArray(videos) ? videos.length > 0 : Boolean(localizedVideos.length || sharedVideos.length)
  return hasText || hasImages || hasLinks || hasVideos
}

/**
 * Checks whether the fan clarification block has user-provided content to show.
 * @returns {boolean} True when a top-level description or at least one list item exists.
 */
const hasVisibleFanContent = computed(() => Boolean(description.value) || fanList.value.length > 0)
</script>

<template>
  <section v-if="hasVisibleFanContent" class="fan-clarification">
    <h3>{{ title }}</h3>
    <div
      v-if="description"
      class="rich fan-clarification-text"
      v-html="localizedHtml(fan.description, lang)"
    ></div>
    <div v-if="fanList.length" class="fan-clarification-items">
      <article v-for="(fanItem, index) in fanList" :key="fanItem.id || index" class="fan-clarification-item">
        <div
          v-if="localizeValue(fanItem.description, lang)"
          class="rich fan-clarification-text"
          v-html="localizedHtml(fanItem.description, lang)"
        ></div>
        <MediaBlock :item="fanItem" :lang="lang" :empty-text="emptyText" />
        <VideoBlock :item="fanItem" :lang="lang" />
        <LinkBlock :links="fanItem.link" :lang="lang" />
      </article>
    </div>
  </section>
</template>

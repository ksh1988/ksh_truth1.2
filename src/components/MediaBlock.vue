<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  lang: { type: String, required: true },
  compact: Boolean,
  emptyText: { type: String, default: '' },
})

const failed = ref(new Set())
const images = computed(() => [
  ...(props.item.imgs?.[props.lang] || []),
  ...(props.item.imgs?.shared || []),
])

watch(() => props.lang, () => { failed.value = new Set() })
const markFailed = (src) => { failed.value = new Set([...failed.value, src]) }
</script>

<template>
  <div v-if="images.length" class="media-grid" :class="{ compact }">
    <a v-for="(src, index) in images" :key="`${src}-${index}`" :href="src" target="_blank" rel="noopener noreferrer" class="media-item">
      <img v-if="!failed.has(src)" :src="src" :alt="item.title || item.event || '资料图片'" loading="lazy" referrerpolicy="no-referrer" @error="markFailed(src)">
      <span v-else class="image-error">{{ emptyText }}<small>{{ src }}</small></span>
    </a>
  </div>
</template>

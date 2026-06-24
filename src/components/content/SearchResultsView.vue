<script setup>
import MediaBlock from '../MediaBlock.vue'

const props = defineProps({
  emptyText: { type: String, default: '' },
  lang: { type: String, required: true },
  query: { type: String, required: true },
  results: { type: Array, required: true },
})

defineEmits(['open-result'])

const cleanText = (value) => String(value || '')
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/==(.+?)==/g, '$1')
  .replace(/\*/g, '')

const highlightedParts = (value) => {
  const text = cleanText(value)
  const keyword = props.query.trim()
  if (!keyword) return [{ text, hit: false }]

  const source = text.toLowerCase()
  const needle = keyword.toLowerCase()
  const parts = []
  let cursor = 0
  let index = source.indexOf(needle)

  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), hit: false })
    parts.push({ text: text.slice(index, index + keyword.length), hit: true })
    cursor = index + keyword.length
    index = source.indexOf(needle, cursor)
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false })
  return parts.length ? parts : [{ text, hit: false }]
}
</script>

<template>
  <section class="search-results-page">
    <div class="search-results-heading">
      <span class="eyebrow">SEARCH</span>
      <h1>搜索结果</h1>
      <p>关键词：<strong>{{ query }}</strong></p>
      <p>共 {{ results.length }} 条</p>
    </div>

    <div v-if="results.length" class="search-result-list">
      <article
        v-for="result in results"
        :key="result.id"
        class="search-result-card"
        :data-search-result-key="result.id"
      >
        <button class="search-result-main" type="button" @click="$emit('open-result', result)">
          <span class="search-result-path">
            <template v-for="(part, index) in highlightedParts(result.path.join(' - '))" :key="`path-${index}`">
              <mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
            </template>
          </span>
          <strong>
            <template v-for="(part, index) in highlightedParts(result.title)" :key="`title-${index}`">
              <mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
            </template>
          </strong>
          <p v-if="result.snippet">
            <template v-for="(part, index) in highlightedParts(result.snippet)" :key="`snippet-${index}`">
              <mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template>
            </template>
          </p>
        </button>

        <MediaBlock
          v-if="result.mediaItem?.imgs"
          :item="result.mediaItem"
          :lang="lang"
          :empty-text="emptyText"
          compact
        />
      </article>
    </div>

    <div v-else class="search-result-empty">
      没有找到相关内容
    </div>
  </section>
</template>
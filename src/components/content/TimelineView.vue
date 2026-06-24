<script setup>
import { timelineFieldLabels, timelineText } from '../../config/uiText'
import { displayFieldsFor, formatDate, itemTitle, yearLabel } from '../../utils/contentHelpers'
import { localizeValue } from '../../utils/localization'
import { searchKeyFor } from '../../utils/searchKeys'
import LinkBlock from '../LinkBlock.vue'
import MediaBlock from '../MediaBlock.vue'

defineProps({
  emptyText: { type: String, required: true },
  entries: { type: Array, required: true },
  lang: { type: String, required: true },
  order: { type: String, required: true },
  selectedYear: { type: String, required: true },
  sourceLabel: { type: String, required: true },
  years: { type: Array, required: true },
})

defineEmits(['update:order', 'update:selectedYear'])

const fieldLabel = (key, lang) => localizeValue(timelineFieldLabels[key], lang) || key
</script>

<template>
  <div class="timeline">
    <div class="timeline-controls">
      <label class="year-filter">
        <span>{{ timelineText[lang].year }}</span>
        <select
          :value="selectedYear"
          :aria-label="timelineText[lang].year"
          @change="$emit('update:selectedYear', $event.target.value)"
        >
          <option value="all">{{ timelineText[lang].all }}</option>
          <option v-for="year in years" :key="year" :value="year">{{ yearLabel(year, lang) }}</option>
        </select>
      </label>

      <div class="order-control" role="group" :aria-label="timelineText[lang].order">
        <span>{{ timelineText[lang].order }}</span>
        <div class="order-buttons">
          <button :class="{ active: order === 'desc' }" @click="$emit('update:order', 'desc')">
            {{ timelineText[lang].desc }}
          </button>
          <button :class="{ active: order === 'asc' }" @click="$emit('update:order', 'asc')">
            {{ timelineText[lang].asc }}
          </button>
        </div>
      </div>
    </div>

    <article
      v-for="(item, index) in entries"
      :key="item.id || index"
      class="timeline-item"
      :data-search-key="searchKeyFor(item, index)"
    >
      <div class="timeline-rail">
        <span class="dot"></span>
        <span class="line"></span>
      </div>
      <div class="timeline-card">
        <time>{{ formatDate(item.time) }}</time>
        <h2>{{ itemTitle(item, lang) }}</h2>
        <div v-if="displayFieldsFor(item).length" class="case-meta">
          <div v-for="([key, value]) in displayFieldsFor(item)" :key="key">
            <span>{{ fieldLabel(key, lang) }}</span>
            <strong>{{ localizeValue(value, lang) }}</strong>
          </div>
        </div>
        <MediaBlock :item="item" :lang="lang" :empty-text="emptyText" />
        <LinkBlock :links="item.link" :label="sourceLabel" />
      </div>
    </article>
  </div>
</template>
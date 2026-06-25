<script setup>
import { computed, ref } from 'vue'
import { timelineFieldLabels, timelineText } from '../../config/uiText'
import { displayFieldsFor, formatDate, itemTitle, yearLabel } from '../../utils/contentHelpers'
import { localizeValue } from '../../utils/localization'
import { searchKeyFor } from '../../utils/searchKeys'
import LinkBlock from '../LinkBlock.vue'
import MediaBlock from '../MediaBlock.vue'

const props = defineProps({
  emptyText: { type: String, required: true },
  entries: { type: Array, required: true },
  lang: { type: String, required: true },
  order: { type: String, required: true },
  selectedYear: { type: String, required: true },
  showYearFilter: { type: Boolean, default: true },
  sourceLabel: { type: String, required: true },
  years: { type: Array, required: true },
})

const emit = defineEmits(['update:order', 'update:selectedYear'])

const yearMenuOpen = ref(false)

const fieldLabel = (key, lang) => localizeValue(timelineFieldLabels[key], lang) || key

const selectedYearLabel = computed(() => {
  if (props.selectedYear === 'all') return timelineText[props.lang].all
  return yearLabel(props.selectedYear, props.lang)
})

const selectYear = (year) => {
  emit('update:selectedYear', year)
  yearMenuOpen.value = false
}
</script>

<template>
  <div class="timeline">
    <div class="timeline-controls">
      <div v-if="showYearFilter" class="year-filter">
        <div class="year-dropdown" :class="{ open: yearMenuOpen }">
          <button
            class="year-trigger"
            type="button"
            :aria-label="timelineText[lang].year"
            :aria-expanded="yearMenuOpen"
            @click="yearMenuOpen = !yearMenuOpen"
          >
            <span>{{ selectedYearLabel }}</span>
            <b aria-hidden="true"></b>
          </button>
          <div v-if="yearMenuOpen" class="year-menu">
            <button
              type="button"
              :class="{ active: selectedYear === 'all' }"
              @click="selectYear('all')"
            >
              {{ timelineText[lang].all }}
            </button>
            <button
              v-for="year in years"
              :key="year"
              type="button"
              :class="{ active: selectedYear === year }"
              @click="selectYear(year)"
            >
              {{ yearLabel(year, lang) }}
            </button>
          </div>
        </div>
      </div>

      <div class="order-control" role="group" :aria-label="timelineText[lang].order">
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
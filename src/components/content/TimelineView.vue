<script setup>
/**
 * Vue component that renders a focused part of the site UI.
 * @param {object} props - Component props declared below when this is a Vue component.
 * @returns {void} Renders UI or exports module helpers.
 */
import { computed, ref } from 'vue'
import { timelineText } from '../../config/uiText'
import { formatDate, itemTitle, yearLabel } from '../../utils/contentHelpers'
import { localizeValue } from '../../utils/localization'
import { searchKeyFor } from '../../utils/searchKeys'
import LinkBlock from '../LinkBlock.vue'
import MediaBlock from '../MediaBlock.vue'
import VideoBlock from '../VideoBlock.vue'

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


/**
 * Returns the localized subtitle for one timeline entry.
 * @param {object} item - Timeline entry object from site_data.json.
 * @param {string} lang - Current language code.
 * @returns {string} Localized details or description text used as the subtitle.
 */
const subtitleText = (item, lang) => localizeValue(item.details || item.description, lang)

/**
 * Returns the visible label for the current year filter.
 * @param {*} computed(() - Input value used by selectedYearLabel.
 * @returns {*} The computed result or the documented side effect.
 */
const selectedYearLabel = computed(() => {
  if (props.selectedYear === 'all') return timelineText[props.lang].all
  return yearLabel(props.selectedYear, props.lang)
})

/**
 * Selects a year filter and closes the year menu.
 * @param {*} year - Input value used by selectYear.
 * @returns {*} The computed result or the documented side effect.
 */
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
        <p v-if="subtitleText(item, lang)" class="timeline-subtitle">{{ subtitleText(item, lang) }}</p>
        <MediaBlock :item="item" :lang="lang" :empty-text="emptyText" />
        <VideoBlock :item="item" :lang="lang" />
        <LinkBlock :links="item.link" :label="sourceLabel" :lang="lang" />
      </div>
    </article>
  </div>
</template>
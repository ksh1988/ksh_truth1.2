<script setup>
/**
 * Vue component that renders a focused part of the site UI.
 * @param {object} props - Component props declared below when this is a Vue component.
 * @returns {void} Renders UI or exports module helpers.
 */
import { entriesFor, itemDescription, itemTitle } from '../../utils/contentHelpers'
import { localizedHtml, localizeValue } from '../../utils/localization'
import { searchKeyFor } from '../../utils/searchKeys'
import LinkBlock from '../LinkBlock.vue'
import FanClarificationBlock from '../FanClarificationBlock.vue'
import MediaBlock from '../MediaBlock.vue'
import VideoBlock from '../VideoBlock.vue'

defineProps({
  content: { type: Object, required: true },
  emptyText: { type: String, required: true },
  lang: { type: String, required: true },
  sourceLabel: { type: String, required: true },
})

defineEmits(['navigate-internal'])
</script>

<template>
  <div class="card-list">
    <article
      v-for="(item, index) in entriesFor(content, lang)"
      :key="item.id || index"
      class="evidence-card"
      :data-search-key="searchKeyFor(item, index)"
    >
      <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>
      <div class="card-body">
        <h2>
          <button
            v-if="item.internal_link"
            class="internal-card-link"
            @click="$emit('navigate-internal', item.internal_link)"
          >
            <span>{{ itemTitle(item, lang) }}</span>
            <b aria-hidden="true">&rarr;</b>
          </button>
          <template v-else>{{ itemTitle(item, lang) }}</template>
        </h2>

        <div
          v-if="itemDescription(item, lang)"
          class="rich"
          v-html="localizedHtml(item.description, lang)"
        ></div>

        <div v-if="Object.keys(item.extras || {}).length" class="facts extra-facts">
          <div v-for="([key, value]) in Object.entries(item.extras)" :key="key">
            <span>{{ key }}</span>
            <strong>{{ localizeValue(value, lang) }}</strong>
          </div>
        </div>

        <MediaBlock :item="item" :lang="lang" :empty-text="emptyText" />
        <LinkBlock :links="item.link" :label="sourceLabel" :lang="lang" />
        <FanClarificationBlock :fan="item.fan_clarification" :lang="lang" :empty-text="emptyText" />
        <VideoBlock :item="item" :lang="lang" />
      </div>
    </article>
  </div>
</template>
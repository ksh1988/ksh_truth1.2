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
import MediaBlock from '../MediaBlock.vue'
import VideoBlock from '../VideoBlock.vue'

defineProps({
  content: { type: Object, required: true },
  detailsLabel: { type: String, required: true },
  emptyText: { type: String, required: true },
  lang: { type: String, required: true },
  sourceLabel: { type: String, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>{{ title }}</th>
          <th>{{ detailsLabel }}</th>
          <th>{{ sourceLabel }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in entriesFor(content, lang)"
          :key="item.id || index"
          :data-search-key="searchKeyFor(item, index)"
        >
          <td>{{ String(index + 1).padStart(2, '0') }}</td>
          <td>
            <strong>{{ itemTitle(item, lang) }}</strong>
            <div
              v-if="itemDescription(item, lang)"
              class="rich"
              v-html="localizedHtml(item.description, lang)"
            ></div>
          </td>
          <td>
            <dl>
              <template v-for="([key, value]) in Object.entries(item.extras || {})" :key="key">
                <dt>{{ key }}</dt>
                <dd>{{ localizeValue(value, lang) }}</dd>
              </template>
            </dl>
          </td>
          <td>
            <MediaBlock :item="item" :lang="lang" compact :empty-text="emptyText" />
            <VideoBlock :item="item" :lang="lang" compact />
            <LinkBlock :links="item.link" :label="sourceLabel" :lang="lang" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
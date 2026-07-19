<script setup>
/**
 * Renders matrix-style evidence tables with optional source links and table-image downloads.
 * @param {object} props - Component props declared below.
 * @returns {void} Renders localized matrix sections for one content entity.
 */
import { computed } from 'vue'
import { visibleRowsFor } from '../utils/contentHelpers'
import { downloadMedia, mediaFileName } from '../utils/mediaDownload'
import { resolveMediaSrc } from '../utils/mediaSource'
import { searchKeyForMatrixRow } from '../utils/searchKeys'
import LinkBlock from './LinkBlock.vue'

const emit = defineEmits(['navigate-internal'])

const props = defineProps({
  content: { type: Object, required: true },
  lang: { type: String, required: true },
  sourceLabel: { type: String, default: '' },
})

/**
 * Returns the current-language value for a localized field.
 * @param {*} value - Input value used by localize.
 * @returns {*} The computed result or the documented side effect.
 */
const localize = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[props.lang] ?? value.en ?? value.zh ?? ''
  }
  return value ?? ''
}

/**
 * Normalizes matrix cell content into renderable text segments.
 * @param {*} value - Input value used by segments.
 * @returns {*} The computed result or the documented side effect.
 */
const segments = (value) => {
  const localized = localize(value)
  return Array.isArray(localized) ? localized : [{ text: localized }]
}

/**
 * Builds CSS class flags for one matrix text segment.
 * @param {*} segment - Input value used by segmentClass.
 * @returns {*} The computed result or the documented side effect.
 */
const segmentClass = (segment) => ({
  'segment-red': segment.color === 'red',
  'segment-blue': segment.color === 'blue',
  'segment-bold': segment.bold,
  'segment-italic': segment.italic,
  'segment-underline': segment.underline,
  'segment-circle': segment.circle,
  'segment-block': segment.block,
})

const matrixDownloadLabel = computed(() => ({ zh: '下载表格图片', ko: '표 이미지 다운로드', en: 'Download table image' })[props.lang] || 'Download table image')
const matrixDownloadSrc = computed(() => resolveMediaSrc(localize(props.content.matrix_download_imgs)))

/**
 * Downloads the localized matrix image configured for the current content.
 * @returns {Promise<void>} Resolves after the browser download or share action is triggered.
 */
const downloadMatrixImage = async () => {
  const src = matrixDownloadSrc.value
  if (!src) return

  await downloadMedia({
    src,
    filename: mediaFileName({ item: props.content, lang: props.lang, src, index: 0 }),
  })
}

/**
 * Emits an internal navigation event from a linked matrix text segment.
 * @param {object} target - Internal navigation ids configured on a segment.
 * @returns {void} Delegates navigation to the parent controller.
 */
const openSegmentLink = (target) => {
  if (target) emit('navigate-internal', target)
}

/**
 * Checks whether two internal navigation targets point to the same destination.
 * @param {object | undefined} first - First internal navigation target.
 * @param {object | undefined} second - Second internal navigation target.
 * @returns {boolean} True when both targets describe the same internal page position.
 */
const sameInternalLink = (first, second) => {
  if (!first || !second) return false
  return first.tab_id === second.tab_id
    && first.sub_tab_id === second.sub_tab_id
    && first.entry_id === second.entry_id
}

/**
 * Shows the arrow only on the last item in a consecutive run of identical matrix links.
 * @param {Array<object>} segmentList - Renderable matrix text segments for one table cell.
 * @param {number} segmentIndex - Current segment index.
 * @returns {boolean} True when this segment should display the jump arrow.
 */
const shouldShowLinkArrow = (segmentList, segmentIndex) => {
  const current = segmentList[segmentIndex]
  const next = segmentList[segmentIndex + 1]
  return Boolean(current?.internal_link) && !sameInternalLink(current.internal_link, next?.internal_link)
}
</script>

<template>
  <div class="matrix-sections" :class="`matrix-${content.id}`" :data-search-key="content.id">
    <div v-if="matrixDownloadSrc" class="matrix-toolbar">
      <button
        class="matrix-download-button"
        type="button"
        :aria-label="matrixDownloadLabel"
        :title="matrixDownloadLabel"
        @click="downloadMatrixImage"
      >
        <span class="matrix-download-icon" aria-hidden="true"></span>
        <span>{{ matrixDownloadLabel }}</span>
      </button>
    </div>
    <div class="matrix-scroll matrix-all-scroll" tabindex="0">
      <div class="matrix-canvas">
        <p v-if="content.matrix_intro" class="matrix-statement">{{ localize(content.matrix_intro) }}</p>
        <section
          v-for="section in content.matrix_sections"
          :key="section.id"
          class="matrix-section"
          :class="[`tone-${section.tone || 'cream'}`, `section-${section.id}`]"
        >
          <table class="evidence-matrix">
            <thead>
              <tr>
                <th v-for="column in section.columns" :key="column.key" :class="`col-${column.key}`">
                  <button
                    v-if="column.internal_link"
                    type="button"
                    class="matrix-column-link"
                    @click="openSegmentLink(column.internal_link)"
                  >
                    <span class="matrix-link-text">{{ localize(column.label) }}</span><span class="matrix-link-arrow" aria-hidden="true">&rarr;</span>
                  </button>
                  <template v-else>{{ localize(column.label) }}</template>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in visibleRowsFor(section, lang)"
                :key="row.id || rowIndex"
                :data-search-key="searchKeyForMatrixRow(content.id, section.id, row, rowIndex)"
              >
                <template v-for="column in section.columns" :key="column.key">
                  <td v-if="!row.skip_cells?.includes(column.key)" :rowspan="row.rowspans?.[column.key] || 1" :class="`col-${column.key}`">
                    <template v-for="(segment, segmentIndex) in segments(row[column.key])" :key="segmentIndex">
                      <button
                        v-if="segment.internal_link"
                        type="button"
                        class="matrix-segment-link"
                        :class="segmentClass(segment)"
                        @click="openSegmentLink(segment.internal_link)"
                      >
                        <span class="matrix-link-text">{{ segment.text }}</span><span v-if="segment.circleAfter" class="segment-circle segment-circle-inline">{{ segment.circleAfter }}</span><span v-if="shouldShowLinkArrow(segments(row[column.key]), segmentIndex)" class="matrix-link-arrow" aria-hidden="true">&rarr;</span>
                      </button>
                      <span v-else :class="segmentClass(segment)">{{ segment.text }}<span v-if="segment.circleAfter" class="segment-circle segment-circle-inline">{{ segment.circleAfter }}</span></span>
                    </template>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </section>
        <p v-if="content.matrix_conclusion" class="matrix-conclusion">{{ localize(content.matrix_conclusion) }}</p>
      </div>
    </div>
    <div v-if="content.link?.length" class="matrix-source-links">
      <LinkBlock :links="content.link" :label="sourceLabel" :lang="lang" @navigate-internal="emit('navigate-internal', $event)" />
    </div>
  </div>
</template>
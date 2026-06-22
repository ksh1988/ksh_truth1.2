<script setup>
const props = defineProps({
  content: { type: Object, required: true },
  lang: { type: String, required: true },
})

const localize = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[props.lang] ?? value.en ?? value.zh ?? ''
  }
  return value ?? ''
}

const segments = (value) => {
  const localized = localize(value)
  return Array.isArray(localized) ? localized : [{ text: localized }]
}

const segmentClass = (segment) => ({
  'segment-red': segment.color === 'red',
  'segment-bold': segment.bold,
  'segment-italic': segment.italic,
  'segment-block': segment.block,
})
</script>

<template>
  <div class="matrix-sections" :class="`matrix-${content.id}`">
    <div class="matrix-scroll matrix-all-scroll" tabindex="0">
      <div class="matrix-canvas">
        <p v-if="content.matrix_intro" class="matrix-statement">{{ localize(content.matrix_intro) }}</p>
        <section v-for="section in content.matrix_sections" :key="section.id" class="matrix-section" :class="[`tone-${section.tone || 'cream'}`, `section-${section.id}`]">
          <table class="evidence-matrix">
            <thead>
              <tr>
                <th v-for="column in section.columns" :key="column.key" :class="`col-${column.key}`">{{ localize(column.label) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in section.rows" :key="row.id || rowIndex">
                <template v-for="column in section.columns" :key="column.key">
                  <td v-if="!row.skip_cells?.includes(column.key)" :rowspan="row.rowspans?.[column.key] || 1" :class="`col-${column.key}`">
                    <template v-for="(segment, segmentIndex) in segments(row[column.key])" :key="segmentIndex">
                      <span :class="segmentClass(segment)">{{ segment.text }}</span>
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
  </div>
</template>

<script setup>
defineProps({
  activeTab: { type: Object, required: true },
  localize: { type: Function, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <div class="page-heading">
    <span
      v-if="activeTab.layout === 'two-level' && title !== localize(activeTab.label)"
      class="eyebrow"
    >
      {{ localize(activeTab.label) }}
    </span>
    <h1>{{ title }}</h1>
    <div class="heading-line"></div>
  </div>
</template>

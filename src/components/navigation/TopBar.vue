<script setup>
import { languageNames } from '../../config/uiText'

defineProps({
  activeTab: { type: Object, required: true },
  collapsed: Boolean,
  lang: { type: String, required: true },
  localize: { type: Function, required: true },
  siteData: { type: Object, required: true },
  title: { type: String, required: true },
  ui: { type: Object, required: true },
})

defineEmits(['open-menu', 'update:lang'])
</script>

<template>
  <header class="topbar">
    <button
      class="mobile-menu"
      :aria-label="ui[lang].openMenu"
      @click="$emit('open-menu')"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="breadcrumb">
      <span>{{ localize(activeTab.label) }}</span>
      <b>/</b>
      <strong>{{ title }}</strong>
    </div>

    <div class="languages" aria-label="Language selector">
      <button
        v-for="code in siteData.meta.languages"
        :key="code"
        :class="{ active: lang === code }"
        @click="$emit('update:lang', code)"
      >
        {{ languageNames[code] }}
      </button>
    </div>
  </header>
</template>

<script setup>
/**
 * Module documentation.
 * @param {...*} args - Inputs are declared by the following code.
 * @returns {*} The computed result or side effect.
 */
import { isVisibleContent } from '../../utils/contentHelpers'

defineProps({
  localize: { type: Function, required: true },
  siteData: { type: Object, required: true },
})

defineEmits(['select-category', 'select-direct-sub-tab', 'select-sub-tab', 'select-tab'])
</script>

<template>
  <section class="nav-tree-panel" aria-label="Tab structure">
    <ol class="nav-tree-root">
      <li v-for="(tab, tabIndex) in siteData.tabs.filter(isVisibleContent)" :key="tab.id" class="nav-tree-node tree-tab">
        <button class="nav-tree-link tree-tab-link" @click="$emit('select-tab', tab)">
          <span class="tree-code">{{ String(tabIndex + 1).padStart(2, '0') }}</span>
          <span>{{ localize(tab.label) }}</span>
        </button>

        <ol v-if="tab.sub_tabs?.length || tab.categories?.length" class="nav-tree-children">
          <li v-for="category in (tab.categories || []).filter(isVisibleContent)" :key="category.id" class="nav-tree-node tree-category">
            <button
              v-if="!category.sub_tabs?.length"
              class="nav-tree-link"
              type="button"
              @click="$emit('select-category', tab, category)"
            >
              <span class="tree-level-star" aria-hidden="true">★</span>
              <span>{{ localize(category.label) }}</span>
            </button>
            <div v-else class="nav-tree-label">
              <span class="tree-level-star" aria-hidden="true">★</span>
              <span>{{ localize(category.label) }}</span>
            </div>

            <ol v-if="category.sub_tabs?.length" class="nav-tree-children tree-subtab-list">
              <li v-for="sub in (category.sub_tabs || []).filter(isVisibleContent)" :key="sub.id" class="nav-tree-node tree-subtab">
                <button class="nav-tree-link" @click="$emit('select-sub-tab', tab, category, sub)">
                  <span class="tree-dot"></span>
                  <span>{{ localize(sub.label) }}</span>
                </button>
              </li>
            </ol>
          </li>

          <li v-for="sub in (tab.sub_tabs || []).filter(isVisibleContent)" :key="sub.id" class="nav-tree-node tree-subtab direct-tree-subtab">
            <button class="nav-tree-link" @click="$emit('select-direct-sub-tab', tab, sub)">
              <span class="tree-level-star" aria-hidden="true">★</span>
              <span>{{ localize(sub.label) }}</span>
            </button>
          </li>
        </ol>
      </li>
    </ol>
  </section>
</template>

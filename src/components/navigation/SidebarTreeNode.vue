<script setup>
/**
 * Documents the props helper.
 * @param {*} defineProps({
  activeNodeId: { type: String - Input value used by props.
 * @param {*} default: '' } - Input value used by props.
 * @param {*} activePathIds: { type: Array - Input value used by props.
 * @param {*} default: () - Input value used by props.
 * @returns {*} The computed result or the documented side effect.
 */
import { computed } from 'vue'

const props = defineProps({
  activeNodeId: { type: String, default: '' },
  activePathIds: { type: Array, default: () => [] },
  expandedIds: { type: Object, required: true },
  localize: { type: Function, required: true },
  node: { type: Object, required: true },
})

const emit = defineEmits(['select-node', 'toggle-expanded'])

const hasChildren = computed(() => Boolean(props.node.children?.length))
const expanded = computed(() => props.expandedIds.has(props.node.id))
const inActivePath = computed(() => props.activePathIds.includes(props.node.id))
const active = computed(() => props.activeNodeId === props.node.id || (props.node.kind === 'tab' && inActivePath.value))

/**
 * Builds the CSS classes for a recursive sidebar node button.
 * @param {*} computed(() - Input value used by buttonClass.
 * @returns {*} The computed result or the documented side effect.
 */
const buttonClass = computed(() => {
  if (props.node.kind === 'tab') return ['nav-item', 'top', { active: active.value }]
  if (hasChildren.value) return ['category', { active: inActivePath.value }]
  return ['sub-item', { active: active.value }]
})

/**
 * Handles branch expansion or leaf selection for one sidebar node.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
const handleClick = () => {
  if (hasChildren.value) {
    emit('toggle-expanded', props.node.id)
    return
  }
  emit('select-node', props.node)
}
</script>

<template>
  <div class="sidebar-tree-node" :class="'tree-level-' + node.level">
    <button :class="buttonClass" type="button" @click="handleClick">
      <span v-if="node.kind === 'tab'" class="nav-index">{{ node.index }}</span>
      <span v-if="node.level === 1" class="nav-level-star" aria-hidden="true">★</span>
      <span class="nav-text">{{ localize(node.label) }}</span>
      <span v-if="hasChildren" class="chevron">{{ expanded ? '-' : '+' }}</span>
    </button>

    <div v-if="hasChildren && expanded" class="subnav">
      <SidebarTreeNode
        v-for="child in node.children"
        :key="child.id"
        :active-node-id="activeNodeId"
        :active-path-ids="activePathIds"
        :expanded-ids="expandedIds"
        :localize="localize"
        :node="child"
        @select-node="$emit('select-node', $event)"
        @toggle-expanded="$emit('toggle-expanded', $event)"
      />
    </div>
  </div>
</template>

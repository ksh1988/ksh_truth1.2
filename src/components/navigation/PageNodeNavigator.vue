<script setup>
/**
 * Vue component that renders a focused part of the site UI.
 * @param {object} props - Component props declared below when this is a Vue component.
 * @returns {void} Renders UI or exports module helpers.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nodesForContent } from '../../utils/pageNodes'
import { cssEscape } from '../../utils/searchKeys'
import { scrollToCenterStable } from '../../utils/domPosition'

const props = defineProps({
  content: { type: Object, required: true },
  lang: { type: String, required: true },
  timelineEntries: { type: Array, default: () => [] },
})

const activeKey = ref('')
const mobileActive = ref(false)
const expanded = ref(false)
const navigatorRef = ref(null)
let observer

const nodes = computed(() => nodesForContent({
  content: props.content,
  lang: props.lang,
  timelineEntries: props.timelineEntries,
}))

/**
 * Stops the active IntersectionObserver.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
const disconnectObserver = () => {
  observer?.disconnect()
  observer = null
}

/**
 * Finds a content node by search key.
 * @param {*} key - Input value used by targetFor.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
const targetFor = (key) => document.querySelector('[data-search-key="' + cssEscape(key) + '"]')

/**
 * Observes content nodes and updates the active right-side node.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {Promise<*>} The computed result or the documented side effect.
 */
const observeNodes = async () => {
  disconnectObserver()
  await nextTick()

  if (!nodes.value.length || !('IntersectionObserver' in window)) {
    activeKey.value = nodes.value[0]?.key || ''
    return
  }

  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    const key = visible?.target?.dataset?.searchKey
    if (key) activeKey.value = key
  }, { rootMargin: '-20% 0px -62% 0px', threshold: [0.12, 0.35, 0.6] })

  nodes.value.forEach((node) => {
    const target = targetFor(node.key)
    if (target) observer.observe(target)
  })

  activeKey.value = nodes.value[0]?.key || ''
}

/**
 * Checks whether the current viewport is in the mobile breakpoint.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
const isMobileViewport = () => window.matchMedia('(max-width: 820px)').matches

/**
 * Dims the mobile page-node navigator when tapping outside while keeping it expanded.
 * @param {PointerEvent} event - Global pointer event used to detect outside taps.
 * @returns {void} Only lowers opacity state; closing still requires the toggle button.
 */
const dimMobileNavigatorOnOutsideClick = (event) => {
  if (!isMobileViewport()) return
  if (navigatorRef.value?.contains(event.target)) return
  mobileActive.value = false
}

/**
 * Toggles the page-node navigator open or closed.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
const toggleNavigator = () => {
  expanded.value = !expanded.value
  mobileActive.value = expanded.value
}

/**
 * Scrolls to the content entity represented by a page-node button.
 * @param {*} node - Input value used by scrollToNode.
 * @returns {*} The computed result or the documented side effect.
 */
const scrollToNode = (node) => {
  mobileActive.value = true
  activeKey.value = node.key
  scrollToCenterStable(targetFor(node.key))
}

watch(
  () => [props.content?.id, props.lang, nodes.value.map((node) => node.key).join('|')],
  () => {
    mobileActive.value = false
    expanded.value = false
    observeNodes()
  },
  { immediate: true },
)

onMounted(() => {
  document.addEventListener('pointerdown', dimMobileNavigatorOnOutsideClick, true)
})

onBeforeUnmount(() => {
  disconnectObserver()
  document.removeEventListener('pointerdown', dimMobileNavigatorOnOutsideClick, true)
})
</script>

<template>
  <aside
    v-if="nodes.length > 1"
    ref="navigatorRef"
    class="page-node-nav"
    :class="{ active: mobileActive, expanded }"
    aria-label="Page node navigation"
    @pointerdown="mobileActive = true"
  >
    <button
      class="page-node-toggle"
      type="button"
      :aria-expanded="expanded"
      aria-label="Toggle page node navigation"
      @click="toggleNavigator"
    >
      <span aria-hidden="true"></span>
    </button>

    <div class="page-node-list">
      <button
        v-for="(node, index) in nodes"
        :key="node.key"
        class="page-node"
        :class="{ active: activeKey === node.key }"
        type="button"
        :aria-label="node.label"
        :title="node.label"
        @click="scrollToNode(node)"
      >
        <span>{{ index + 1 }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nodesForContent } from '../../utils/pageNodes'
import { cssEscape } from '../../utils/searchKeys'

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

const disconnectObserver = () => {
  observer?.disconnect()
  observer = null
}

const targetFor = (key) => document.querySelector('[data-search-key="' + cssEscape(key) + '"]')

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

const isMobileViewport = () => window.matchMedia('(max-width: 820px)').matches

const closeMobileNavigatorOnOutsideClick = (event) => {
  if (!isMobileViewport()) return
  if (navigatorRef.value?.contains(event.target)) return
  mobileActive.value = false
  expanded.value = false
}

const toggleNavigator = () => {
  expanded.value = !expanded.value
  mobileActive.value = expanded.value
}

const scrollToNode = (node) => {
  mobileActive.value = true
  activeKey.value = node.key
  targetFor(node.key)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
  document.addEventListener('pointerdown', closeMobileNavigatorOnOutsideClick, true)
})

onBeforeUnmount(() => {
  disconnectObserver()
  document.removeEventListener('pointerdown', closeMobileNavigatorOnOutsideClick, true)
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

<script setup>
/**
 * Module documentation.
 * @param {...*} args - Inputs are declared by the following code.
 * @returns {*} The computed result or side effect.
 */
const props = defineProps({
  activeTab: { type: Object, required: true },
  localize: { type: Function, required: true },
  title: { type: String, required: true },
  intro: { type: [Object, String], default: '' },
  introLinks: { type: Array, default: () => [] },
})

const emit = defineEmits(['navigate-internal'])

// Resolves the current page intro so the heading line can hide only when intro text exists.
const headingIntro = () => props.localize(props.intro)

/**
 * Finds a configured intro link by its placeholder key.
 * @param {string} key - Placeholder key found inside the intro text.
 * @returns {object|undefined} Matching intro link configuration.
 */
const introLinkFor = (key) => props.introLinks.find((link) => link.key === key)

/**
 * Splits intro text into plain text and clickable internal-link segments.
 * @returns {Array<object>} Ordered text/link segments for rendering the intro paragraph.
 */
const introSegments = () => {
  const text = headingIntro()
  if (!text) return []

  const segments = []
  const pattern = /\[\[([^\]]+)\]\]/g
  let lastIndex = 0
  let match = pattern.exec(text)

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }

    const link = introLinkFor(match[1])
    if (link) {
      segments.push({ type: 'link', label: props.localize(link.label), target: link.internal_link })
    } else {
      segments.push({ type: 'text', text: match[0] })
    }

    lastIndex = pattern.lastIndex
    match = pattern.exec(text)
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return segments
}

/**
 * Emits a site-internal navigation target from an intro link.
 * @param {object} target - Internal navigation target from site_data.json.
 * @returns {void} Delegates navigation to the app controller.
 */
const openIntroLink = (target) => {
  if (target) emit('navigate-internal', target)
}
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
    <p v-if="headingIntro()" class="page-intro">
      <template v-for="(segment, index) in introSegments()" :key="index">
        <button
          v-if="segment.type === 'link'"
          type="button"
          class="intro-internal-link"
          @click="openIntroLink(segment.target)"
        >
          {{ segment.label }}
        </button>
        <template v-else>{{ segment.text }}</template>
      </template>
    </p>
    <div v-if="!headingIntro()" class="heading-line"></div>
  </div>
</template>

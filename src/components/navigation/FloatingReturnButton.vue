<script setup>
/**
 * Module documentation.
 * @param {...*} args - Inputs are declared by the following code.
 * @returns {*} The computed result or side effect.
 */
defineProps({
  label: { type: String, required: true },
})

defineEmits(['return'])
</script>

<template>
  <button class="return-floating" type="button" @click="$emit('return')">
    {{ label }}
  </button>
</template>

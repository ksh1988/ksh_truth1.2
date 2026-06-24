<script setup>
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

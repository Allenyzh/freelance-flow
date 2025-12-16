<script setup lang="ts">
// NElement removed
defineProps<{
  fill?: boolean  // When true, content fills available space with flexbox
}>()
</script>

<template>
  <div class="h-full p-6 bg-background border border-border rounded-xl box-border"
    :class="{ 'flex flex-col overflow-hidden': fill }">
    <slot></slot>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>

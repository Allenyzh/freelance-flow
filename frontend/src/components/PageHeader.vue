<script setup lang="ts">
defineProps<{
    title: string
    subtitle?: string
}>()
</script>

<template>
    <div class="shrink-0 mb-6 flex justify-between items-start">
        <div class="flex-1 min-w-0">
            <h1 class="font-display text-2xl font-bold m-0 text-foreground tracking-tight leading-tight">{{ title }}
            </h1>
            <p v-if="subtitle" class="mt-2 text-muted-foreground text-base">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.extra" class="shrink-0 ml-6">
            <slot name="extra"></slot>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>

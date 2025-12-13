<script setup lang="ts">
import { NElement } from 'naive-ui'

defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <n-element tag="div" class="page-container">
    <!-- 1. Page Header (Fixed within the view) -->
    <div class="page-header">
      <div v-if="$slots.header">
        <slot name="header"></slot>
      </div>
      <template v-else>
        <div class="header-main">
          <h1 v-if="title" class="title">{{ title }}</h1>
          <div v-if="$slots.extra" class="extra">
            <slot name="extra"></slot>
          </div>
        </div>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        <div v-if="$slots.headerContent" class="header-content">
          <slot name="headerContent"></slot>
        </div>
      </template>
    </div>

    <!-- 2. Page Content (Scrollable) -->
    <div class="page-content-wrapper">
      <div class="page-content">
        <slot></slot>
      </div>
    </div>

    <!-- 3. Page Footer (Optional, fixed at bottom of view) -->
    <div v-if="$slots.footer" class="page-footer">
      <slot name="footer"></slot>
    </div>
  </n-element>
</template>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Use theme vars for background if needed, but usually transparent on Body */
}

/* Header */
.page-header {
  flex-shrink: 0;
  padding-bottom: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-family: 'Varela Round', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--n-text-color);
  line-height: 1.2;
}

.subtitle {
  margin: 8px 0 0;
  color: var(--n-text-color-3);
  font-size: 1rem;
}

.header-content {
  margin-top: 16px;
}

/* Content */
.page-content-wrapper {
  flex: 1;
  min-height: 0;
  /* Critical for flex scrolling */
  position: relative;
  overflow: auto;
}

.page-content {
  padding: 0 4px 24px 0;
}

/* Footer */
.page-footer {
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color);
}
</style>

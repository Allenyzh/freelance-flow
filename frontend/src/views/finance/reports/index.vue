<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NCard } from 'naive-ui'

const { t } = useI18n()
</script>

<template>
  <div class="reports-page">
    <NCard :bordered="true">
      <h1>{{ t('finance.reports.title') }}</h1>
      <p>Coming soon...</p>
    </NCard>
  </div>
</template>

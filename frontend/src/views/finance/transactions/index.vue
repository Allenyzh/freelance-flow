<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NCard } from 'naive-ui'

const { t } = useI18n()
</script>

<template>
  <div class="transactions-page">
    <NCard :bordered="true">
      <h1>{{ t('finance.transactions.title') }}</h1>
      <p>Coming soon...</p>
    </NCard>
  </div>
</template>

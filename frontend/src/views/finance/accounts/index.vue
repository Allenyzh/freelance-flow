<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard,
  NDataTable,
  NButton,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { api } from '@/api'
import type { FinanceAccount } from '@/types/finance'

const { t } = useI18n()
const message = useMessage()

const loading = ref(false)
const accounts = ref<FinanceAccount[]>([])

const columns: DataTableColumns<FinanceAccount> = [
  {
    title: t('finance.accounts.table.name'),
    key: 'name',
  },
  {
    title: t('finance.accounts.table.type'),
    key: 'type',
    width: 120,
    render: (row) => {
      const typeMap: Record<string, { label: string; type: string }> = {
        checking: { label: t('finance.accounts.types.checking'), type: 'info' },
        savings: { label: t('finance.accounts.types.savings'), type: 'success' },
        credit: { label: t('finance.accounts.types.credit'), type: 'warning' },
        investment: { label: t('finance.accounts.types.investment'), type: 'default' },
      }
      const config = typeMap[row.type] || { label: row.type, type: 'default' }
      return h(
        NTag,
        { type: config.type, size: 'small', bordered: false, round: true },
        { default: () => config.label }
      )
    },
  },
  {
    title: t('finance.accounts.table.currency'),
    key: 'currency',
    width: 100,
  },
  {
    title: t('finance.accounts.table.balance'),
    key: 'balance',
    width: 150,
    align: 'right',
    render: (row) => {
      return `$${row.balance.toFixed(2)}`
    },
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 150,
    render: () => {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', type: 'primary', ghost: true },
              { default: () => t('common.edit') }
            ),
            h(
              NButton,
              { size: 'small', type: 'error', ghost: true },
              { default: () => t('common.delete') }
            ),
          ],
        }
      )
    },
  },
]

async function loadAccounts() {
  loading.value = true
  try {
    accounts.value = await api.finance.accounts.list()
  } catch (e) {
    message.error(t('finance.accounts.errors.loadFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAccounts()
})
</script>

<template>
  <div class="accounts-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('finance.accounts.title') }}</h1>
      <NButton type="primary">
        <template #icon>
          <PlusOutlined />
        </template>
        {{ t('finance.accounts.addAccount') }}
      </NButton>
    </div>

    <NCard :bordered="true">
      <NDataTable
        :columns="columns"
        :data="accounts"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
      />
    </NCard>
  </div>
</template>

<style scoped>
.accounts-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--n-text-color);
}
</style>

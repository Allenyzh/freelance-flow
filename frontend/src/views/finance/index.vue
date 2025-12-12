<script setup lang="ts">
import { onMounted, ref, h } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard,
  NGrid,
  NGridItem,
  NStatistic,
  NIcon,
  NButton,
  NList,
  NListItem,
  NThing,
  NSpace,
} from 'naive-ui'
import {
  WalletOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  PlusOutlined,
} from '@vicons/antd'
import { api } from '@/api'
import type { FinanceSummary } from '@/types/finance'

const { t } = useI18n()

const loading = ref(false)
const summary = ref<FinanceSummary | null>(null)

async function loadData() {
  loading.value = true
  try {
    summary.value = await api.finance.summary.get()
  } catch (e) {
    console.error('Failed to load finance summary:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="finance-overview">
    <!-- Header -->
    <div class="overview-header">
      <div>
        <h1 class="page-title">{{ t('finance.overview.title') }}</h1>
        <p class="page-subtitle">{{ t('finance.overview.subtitle') }}</p>
      </div>
      <NSpace>
        <NButton type="primary" ghost>
          <template #icon>
            <NIcon><PlusOutlined /></NIcon>
          </template>
          {{ t('finance.actions.addTransaction') }}
        </NButton>
        <NButton type="primary">
          <template #icon>
            <NIcon><WalletOutlined /></NIcon>
          </template>
          {{ t('finance.actions.addAccount') }}
        </NButton>
      </NSpace>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <NGrid x-gap="24" y-gap="24" :cols="4">
        <NGridItem>
          <NCard :bordered="true" class="metric-card">
            <NStatistic :label="t('finance.summary.totalBalance')">
              <template #prefix>
                <div class="icon-box mocha">
                  <NIcon><WalletOutlined /></NIcon>
                </div>
              </template>
              <template #default>
                <span class="metric-value">${{ summary?.totalBalance.toFixed(2) || '0.00' }}</span>
              </template>
            </NStatistic>
          </NCard>
        </NGridItem>

        <NGridItem>
          <NCard :bordered="true" class="metric-card">
            <NStatistic :label="t('finance.summary.totalIncome')">
              <template #prefix>
                <div class="icon-box green">
                  <NIcon><RiseOutlined /></NIcon>
                </div>
              </template>
              <template #default>
                <span class="metric-value">${{ summary?.totalIncome.toFixed(2) || '0.00' }}</span>
              </template>
            </NStatistic>
          </NCard>
        </NGridItem>

        <NGridItem>
          <NCard :bordered="true" class="metric-card">
            <NStatistic :label="t('finance.summary.totalExpenses')">
              <template #prefix>
                <div class="icon-box red">
                  <NIcon><FallOutlined /></NIcon>
                </div>
              </template>
              <template #default>
                <span class="metric-value">${{ summary?.totalExpense.toFixed(2) || '0.00' }}</span>
              </template>
            </NStatistic>
          </NCard>
        </NGridItem>

        <NGridItem>
          <NCard :bordered="true" class="metric-card">
            <NStatistic :label="t('finance.summary.netCashFlow')">
              <template #prefix>
                <div class="icon-box amber">
                  <NIcon><DollarOutlined /></NIcon>
                </div>
              </template>
              <template #default>
                <span class="metric-value">${{ summary?.cashFlow.toFixed(2) || '0.00' }}</span>
              </template>
            </NStatistic>
          </NCard>
        </NGridItem>
      </NGrid>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <NCard :title="t('finance.overview.quickActions')" :bordered="true">
        <NList hoverable clickable>
          <NListItem>
            <NThing>
              <template #header>
                {{ t('finance.overview.viewAllAccounts') }}
              </template>
              <template #description>
                {{ t('finance.overview.manageYourAccounts') }}
              </template>
            </NThing>
          </NListItem>
          <NListItem>
            <NThing>
              <template #header>
                {{ t('finance.overview.viewAllTransactions') }}
              </template>
              <template #description>
                {{ t('finance.overview.browseRecentTransactions') }}
              </template>
            </NThing>
          </NListItem>
          <NListItem>
            <NThing>
              <template #header>
                {{ t('finance.overview.importStatement') }}
              </template>
              <template #description>
                {{ t('finance.overview.importBankStatement') }}
              </template>
            </NThing>
          </NListItem>
          <NListItem>
            <NThing>
              <template #header>
                {{ t('finance.overview.viewReports') }}
              </template>
              <template #description>
                {{ t('finance.overview.analyzeYourFinance') }}
              </template>
            </NThing>
          </NListItem>
        </NList>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.finance-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--n-text-color);
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--n-text-color-2);
}

.summary-section {
  margin-bottom: 8px;
}

.metric-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -2px rgba(44, 43, 41, 0.08);
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-box.mocha {
  background: linear-gradient(135deg, #8D7B68 0%, #A4907C 100%);
}

.icon-box.green {
  background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%);
}

.icon-box.red {
  background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
}

.icon-box.amber {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
}

.icon-box .n-icon {
  font-size: 24px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--n-text-color);
}
</style>

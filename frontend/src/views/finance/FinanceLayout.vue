<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NIcon,
  NSpace,
  NButton,
} from 'naive-ui'
import {
  WalletOutlined,
  TransactionOutlined,
  ImportOutlined,
  BarChartOutlined,
  FolderOutlined,
  HomeOutlined,
} from '@vicons/antd'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const menuOptions = computed(() => [
  {
    label: t('finance.nav.overview'),
    key: '/finance',
    icon: () => h(NIcon, null, () => h(HomeOutlined)),
  },
  {
    label: t('finance.nav.accounts'),
    key: '/finance/accounts',
    icon: () => h(NIcon, null, () => h(WalletOutlined)),
  },
  {
    label: t('finance.nav.transactions'),
    key: '/finance/transactions',
    icon: () => h(NIcon, null, () => h(TransactionOutlined)),
  },
  {
    label: t('finance.nav.import'),
    key: '/finance/import',
    icon: () => h(NIcon, null, () => h(ImportOutlined)),
  },
  {
    label: t('finance.nav.categories'),
    key: '/finance/categories',
    icon: () => h(NIcon, null, () => h(FolderOutlined)),
  },
  {
    label: t('finance.nav.reports'),
    key: '/finance/reports',
    icon: () => h(NIcon, null, () => h(BarChartOutlined)),
  },
])

function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<template>
  <NLayout has-sider style="height: 100%">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="false"
      show-trigger
      content-style="padding: 16px"
    >
      <div class="sider-header">
        <h3 class="sider-title">{{ t('finance.title') }}</h3>
      </div>
      <NMenu
        :value="route.path"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </NLayoutSider>
    <NLayoutContent content-style="padding: 24px" :native-scrollbar="false">
      <router-view />
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
.sider-header {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: var(--n-card-color);
}

.sider-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--n-text-color);
}
</style>

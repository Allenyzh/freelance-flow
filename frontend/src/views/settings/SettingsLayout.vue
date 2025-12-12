<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NLayout, NLayoutContent, NLayoutSider, NMenu, type MenuOption, NIcon, NSpace, NButton } from "naive-ui";
import { h } from "vue";
import { useI18n } from "vue-i18n";
import {
  SettingOutlined,
  GlobalOutlined,
  UserOutlined,
  FileTextOutlined,
  MailOutlined,
} from "@vicons/antd";
import type { Component } from "vue";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// Settings submenu options
const settingsMenuOptions = computed<MenuOption[]>(() => [
  {
    label: t("settings.general.title"),
    key: "/settings/general",
    icon: renderIcon(GlobalOutlined),
  },
  {
    label: t("settings.profile.title"),
    key: "/settings/profile",
    icon: renderIcon(UserOutlined),
  },
  {
    label: t("settings.invoice.title"),
    key: "/settings/invoice",
    icon: renderIcon(FileTextOutlined),
  },
  {
    label: t("settings.email.title"),
    key: "/settings/email",
    icon: renderIcon(MailOutlined),
  },
]);

const activeKey = computed(() => route.path);

function handleMenuUpdate(key: string) {
  router.push(key);
}
</script>

<template>
  <div class="settings-layout">
    <div class="settings-container">
      <!-- Breadcrumb -->
      <div class="settings-breadcrumb">
        <n-space align="center">
          <n-button text @click="() => router.push('/dashboard')">
            {{ t("nav.dashboard") }}
          </n-button>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ t("nav.settings") }}</span>
        </n-space>
      </div>

      <div class="settings-content">
        <!-- Sidebar -->
        <NLayoutSider
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          show-trigger
          class="settings-sider"
        >
          <NMenu
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="settingsMenuOptions"
            :value="activeKey"
            @update:value="handleMenuUpdate"
          />
        </NLayoutSider>

        <!-- Main Content -->
        <NLayoutContent class="settings-main">
          <RouterView />
        </NLayoutContent>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-layout {
  height: 100%;
  background-color: var(--n-color);
}

.settings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-breadcrumb {
  padding: 16px 24px;
  border-bottom: 1px solid var(--n-border-color);
  background-color: var(--n-color);
}

.breadcrumb-separator {
  color: var(--n-text-color-3);
  margin: 0 8px;
}

.breadcrumb-current {
  color: var(--n-text-color-1);
  font-weight: 500;
}

.settings-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.settings-sider {
  background-color: var(--n-color);
}

.settings-main {
  padding: 24px;
  overflow-y: auto;
  background-color: var(--n-color);
}
</style>

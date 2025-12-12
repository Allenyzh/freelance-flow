<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  NForm,
  NFormItem,
  NSelect,
  NInputNumber,
  NSpace,
  NButton,
  useMessage,
  NCard,
} from "naive-ui";
import { useSettingsStore } from "@/stores/settings";
import { useAppStore } from "@/stores/app";
import type { UserSettings } from "@/types";

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const message = useMessage();

const formRef = ref<InstanceType<typeof NForm> | null>(null);
const form = ref<UserSettings>({
  currency: "USD",
  defaultTaxRate: 0,
  language: "en-US",
  theme: "light",
  dateFormat: "2006-01-02",
  timezone: "UTC",
  senderName: "",
  senderCompany: "",
  senderAddress: "",
  senderPhone: "",
  senderEmail: "",
  senderPostalCode: "",
  invoiceTerms: "",
  defaultMessageTemplate: "",
});

const saving = ref(false);

const currencyOptions = [
  { label: "USD - US Dollar", value: "USD" },
  { label: "CAD - Canadian Dollar", value: "CAD" },
  { label: "CNY - Chinese Yuan", value: "CNY" },
  { label: "EUR - Euro", value: "EUR" },
];

const timezoneOptions = [
  { label: "UTC", value: "UTC" },
  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
  { label: "America/Toronto", value: "America/Toronto" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "Europe/London", value: "Europe/London" },
];

const dateFormatOptions = [
  { label: "YYYY-MM-DD", value: "2006-01-02" },
  { label: "MM/DD/YYYY", value: "01/02/2006" },
  { label: "DD/MM/YYYY", value: "02/01/2006" },
];

const rules = {
  currency: { required: true, message: "Currency is required", trigger: "blur" },
  dateFormat: {
    required: true,
    message: "Date format is required",
    trigger: "blur",
  },
  timezone: { required: true, message: "Timezone is required", trigger: "blur" },
};

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    // Only use the general settings fields
    const settings = settingsStore.settings;
    form.value = {
      ...form.value,
      currency: settings.currency,
      defaultTaxRate: settings.defaultTaxRate,
      language: settings.language,
      theme: settings.theme,
      dateFormat: settings.dateFormat,
      timezone: settings.timezone,
    };
  }
});

async function handleSave() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  saving.value = true;
  try {
    // Only save the general settings fields
    const currentSettings = settingsStore.settings || {};
    const updatedSettings = {
      ...currentSettings,
      currency: form.value.currency,
      defaultTaxRate: form.value.defaultTaxRate,
      language: form.value.language,
      theme: form.value.theme,
      dateFormat: form.value.dateFormat,
      timezone: form.value.timezone,
    };
    await settingsStore.saveSettings(updatedSettings);
    message.success("Saved general settings");
  } catch (e) {
    message.error(e instanceof Error ? e.message : "Failed to save settings");
  } finally {
    saving.value = false;
  }
}

function handleThemeChange(value: string) {
  if (appStore.theme !== value) {
    appStore.setTheme(value);
  }
}
</script>

<template>
  <div class="general-settings">
    <NCard title="General Settings" :bordered="false">
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NFormItem label="Currency" path="currency">
          <NSelect
            v-model:value="form.currency"
            :options="currencyOptions"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem label="Default Tax Rate" path="defaultTaxRate">
          <NInputNumber
            v-model:value="form.defaultTaxRate"
            :min="0"
            :max="1"
            :step="0.01"
            :disabled="saving"
          />
          <div class="hint">Use decimal, e.g. 0.13 for 13%.</div>
        </NFormItem>

        <NFormItem label="Date Format" path="dateFormat">
          <NSelect
            v-model:value="form.dateFormat"
            :options="dateFormatOptions"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem label="Timezone" path="timezone">
          <NSelect
            v-model:value="form.timezone"
            :options="timezoneOptions"
            filterable
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem label="Theme">
          <NSelect
            :value="appStore.theme"
            :options="[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]"
            :disabled="saving"
            @update:value="handleThemeChange"
          />
        </NFormItem>

        <NFormItem label="Language">
          <NSelect
            v-model:value="form.language"
            :options="[
              { label: 'English', value: 'en-US' },
              { label: '中文 (简体)', value: 'zh-CN' },
            ]"
            :disabled="saving"
            @update:value="(value) => appStore.setLocale(value as 'en-US' | 'zh-CN')"
          />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            Save
          </NButton>
        </NSpace>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.general-settings {
  max-width: 800px;
}

.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style>

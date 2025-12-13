<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NButton,
  useMessage,
} from "naive-ui";
import { useSettingsStore } from "@/stores/settings";
import type { UserSettings } from "@/types";
import { useI18n } from "vue-i18n";

const store = useSettingsStore();
const message = useMessage();
const { t } = useI18n();

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
  invoiceTerms: t("settings.invoice.defaults.invoiceTerms"),
  defaultMessageTemplate: t("settings.invoice.defaults.defaultMessageTemplate"),
});

const saving = ref(false);

const currencyOptions = computed(() => [
  { label: `USD - ${t("settings.general.options.currency.usd")}`, value: "USD" },
  { label: `CAD - ${t("settings.general.options.currency.cad")}`, value: "CAD" },
  { label: `CNY - ${t("settings.general.options.currency.cny")}`, value: "CNY" },
  { label: `EUR - ${t("settings.general.options.currency.eur")}`, value: "EUR" },
]);

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

const rules = computed(() => ({
  currency: {
    required: true,
    message: t("settings.general.validation.currencyRequired"),
    trigger: "blur",
  },
  dateFormat: {
    required: true,
    message: t("settings.general.validation.dateFormatRequired"),
    trigger: "blur",
  },
  timezone: {
    required: true,
    message: t("settings.general.validation.timezoneRequired"),
    trigger: "blur",
  },
  senderEmail: {
    validator: (_: unknown, value: string) => {
      if (!value) return true;
      return value.includes("@");
    },
    message: t("settings.profile.validation.invalidEmail"),
    trigger: ["blur", "input"],
  },
}));

onMounted(async () => {
  await store.fetchSettings();
  if (store.settings) {
    form.value = { ...store.settings };
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
    await store.saveSettings(form.value);
    message.success(t("common.saved"));
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.general.messages.saveError"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="user-settings">
    <h2 class="section-title">{{ t("nav.settings") }}</h2>
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-form-item :label="t('settings.general.fields.currency')" path="currency">
        <n-select
          v-model:value="form.currency"
          :options="currencyOptions"
          :disabled="saving"
        />
      </n-form-item>

      <n-form-item :label="t('settings.general.fields.defaultTaxRate')" path="defaultTaxRate">
        <n-input-number
          v-model:value="form.defaultTaxRate"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="saving"
        />
        <div class="hint">{{ t("settings.general.hints.taxRate") }}</div>
      </n-form-item>

      <n-form-item :label="t('settings.general.fields.dateFormat')" path="dateFormat">
        <n-select
          v-model:value="form.dateFormat"
          :options="dateFormatOptions"
          :disabled="saving"
        />
      </n-form-item>

      <n-form-item :label="t('settings.general.fields.timezone')" path="timezone">
        <n-select
          v-model:value="form.timezone"
          :options="timezoneOptions"
          filterable
          :disabled="saving"
        />
      </n-form-item>

      <h3 class="sub-title">{{ t("settings.invoice.headerCardTitle") }}</h3>

      <n-form-item :label="t('settings.invoice.fields.senderName')">
        <n-input v-model:value="form.senderName" :disabled="saving" />
      </n-form-item>
      <n-form-item :label="t('settings.invoice.fields.senderCompany')">
        <n-input v-model:value="form.senderCompany" :disabled="saving" />
      </n-form-item>
      <n-form-item :label="t('settings.invoice.fields.senderAddress')">
        <n-input v-model:value="form.senderAddress" :disabled="saving" />
      </n-form-item>
      <n-form-item :label="t('settings.invoice.fields.senderPhone')">
        <n-input v-model:value="form.senderPhone" :disabled="saving" />
      </n-form-item>
      <n-form-item :label="t('settings.invoice.fields.senderEmail')" path="senderEmail">
        <n-input v-model:value="form.senderEmail" :disabled="saving" />
      </n-form-item>
      <n-form-item :label="t('settings.invoice.fields.senderPostalCode')">
        <n-input v-model:value="form.senderPostalCode" :disabled="saving" />
      </n-form-item>

      <h3 class="sub-title">{{ t("settings.invoice.defaultsCardTitle") }}</h3>

      <n-form-item :label="t('settings.invoice.fields.invoiceTerms')">
        <n-input
          type="textarea"
          v-model:value="form.invoiceTerms"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :disabled="saving"
        />
      </n-form-item>

      <n-form-item :label="t('settings.invoice.fields.defaultMessageTemplate')">
        <n-input
          type="textarea"
          v-model:value="form.defaultMessageTemplate"
          :autosize="{ minRows: 3, maxRows: 6 }"
          :disabled="saving"
        />
      </n-form-item>

      <n-space justify="end">
        <n-button type="primary" :loading="saving" @click="handleSave">
          {{ t("common.save") }}
        </n-button>
      </n-space>
    </n-form>
  </div>
</template>

<style scoped>
.user-settings {
  padding: 16px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 12px;
}
.sub-title {
  margin: 12px 0 4px;
  font-size: 14px;
  font-weight: 600;
}
.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style>

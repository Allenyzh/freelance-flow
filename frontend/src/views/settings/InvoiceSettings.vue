<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NButton,
  useMessage,
  NCard,
  NSwitch,
} from "naive-ui";
import { useSettingsStore } from "@/stores/settings";
import type { UserSettings } from "@/types";

const settingsStore = useSettingsStore();
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
  invoiceTerms: "Due upon receipt",
  defaultMessageTemplate: "Thank you for your business.",
});

const saving = ref(false);
const useProfileForInvoice = ref(true);

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    const settings = settingsStore.settings;
    form.value = {
      ...form.value,
      invoiceTerms: settings.invoiceTerms,
      defaultMessageTemplate: settings.defaultMessageTemplate,
      senderName: settings.senderName,
      senderCompany: settings.senderCompany,
      senderAddress: settings.senderAddress,
      senderPhone: settings.senderPhone,
      senderEmail: settings.senderEmail,
      senderPostalCode: settings.senderPostalCode,
    };
  }
});

async function handleSave() {
  saving.value = true;
  try {
    const currentSettings = settingsStore.settings || {};
    const updatedSettings = {
      ...currentSettings,
      invoiceTerms: form.value.invoiceTerms,
      defaultMessageTemplate: form.value.defaultMessageTemplate,
      senderName: form.value.senderName,
      senderCompany: form.value.senderCompany,
      senderAddress: form.value.senderAddress,
      senderPhone: form.value.senderPhone,
      senderEmail: form.value.senderEmail,
      senderPostalCode: form.value.senderPostalCode,
    };
    await settingsStore.saveSettings(updatedSettings);
    message.success("Saved invoice settings");
  } catch (e) {
    message.error(e instanceof Error ? e.message : "Failed to save settings");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="invoice-settings">
    <NCard title="Invoice Defaults" :bordered="false">
      <NForm ref="formRef" label-placement="top">
        <NFormItem label="Invoice Terms">
          <NInput
            type="textarea"
            v-model:value="form.invoiceTerms"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem label="Default Message Template">
          <NInput
            type="textarea"
            v-model:value="form.defaultMessageTemplate"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :disabled="saving"
          />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            Save
          </NButton>
        </NSpace>
      </NForm>
    </NCard>

    <NCard title="Invoice Header" :bordered="false" style="margin-top: 16px">
      <NForm label-placement="top">
        <NFormItem label="Sender Name">
          <NInput v-model:value="form.senderName" :disabled="saving" />
        </NFormItem>
        <NFormItem label="Sender Company">
          <NInput v-model:value="form.senderCompany" :disabled="saving" />
        </NFormItem>
        <NFormItem label="Sender Address">
          <NInput v-model:value="form.senderAddress" :disabled="saving" />
        </NFormItem>
        <NFormItem label="Sender Phone">
          <NInput v-model:value="form.senderPhone" :disabled="saving" />
        </NFormItem>
        <NFormItem label="Sender Email">
          <NInput v-model:value="form.senderEmail" :disabled="saving" />
        </NFormItem>
        <NFormItem label="Sender Postal Code">
          <NInput v-model:value="form.senderPostalCode" :disabled="saving" />
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
.invoice-settings {
  max-width: 800px;
}
</style>

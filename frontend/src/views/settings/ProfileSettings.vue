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
  invoiceTerms: "",
  defaultMessageTemplate: "",
});

const saving = ref(false);

const rules = {
  senderEmail: {
    validator: (_: unknown, value: string) => {
      if (!value) return true;
      return value.includes("@");
    },
    message: "Invalid email format",
    trigger: ["blur", "input"],
  },
};

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    const settings = settingsStore.settings;
    form.value = {
      ...form.value,
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
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  saving.value = true;
  try {
    const currentSettings = settingsStore.settings || {};
    const updatedSettings = {
      ...currentSettings,
      senderName: form.value.senderName,
      senderCompany: form.value.senderCompany,
      senderAddress: form.value.senderAddress,
      senderPhone: form.value.senderPhone,
      senderEmail: form.value.senderEmail,
      senderPostalCode: form.value.senderPostalCode,
    };
    await settingsStore.saveSettings(updatedSettings);
    message.success("Saved profile settings");
  } catch (e) {
    message.error(e instanceof Error ? e.message : "Failed to save settings");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="profile-settings">
    <NCard title="Personal Information" :bordered="false">
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NFormItem label="Name" path="senderName">
          <NInput v-model:value="form.senderName" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Email" path="senderEmail">
          <NInput v-model:value="form.senderEmail" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Phone">
          <NInput v-model:value="form.senderPhone" :disabled="saving" />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            Save
          </NButton>
        </NSpace>
      </NForm>
    </NCard>

    <NCard title="Company Information" :bordered="false" style="margin-top: 16px">
      <NForm label-placement="top">
        <NFormItem label="Company">
          <NInput v-model:value="form.senderCompany" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Address">
          <NInput v-model:value="form.senderAddress" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Postal Code">
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
.profile-settings {
  max-width: 800px;
}
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NInputNumber,
  NSpace,
  NButton,
  useMessage,
  NCard,
  NSwitch,
} from "naive-ui";
import { useInvoiceEmailSettingsStore } from "@/stores/invoiceEmailSettings";
import type { InvoiceEmailSettings, EmailProvider } from "@/types";

const store = useInvoiceEmailSettingsStore();
const message = useMessage();

const form = ref<InvoiceEmailSettings>({
  provider: "mailto",
  subjectTemplate: "Invoice {{number}}",
  bodyTemplate: "Please find attached invoice {{number}}.",
  signature: "",
});

const saving = ref(false);

onMounted(async () => {
  await store.fetchSettings();
  if (store.settings) {
    form.value = { ...store.settings };
  }
});

const providerOptions: { label: string; value: EmailProvider }[] = [
  { label: "Mailto (default)", value: "mailto" },
  { label: "Resend", value: "resend" },
  { label: "SMTP", value: "smtp" },
];

async function handleSave() {
  saving.value = true;
  try {
    await store.saveSettings(form.value);
    message.success("Saved email settings");
  } catch (e) {
    message.error(
      e instanceof Error ? e.message : "Failed to save email settings"
    );
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="email-settings">
    <NCard title="Email Provider" :bordered="false">
      <NForm label-placement="top">
        <NFormItem label="Provider">
          <NSelect
            v-model:value="form.provider"
            :options="providerOptions"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem label="From">
          <NInput v-model:value="form.from" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Reply-To">
          <NInput v-model:value="form.replyTo" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Subject Template">
          <NInput v-model:value="form.subjectTemplate" :disabled="saving" />
        </NFormItem>

        <NFormItem label="Body Template">
          <NInput
            type="textarea"
            v-model:value="form.bodyTemplate"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem label="Signature">
          <NInput
            type="textarea"
            v-model:value="form.signature"
            :autosize="{ minRows: 2, maxRows: 4 }"
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

    <NCard
      v-if="form.provider === 'resend'"
      title="Resend Configuration"
      :bordered="false"
      style="margin-top: 16px"
    >
      <NForm label-placement="top">
        <NFormItem label="Resend API Key">
          <NInput
            type="password"
            show-password-on="click"
            v-model:value="form.resendApiKey"
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

    <NCard
      v-if="form.provider === 'smtp'"
      title="SMTP Configuration"
      :bordered="false"
      style="margin-top: 16px"
    >
      <NForm label-placement="top">
        <NFormItem label="SMTP Host">
          <NInput v-model:value="form.smtpHost" :disabled="saving" />
        </NFormItem>
        <NFormItem label="SMTP Port">
          <NInputNumber v-model:value="form.smtpPort" :disabled="saving" />
        </NFormItem>
        <NFormItem label="SMTP Username">
          <NInput v-model:value="form.smtpUsername" :disabled="saving" />
        </NFormItem>
        <NFormItem label="SMTP Password">
          <NInput
            type="password"
            show-password-on="click"
            v-model:value="form.smtpPassword"
            :disabled="saving"
          />
        </NFormItem>
        <NFormItem label="Use TLS">
          <NSwitch v-model:value="form.smtpUseTLS" :disabled="saving" />
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
.email-settings {
  max-width: 800px;
}
</style>

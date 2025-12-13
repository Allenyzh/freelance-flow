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
import { useI18n } from "vue-i18n";

const store = useInvoiceEmailSettingsStore();
const message = useMessage();
const { t } = useI18n();

const form = ref<InvoiceEmailSettings>({
  provider: "mailto",
  subjectTemplate: t("settings.email.defaults.subjectTemplate"),
  bodyTemplate: t("settings.email.defaults.bodyTemplate"),
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
  { label: t("settings.email.options.provider.mailto"), value: "mailto" },
  { label: t("settings.email.options.provider.resend"), value: "resend" },
  { label: t("settings.email.options.provider.smtp"), value: "smtp" },
];

async function handleSave() {
  saving.value = true;
  try {
    await store.saveSettings(form.value);
    message.success(t("settings.email.messages.saved"));
  } catch (e) {
    message.error(
      e instanceof Error ? e.message : t("settings.email.messages.saveError")
    );
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="email-settings">
    <NCard :title="t('settings.email.providerCardTitle')" :bordered="false">
      <NForm label-placement="top">
        <NFormItem :label="t('settings.email.fields.provider')">
          <NSelect
            v-model:value="form.provider"
            :options="providerOptions"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem :label="t('settings.email.fields.from')">
          <NInput v-model:value="form.from" :disabled="saving" />
        </NFormItem>

        <NFormItem :label="t('settings.email.fields.replyTo')">
          <NInput v-model:value="form.replyTo" :disabled="saving" />
        </NFormItem>

        <NFormItem :label="t('settings.email.fields.subjectTemplate')">
          <NInput v-model:value="form.subjectTemplate" :disabled="saving" />
        </NFormItem>

        <NFormItem :label="t('settings.email.fields.bodyTemplate')">
          <NInput
            type="textarea"
            v-model:value="form.bodyTemplate"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem :label="t('settings.email.fields.signature')">
          <NInput
            type="textarea"
            v-model:value="form.signature"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :disabled="saving"
          />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ t("common.save") }}
          </NButton>
        </NSpace>
      </NForm>
    </NCard>

    <NCard
      v-if="form.provider === 'resend'"
      :title="t('settings.email.resendCardTitle')"
      :bordered="false"
      style="margin-top: 16px"
    >
      <NForm label-placement="top">
        <NFormItem :label="t('settings.email.fields.resendApiKey')">
          <NInput
            type="password"
            show-password-on="click"
            v-model:value="form.resendApiKey"
            :disabled="saving"
          />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ t("common.save") }}
          </NButton>
        </NSpace>
      </NForm>
    </NCard>

    <NCard
      v-if="form.provider === 'smtp'"
      :title="t('settings.email.smtpCardTitle')"
      :bordered="false"
      style="margin-top: 16px"
    >
      <NForm label-placement="top">
        <NFormItem :label="t('settings.email.fields.smtpHost')">
          <NInput v-model:value="form.smtpHost" :disabled="saving" />
        </NFormItem>
        <NFormItem :label="t('settings.email.fields.smtpPort')">
          <NInputNumber v-model:value="form.smtpPort" :disabled="saving" />
        </NFormItem>
        <NFormItem :label="t('settings.email.fields.smtpUsername')">
          <NInput v-model:value="form.smtpUsername" :disabled="saving" />
        </NFormItem>
        <NFormItem :label="t('settings.email.fields.smtpPassword')">
          <NInput
            type="password"
            show-password-on="click"
            v-model:value="form.smtpPassword"
            :disabled="saving"
          />
        </NFormItem>
        <NFormItem :label="t('settings.email.fields.smtpUseTLS')">
          <NSwitch v-model:value="form.smtpUseTLS" :disabled="saving" />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ t("common.save") }}
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

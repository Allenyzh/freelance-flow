<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  NForm,
  NFormItem,
  NSelect,
  NSwitch,
  NSpace,
  NButton,
  useMessage,
  NCard,
} from "naive-ui";
import { api } from "@/api";
import { useI18n } from "vue-i18n";
import type { FinanceAccount, FinanceSettings } from "@/types/finance";

const { t } = useI18n();
const message = useMessage();

const formRef = ref<InstanceType<typeof NForm> | null>(null);
const form = ref<FinanceSettings>({
  defaultAccountId: undefined,
  autoCategorize: true,
  autoReconcile: false,
  userId: 0,
});

const accounts = ref<FinanceAccount[]>([]);
const saving = ref(false);

const accountOptions = computed(() =>
  accounts.value.map((a) => ({
    label: `${a.name} (${a.type})`,
    value: a.id,
  }))
);

onMounted(async () => {
  try {
    // Use API calls for testing
    accounts.value = await api.finance.accounts.list();
    const settings = await api.finance.settings.get();
    form.value = settings;
  } catch (e) {
    message.error(t("settings.finance.messages.loadError"));
  }
});

async function handleSave() {
  saving.value = true;
  try {
    await api.finance.settings.update(form.value);
    message.success(t("settings.finance.messages.saved"));
  } catch (e) {
    message.error(e instanceof Error ? e.message : t("settings.finance.messages.saveError"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="finance-settings">
    <NCard :title="t('settings.finance.title')" :bordered="false">
      <NForm ref="formRef" label-placement="top">
        <NFormItem :label="t('settings.finance.fields.defaultAccount')">
          <NSelect
            v-model:value="form.defaultAccountId"
            :options="accountOptions"
            clearable
            :placeholder="t('settings.finance.placeholders.defaultAccount')"
            :disabled="saving"
          />
        </NFormItem>

        <NFormItem :label="t('settings.finance.fields.autoCategorize')">
          <NSwitch
            v-model:value="form.autoCategorize"
            :disabled="saving"
          />
          <div class="hint">
            {{ t("settings.finance.hints.autoCategorize") }}
          </div>
        </NFormItem>

        <NFormItem :label="t('settings.finance.fields.autoReconcile')">
          <NSwitch
            v-model:value="form.autoReconcile"
            :disabled="saving"
          />
          <div class="hint">
            {{ t("settings.finance.hints.autoReconcile") }}
          </div>
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
.finance-settings {
  max-width: 800px;
}

.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #888;
}
</style>

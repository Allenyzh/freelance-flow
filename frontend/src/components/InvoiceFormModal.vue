<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NButton,
  NSpace,
  NText,
  useMessage,
  NGrid,
  NGi,
  NDivider,
  NDataTable,
  NEmpty
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { Invoice, InvoiceItem, Client, Project, TimeEntry } from '@/types'
import { dto } from '@/wailsjs/go/models'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import { invoiceSchema } from '@/schemas/invoice'
import { useZodRule } from '@/utils/validation'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  show: boolean
  invoice?: Invoice | null
  clients: Client[]
}

interface CreateInvoiceFromEntriesPayload {
  input: dto.CreateInvoiceInput
  timeEntryIds: number[]
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'create', payload: CreateInvoiceFromEntriesPayload): void
  (e: 'update', payload: { input: dto.UpdateInvoiceInput; timeEntryIds: number[] }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()
const { t } = useI18n()

const formRef = ref<FormInst | null>(null)
const settingsStore = useSettingsStore()

// HST/Tax settings from user preferences
const taxEnabled = computed(() => settingsStore.settings?.taxEnabled ?? false)
const defaultTaxRate = computed(() => {
  if (!taxEnabled.value) return 0
  return settingsStore.settings?.defaultTaxRate ?? 0.13
})

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

interface InvoiceFormData {
  clientId: number | null
  number: string
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: InvoiceStatus
}

function coerceInvoiceStatus(status: string): InvoiceStatus {
  if (status === 'draft' || status === 'sent' || status === 'paid' || status === 'overdue') return status
  return 'draft'
}

function defaultDueDateFromIssueDate(issueDate: string): string {
  const ts = Date.parse(issueDate)
  if (!Number.isFinite(ts)) return new Date().toISOString().split('T')[0]!
  const plusDays = 14
  return new Date(ts + plusDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!
}

const isEditMode = computed(() => Boolean(props.invoice))

const formValue = ref<InvoiceFormData>({
  clientId: null,
  number: '',
  issueDate: new Date().toISOString().split('T')[0]!,
  dueDate: defaultDueDateFromIssueDate(new Date().toISOString().split('T')[0]!),
  items: [],
  subtotal: 0,
  taxRate: 0.13,
  taxAmount: 0,
  total: 0,
  status: 'draft'
})

// 项目选择相关状态
const selectedProjectId = ref<number | null>(null)
const selectedProjectRate = ref<number>(0) // 存储选中项目的费率
const projectOptions = ref<Array<{ label: string; value: number }>>([])
const projectsLoading = ref(false)

const rules: FormRules = {
  clientId: {
    required: true,
    type: 'number',
    message: t('form.validation.select', { field: t('invoices.form.client') }),
    trigger: ['blur', 'change']
  },
  number: useZodRule(invoiceSchema.shape.number),
  issueDate: useZodRule(invoiceSchema.shape.issueDate),
  dueDate: useZodRule(invoiceSchema.shape.dueDate),
  taxRate: useZodRule(invoiceSchema.shape.taxRate),
  status: useZodRule(invoiceSchema.shape.status)
}

const statusOptions = [
  { label: t('invoices.status.draft'), value: 'draft' },
  { label: t('invoices.status.sent'), value: 'sent' },
  { label: t('invoices.status.paid'), value: 'paid' },
  { label: t('invoices.status.overdue'), value: 'overdue' }
]

const timeEntries = ref<TimeEntry[]>([])
const timeEntriesLoading = ref(false)
const selectedTimeEntryIds = ref<number[]>([])

const eligibleTimeEntries = computed(() =>
  timeEntries.value.filter((e) =>
    e.billable &&
    (!e.invoiceId || (props.invoice && e.invoiceId === props.invoice.id)) &&
    (!e.invoiced || (props.invoice && e.invoiceId === props.invoice.id))
  )
)

const selectedHours = computed(() => {
  const selectedSet = new Set(selectedTimeEntryIds.value)
  const totalSeconds = eligibleTimeEntries.value
    .filter((e) => selectedSet.has(e.id))
    .reduce((sum, e) => sum + e.durationSeconds, 0)
  return totalSeconds / 3600
})

const timeEntryColumns = computed<DataTableColumns<TimeEntry>>(() => [
  { type: 'selection', width: 50 },
  { title: t('invoices.selectEntries.columns.date'), key: 'date', width: 160 },
  { title: t('timesheet.form.description'), key: 'description' }, // Let description take remaining space, but we increased other cols
  {
    title: t('invoices.selectEntries.columns.hours'),
    key: 'durationSeconds',
    width: 120,
    align: 'right',
    render: (row) => (row.durationSeconds / 3600).toFixed(2)
  }
])

// 保存加载的项目数据（包含费率）
const projectsData = ref<Project[]>([])

// Helper to load projects
async function loadProjects(clientId: number) {
  projectsLoading.value = true
  try {
    const projects = await api.projects.listByClient(clientId)
    projectsData.value = projects
    projectOptions.value = projects.map((p: Project) => ({
      label: p.name,
      value: p.id
    }))
  } catch {
    projectOptions.value = []
    projectsData.value = []
    message.error(t('projects.loadError'))
  } finally {
    projectsLoading.value = false
  }
}

const isInitializing = ref(false)

// 监听客户选择变化，加载该客户的项目列表
watch(
  () => formValue.value.clientId,
  async (clientId) => {
    if (isInitializing.value) return

    // User changed client: Reset project and time entries
    selectedProjectId.value = null
    selectedProjectRate.value = 0
    projectOptions.value = []
    projectsData.value = []
    timeEntries.value = []
    selectedTimeEntryIds.value = []

    if (!clientId) return

    await loadProjects(clientId)
  }
)

// 监听项目选择变化，加载工时记录并保存费率
watch(
  () => selectedProjectId.value,
  async (projectId) => {
    timeEntries.value = []
    selectedTimeEntryIds.value = []
    selectedProjectRate.value = 0

    if (!projectId) return

    // 获取选中项目的费率
    const project = projectsData.value.find(p => p.id === projectId)
    if (project) {
      selectedProjectRate.value = project.hourlyRate
    }

    timeEntriesLoading.value = true
    try {
      timeEntries.value = await api.timeEntries.list(projectId)
      // Auto-select eligible entries that are not yet invoiced, OR are linked to this invoice
      if (isEditMode.value && props.invoice) {
        selectedTimeEntryIds.value = eligibleTimeEntries.value
          .filter(e => e.invoiceId === props.invoice?.id)
          .map(e => e.id)
      } else {
        selectedTimeEntryIds.value = eligibleTimeEntries.value.map((e) => e.id)
      }
    } catch {
      timeEntries.value = []
      message.error(t('timesheet.loadError'))
    } finally {
      timeEntriesLoading.value = false
    }
  }
)

// 监听选中工时变化，实时计算小计金额
watch(
  () => selectedTimeEntryIds.value,
  () => {
    const selectedSet = new Set(selectedTimeEntryIds.value)
    const totalSeconds = eligibleTimeEntries.value
      .filter((e) => selectedSet.has(e.id))
      .reduce((sum, e) => sum + e.durationSeconds, 0)
    const hours = totalSeconds / 3600
    const subtotal = hours * selectedProjectRate.value
    formValue.value.subtotal = subtotal
    formValue.value.taxAmount = subtotal * formValue.value.taxRate
    formValue.value.total = subtotal + formValue.value.taxAmount
  },
  { deep: true }
)

watch(() => props.invoice, async (newInvoice) => {
  if (newInvoice) {
    isInitializing.value = true
    try {
      formValue.value = {
        clientId: newInvoice.clientId,
        number: newInvoice.number,
        issueDate: newInvoice.issueDate,
        dueDate: newInvoice.dueDate || defaultDueDateFromIssueDate(newInvoice.issueDate),
        items: newInvoice.items.map(i => ({ ...i })),
        subtotal: newInvoice.subtotal,
        taxRate: newInvoice.taxRate,
        taxAmount: newInvoice.taxAmount,
        total: newInvoice.total,
        status: coerceInvoiceStatus(newInvoice.status)
      }

      // Load projects for the client
      if (newInvoice.clientId) {
        await loadProjects(newInvoice.clientId)
      }

      // Set project ID if available (from backend DTO)
      const inv = newInvoice as any
      if (inv.projectId) {
        selectedProjectId.value = inv.projectId
      } else {
        selectedProjectId.value = null
      }
    } finally {
      // Small delay to ensure watchers have fired/settled if needed, though usually not required if using await
      setTimeout(() => {
        isInitializing.value = false
      }, 0)
    }
  } else {
    const issueDate = new Date().toISOString().split('T')[0]!
    formValue.value = {
      clientId: null,
      number: (() => {
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const hh = String(now.getHours()).padStart(2, '0')
        const min = String(now.getMinutes()).padStart(2, '0')
        return `INV-${yyyy}${mm}${dd}-${hh}${min}`
      })(),
      issueDate,
      dueDate: defaultDueDateFromIssueDate(issueDate),
      items: [],
      subtotal: 0,
      taxRate: defaultTaxRate.value,
      taxAmount: 0,
      total: 0,
      status: 'draft'
    }
    selectedProjectId.value = null
    projectOptions.value = []
    timeEntries.value = []
    selectedTimeEntryIds.value = []
  }
}, { immediate: true })

function handleClose() {
  emit('update:show', false)
}

function handleUpdateShow(value: boolean) {
  emit('update:show', value)
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (isEditMode.value && props.invoice) {
        emit('update', {
          input: dto.UpdateInvoiceInput.createFrom({
            id: props.invoice.id,
            clientId: formValue.value.clientId ?? 0,
            number: formValue.value.number,
            issueDate: formValue.value.issueDate,
            dueDate: formValue.value.dueDate,
            subtotal: formValue.value.subtotal,
            taxRate: formValue.value.taxRate,
            taxAmount: formValue.value.taxAmount,
            total: formValue.value.total,
            status: formValue.value.status,
            items: formValue.value.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              amount: i.amount
            }))
          }),
          timeEntryIds: selectedTimeEntryIds.value
        })
        handleClose()
        return
      }

      if (!formValue.value.clientId) {
        message.warning(t('form.validation.select', { field: t('invoices.form.client') }))
        return
      }
      if (!selectedProjectId.value) {
        message.warning(t('form.validation.select', { field: t('invoices.form.project') }))
        return
      }
      if (selectedTimeEntryIds.value.length === 0) {
        message.warning(t('invoices.form.validation.selectEntries'))
        return
      }

      emit('create', {
        input: dto.CreateInvoiceInput.createFrom({
          clientId: formValue.value.clientId,
          number: formValue.value.number,
          issueDate: formValue.value.issueDate,
          dueDate: formValue.value.dueDate,
          subtotal: 0,
          taxRate: formValue.value.taxRate,
          taxAmount: 0,
          total: 0,
          status: formValue.value.status,
          items: []
        }),
        timeEntryIds: selectedTimeEntryIds.value
      })
      handleClose()
    } else {
      message.error(t('invoices.form.validation.fixErrors'))
    }
  })
}
</script>

<template>
  <n-modal :show="show" @update:show="handleUpdateShow" preset="card"
    :style="{ width: '900px', maxWidth: '95vw', maxHeight: '85vh' }" :content-style="{ overflow: 'auto' }"
    :title="invoice ? t('invoices.form.editTitle') : t('invoices.form.newTitle')"
    :segmented="{ content: 'soft', footer: 'soft' }">
    <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" size="medium">

      <!-- Top Section: Form Fields - 2 rows x 3 cols -->
      <n-grid :x-gap="16" :y-gap="0" :cols="3">
        <!-- Row 1: Client, Project (create mode) / Invoice Number (edit mode), Status -->
        <n-gi :span="1">
          <n-form-item :label="t('invoices.form.client')" path="clientId">
            <n-select v-model:value="formValue.clientId" :options="clients.map(c => ({ label: c.name, value: c.id }))"
              :placeholder="t('invoices.form.selectClient')" filterable clearable />
          </n-form-item>
        </n-gi>
        <n-gi :span="1">
          <n-form-item :label="t('invoices.form.project')">
            <n-select v-model:value="selectedProjectId" :options="projectOptions"
              :placeholder="t('invoices.form.selectProject')" :loading="projectsLoading" :disabled="!formValue.clientId"
              filterable clearable />
          </n-form-item>
        </n-gi>
        <n-gi :span="1">
          <n-form-item :label="t('invoices.form.status')" path="status">
            <n-select v-model:value="formValue.status" :options="statusOptions" />
          </n-form-item>
        </n-gi>
        <!-- Row 2: Invoice Number, Issue Date, Due Date -->
        <n-gi :span="1">
          <n-form-item :label="t('invoices.form.invoiceNumber')" path="number">
            <n-input v-model:value="formValue.number" placeholder="INV-001" />
          </n-form-item>
        </n-gi>
        <n-gi :span="1">
          <n-form-item :label="t('invoices.form.issueDate')" path="issueDate">
            <n-date-picker v-model:formatted-value="formValue.issueDate" type="date" value-format="yyyy-MM-dd"
              style="width: 100%;" />
          </n-form-item>
        </n-gi>
        <n-gi :span="1">
          <n-form-item :label="t('invoices.form.dueDate')" path="dueDate">
            <n-date-picker v-model:formatted-value="formValue.dueDate" type="date" value-format="yyyy-MM-dd"
              style="width: 100%;" />
          </n-form-item>
        </n-gi>
      </n-grid>

      <n-divider style="margin: 12px 0" />

      <!-- Time Entries Selection (Always visible now) -->
      <!-- Time Entries Selection (Always visible now) -->
      <div class="items-header">
        <n-text strong>{{ t('invoices.form.timeEntries.title') }}</n-text>
        <n-text depth="3" style="font-size: 12px; margin-left: 8px;">
          {{ t('invoices.form.timeEntries.selectedHours', { hours: selectedHours.toFixed(2) }) }}
        </n-text>
      </div>

      <div class="items-container">
        <n-empty v-if="!selectedProjectId" :description="t('invoices.form.timeEntries.selectProjectHint')"
          size="small" />
        <n-empty v-else-if="!timeEntriesLoading && eligibleTimeEntries.length === 0"
          :description="t('invoices.form.timeEntries.empty')" size="small" />
        <n-data-table v-else :loading="timeEntriesLoading" :columns="timeEntryColumns" :data="eligibleTimeEntries"
          :row-key="(row: TimeEntry) => row.id" :checked-row-keys="selectedTimeEntryIds"
          @update:checked-row-keys="(keys: Array<string | number>) => selectedTimeEntryIds = keys as number[]"
          :max-height="200" />
      </div>



      <!-- Totals Section - Horizontal Layout -->
      <div class="totals-row">
        <div class="total-item">
          <span class="label">{{ t('invoices.form.subtotal') }}</span>
          <span class="value">${{ formValue.subtotal.toFixed(2) }}</span>
        </div>
        <template v-if="taxEnabled">
          <div class="total-item">
            <span class="label">{{ t('invoices.form.taxRate') }}</span>
            <n-input-number v-model:value="formValue.taxRate" :step="0.01" :min="0" :max="1" size="small"
              :show-button="false" style="width: 80px;">
              <template #suffix>%</template>
            </n-input-number>
          </div>
          <div class="total-item">
            <span class="label">{{ t('invoices.form.taxAmount') }}</span>
            <span class="value">${{ formValue.taxAmount.toFixed(2) }}</span>
          </div>
        </template>
        <div class="total-item grand-total">
          <span class="label">{{ t('invoices.form.total') }}</span>
          <span class="value">${{ formValue.total.toFixed(2) }}</span>
        </div>
      </div>

    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose" size="large">{{ t('invoices.form.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit" size="large" style="padding-left: 32px; padding-right: 32px;">
          {{ invoice ? t('invoices.form.update') : t('invoices.form.create') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.invoice-meta-box {
  background-color: var(--n-color-modal);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--n-divider-color);
}

.items-header {
  margin-bottom: 6px;
}

.items-container {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  padding: 10px;
  border: 1px solid var(--n-divider-color);
}

.totals-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--n-divider-color);
}

.total-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-item .label {
  color: var(--n-text-color-3);
  font-size: 13px;
}

.total-item .value {
  font-weight: 500;
  color: var(--n-text-color-1);
}

.total-item.grand-total {
  padding-left: 16px;
  border-left: 2px solid var(--n-primary-color);
}

.total-item.grand-total .label {
  font-weight: 600;
  color: var(--n-text-color-1);
}

.total-item.grand-total .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--n-primary-color);
}
</style>

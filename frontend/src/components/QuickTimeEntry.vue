<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NSelect, NDatePicker, NButton, NIcon, useMessage } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import type { Project } from '@/types'

interface Props {
    projects: Project[]
}

interface Emits {
    (e: 'submit', entry: { projectId: number; description: string; durationSeconds: number; date: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()
const { t } = useI18n()

// Form State
const description = ref('')
const projectId = ref<number | null>(null)
const durationInput = ref('')
const date = ref<string>(new Date().toISOString().split('T')[0]!)

// Computed
const projectOptions = computed(() =>
    props.projects.map(p => ({ label: p.name, value: p.id }))
)

/**
 * Parse duration string to seconds
 * Supports: "1h", "1h 30m", "1.5", "1.5h", "90m", "90", "1:30"
 */
function parseDuration(input: string): number | null {
    if (!input.trim()) return null

    const normalized = input.trim().toLowerCase()

    // Format: "1h 30m" or "1h30m"
    const hhmm = normalized.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?$/)
    if (hhmm) {
        const hours = parseFloat(hhmm[1] ?? '0')
        const mins = hhmm[2] ? parseInt(hhmm[2]) : 0
        return Math.round(hours * 3600 + mins * 60)
    }

    // Format: "30m" or "90m"
    const minsOnly = normalized.match(/^(\d+)\s*m$/)
    if (minsOnly) {
        return parseInt(minsOnly[1] ?? '0') * 60
    }

    // Format: "1:30" (HH:MM)
    const colonFormat = normalized.match(/^(\d+):(\d+)$/)
    if (colonFormat) {
        const hours = parseInt(colonFormat[1] ?? '0')
        const mins = parseInt(colonFormat[2] ?? '0')
        return hours * 3600 + mins * 60
    }

    // Format: plain number (treat as hours) - "1.5" = 1.5h
    const plainNumber = parseFloat(normalized)
    if (!isNaN(plainNumber) && plainNumber > 0) {
        return Math.round(plainNumber * 3600)
    }

    return null
}

function formatDurationPreview(input: string): string {
    const seconds = parseDuration(input)
    if (!seconds) return ''

    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)

    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    if (m > 0) return `${m}m`
    return ''
}

const durationPreview = computed(() => formatDurationPreview(durationInput.value))
const isValid = computed(() =>
    projectId.value &&
    description.value.trim() &&
    parseDuration(durationInput.value) !== null
)

function handleSubmit() {
    if (!projectId.value) {
        message.warning(t('timesheet.quickEntry.selectProject'))
        return
    }

    const durationSeconds = parseDuration(durationInput.value)
    if (!durationSeconds) {
        message.warning(t('timesheet.quickEntry.invalidDuration'))
        return
    }

    if (!description.value.trim()) {
        message.warning(t('timesheet.quickEntry.enterDescription'))
        return
    }

    emit('submit', {
        projectId: projectId.value,
        description: description.value.trim(),
        durationSeconds,
        date: date.value
    })

    // Reset form
    description.value = ''
    durationInput.value = ''
    // Keep projectId and date for convenience

    message.success(t('timesheet.quickEntry.loggedMsg'))
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && isValid.value) {
        handleSubmit()
    }
}
</script>

<template>
    <div class="quick-entry">
        <div class="entry-content">
            <!-- Description -->
            <n-input v-model:value="description" :placeholder="t('timesheet.quickEntry.placeholder')"
                class="description-input" @keydown="handleKeydown" />

            <!-- Project -->
            <n-select v-model:value="projectId" :options="projectOptions"
                :placeholder="t('timesheet.quickEntry.project')" class="project-select" filterable />

            <!-- Date -->
            <n-date-picker v-model:formatted-value="date" type="date" value-format="yyyy-MM-dd" class="date-picker"
                :is-date-disabled="(ts: number) => ts > Date.now()" />

            <!-- Duration -->
            <div class="duration-wrapper">
                <n-input v-model:value="durationInput" placeholder="1.5h" class="duration-input"
                    @keydown="handleKeydown" />
                <span v-if="durationPreview" class="duration-preview">= {{ durationPreview }}</span>
            </div>

            <!-- Submit -->
            <n-button type="primary" :disabled="!isValid" @click="handleSubmit">
                <template #icon>
                    <n-icon>
                        <PlusOutlined />
                    </n-icon>
                </template>
                {{ t('common.add') }}
            </n-button>
        </div>

        <div class="hint-text">
            <span>{{ t('timesheet.quickEntry.durationHint', { examples: t('timesheet.quickEntry.durationExamples') })
                }}</span>
        </div>
    </div>
</template>

<style scoped>
.quick-entry {
    background: var(--n-card-color);
    border: 1px dashed var(--n-border-color);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    transition: border-color 0.2s ease;
}

.quick-entry:focus-within {
    border-color: var(--n-primary-color);
    border-style: solid;
}

.entry-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.description-input {
    flex: 1;
    min-width: 200px;
}

.project-select {
    width: 160px;
}

.date-picker {
    width: 140px;
}

.duration-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.duration-input {
    width: 80px;
}

.duration-preview {
    font-size: 0.85rem;
    color: var(--n-text-color-3);
    white-space: nowrap;
}

.hint-text {
    margin-top: 8px;
    font-size: 0.8rem;
    color: var(--n-text-color-3);
}

@media (max-width: 768px) {
    .entry-content {
        flex-direction: column;
        align-items: stretch;
    }

    .description-input,
    .project-select,
    .date-picker {
        width: 100%;
    }

    .duration-wrapper {
        width: 100%;
    }

    .duration-input {
        flex: 1;
    }
}
</style>

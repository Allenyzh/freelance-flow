<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  NButton, NCard, NTag, NSpace, NText, NEmpty, NIcon,
  NPopconfirm, NTooltip,
  useMessage
} from 'naive-ui'
import PageContainer from '@/components/PageContainer.vue'
import TimeTracker from '@/components/TimeTracker.vue'
import QuickTimeEntry from '@/components/QuickTimeEntry.vue'
import TimesheetFormModal from '@/components/TimesheetFormModal.vue'
import { useTimesheetStore } from '@/stores/timesheet'
import { useProjectStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { TimeEntry } from '@/types'
import {
  ClockCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  LeftOutlined,
  RightOutlined
} from '@vicons/antd'

const message = useMessage()
const timesheetStore = useTimesheetStore()
const projectStore = useProjectStore()
const { groupedByDay, loading } = storeToRefs(timesheetStore)
const { projects } = storeToRefs(projectStore)
const { t } = useI18n()

const showModal = ref(false)
const editingEntry = ref<TimeEntry | null>(null)

// Week navigation
const currentWeekStart = ref(getWeekStart(new Date()))

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDays(start: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

const weekDays = computed(() => getWeekDays(currentWeekStart.value))

// Helper to safely get date key
function getDateKey(d: Date): string {
  return d.toISOString().split('T')[0]!
}

// Calculate hours per day for week view
const weekHours = computed(() => {
  const hours: Record<string, number> = {}
  weekDays.value.forEach(d => {
    const dateStr = getDateKey(d)
    hours[dateStr] = 0
  })

  groupedByDay.value.forEach(day => {
    if (hours[day.date] !== undefined) {
      hours[day.date] = day.totalSeconds / 3600
    }
  })

  return hours
})

const weekTotal = computed(() => {
  return Object.values(weekHours.value).reduce((a, b) => a + b, 0).toFixed(1)
})

function formatWeekRange(): string {
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 6)

  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return `${fmt.format(currentWeekStart.value)} - ${fmt.format(end)}`
}

function prevWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = d
}

function nextWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = d
}

function goToThisWeek() {
  currentWeekStart.value = getWeekStart(new Date())
}

// Entry actions
function handleEdit(entry: TimeEntry) {
  editingEntry.value = entry
  showModal.value = true
}

async function handleDelete(id: number) {
  try {
    await timesheetStore.deleteTimeEntry(id)
    message.success(t('timesheet.entry.deletedMsg'))
  } catch {
    message.error('Failed to delete entry')
  }
}

function handleContinueTimer(entry: TimeEntry & { project?: { name: string } }) {
  // This would trigger the TimeTracker to start with this project/description
  message.info(`Continue tracking: ${entry.project?.name || 'Unknown project'}`)
  // TODO: Implement continue timer via store action
}

// Form handlers
async function handleSubmitEntry(entry: Omit<TimeEntry, 'id'> | TimeEntry) {
  try {
    if ('id' in entry) {
      await timesheetStore.updateTimeEntry(entry)
      message.success(t('timesheet.entry.updatedMsg'))
    } else {
      await timesheetStore.createTimeEntry(entry)
      message.success('Time logged')
    }
  } catch {
    message.error('Failed to save time entry')
  }
}

async function handleTimerStop(data: { projectId: number; description: string; durationSeconds: number }) {
  try {
    await timesheetStore.createTimeEntry({
      projectId: data.projectId,
      description: data.description,
      durationSeconds: data.durationSeconds,
      date: new Date().toISOString().split('T')[0]!,
      startTime: '',
      endTime: '',
      invoiced: false
    })
  } catch {
    message.error('Failed to save timer entry')
  }
}

async function handleQuickEntry(data: { projectId: number; description: string; durationSeconds: number; date: string }) {
  try {
    await timesheetStore.createTimeEntry({
      projectId: data.projectId,
      description: data.description,
      durationSeconds: data.durationSeconds,
      date: data.date,
      startTime: '',
      endTime: '',
      invoiced: false
    })
  } catch {
    message.error('Failed to save entry')
  }
}

onMounted(() => {
  timesheetStore.fetchTimesheet()
  projectStore.fetchProjects()
})

// Helper to format duration
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// Helper to format date header
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Today'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

function getDayName(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
}
</script>

<template>
  <PageContainer title="Timesheet" subtitle="Track and log your billable hours">
    <!-- Timer Bar -->
    <TimeTracker :projects="projects" @stop="handleTimerStop" />

    <!-- Week Navigation & Stats -->
    <div class="week-header">
      <div class="week-nav">
        <n-button quaternary circle size="small" @click="prevWeek">
          <template #icon><n-icon>
              <LeftOutlined />
            </n-icon></template>
        </n-button>
        <n-button text @click="goToThisWeek" class="week-range">
          {{ formatWeekRange() }}
        </n-button>
        <n-button quaternary circle size="small" @click="nextWeek">
          <template #icon><n-icon>
              <RightOutlined />
            </n-icon></template>
        </n-button>
      </div>

      <div class="week-stats">
        <div v-for="day in weekDays" :key="day.toISOString()" class="day-stat"
          :class="{ 'is-today': isToday(day), 'has-hours': (weekHours[getDateKey(day)] ?? 0) > 0 }">
          <span class="day-name">{{ getDayName(day) }}</span>
          <span class="day-hours">{{ (weekHours[getDateKey(day)] ?? 0).toFixed(1) }}h</span>
        </div>
        <div class="week-total">
          <span class="total-label">{{ t('common.total') }}</span>
          <span class="total-hours">{{ weekTotal }}h</span>
        </div>
      </div>
    </div>

    <!-- Quick Entry -->
    <QuickTimeEntry :projects="projects" @submit="handleQuickEntry" />

    <!-- Edit Modal -->
    <TimesheetFormModal v-model:show="showModal" :entry="editingEntry" :projects="projects"
      @submit="handleSubmitEntry" />

    <!-- Entries List -->
    <div v-if="loading" class="loading-state">
      <n-text depth="3">Loading timesheet...</n-text>
    </div>

    <div v-else-if="groupedByDay.length === 0" class="empty-state">
      <n-empty :description="t('timesheet.noEntries')">
        <template #icon>
          <n-icon size="48" color="var(--n-text-color-3)">
            <ClockCircleOutlined />
          </n-icon>
        </template>
        <template #extra>
          <n-space vertical align="center">
            <n-text depth="3">
              {{ t('timesheet.noEntriesHint') }}
            </n-text>
          </n-space>
        </template>
      </n-empty>
    </div>

    <div v-else class="timesheet-journal">
      <div v-for="day in groupedByDay" :key="day.date" class="day-group">
        <!-- Date Header -->
        <div class="day-header">
          <div class="day-header-left">
            <n-icon size="18" class="calendar-icon">
              <CalendarOutlined />
            </n-icon>
            <n-text strong class="day-title">{{ formatDateHeader(day.date) }}</n-text>
          </div>
          <n-tag :bordered="false" size="small" type="info" round>
            {{ formatDuration(day.totalSeconds) }}
          </n-tag>
        </div>

        <!-- Entries List -->
        <n-card class="day-card" size="small">
          <div v-for="(entry, index) in day.entries" :key="entry.id" class="entry-row"
            :class="{ 'last-row': index === day.entries.length - 1 }">
            <!-- Project & Description -->
            <div class="entry-main">
              <n-tag :bordered="false" size="small" type="default" class="project-tag">
                {{ entry.project?.name || t('timesheet.entry.noProject') }}
              </n-tag>
              <n-text class="entry-description">{{ entry.description }}</n-text>
            </div>

            <!-- Duration & Actions -->
            <div class="entry-actions">
              <n-tag v-if="entry.invoiced" type="success" size="tiny" round>
                {{ t('timesheet.entry.invoiced') }}
              </n-tag>

              <n-text strong class="duration-text">
                {{ formatDuration(entry.durationSeconds) }}
              </n-text>

              <span v-if="entry.startTime" class="time-range">
                {{ entry.startTime }} - {{ entry.endTime }}
              </span>

              <div class="action-buttons">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="tiny" @click="handleContinueTimer(entry)">
                      <template #icon><n-icon size="14">
                          <PlayCircleOutlined />
                        </n-icon></template>
                    </n-button>
                  </template>
                  {{ t('timesheet.entry.continueTimer') }}
                </n-tooltip>

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="tiny" @click="handleEdit(entry)">
                      <template #icon><n-icon size="14">
                          <EditOutlined />
                        </n-icon></template>
                    </n-button>
                  </template>
                  {{ t('timesheet.entry.editEntry') }}
                </n-tooltip>

                <n-popconfirm @positive-click="handleDelete(entry.id)">
                  <template #trigger>
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        <n-button quaternary circle size="tiny" type="error">
                          <template #icon><n-icon size="14">
                              <DeleteOutlined />
                            </n-icon></template>
                        </n-button>
                      </template>
                      {{ t('timesheet.entry.deleteEntry') }}
                    </n-tooltip>
                  </template>
                  {{ t('timesheet.entry.deleteConfirm') }}
                </n-popconfirm>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

  </PageContainer>
</template>

<style scoped>
/* Week Header */
.week-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--n-card-color);
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
}

.week-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.week-range {
  font-weight: 600;
  font-size: 1rem;
}

.week-stats {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.day-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 8px;
  background: var(--n-action-color);
  transition: all 0.2s ease;
}

.day-stat.is-today {
  background: linear-gradient(135deg, var(--n-primary-color) 0%, var(--n-primary-color-hover) 100%);
  color: white;
}

.day-stat.has-hours:not(.is-today) {
  background: rgba(var(--n-primary-color-rgb), 0.1);
}

.day-name {
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-hours {
  font-weight: 600;
  font-size: 0.9rem;
}

.week-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border-left: 2px solid var(--n-border-color);
  margin-left: 8px;
}

.total-label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.total-hours {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--n-primary-color);
}

/* Journal View */
.timesheet-journal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
}

.day-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendar-icon {
  color: var(--n-text-color-3);
}

.day-title {
  font-size: 1rem;
  color: var(--n-text-color-2);
}

.day-card {
  border-radius: 12px;
  overflow: hidden;
}

.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 4px;
  border-bottom: 1px solid var(--n-divider-color);
  transition: background 0.15s ease;
}

.entry-row:hover {
  background: var(--n-action-color);
}

.entry-row.last-row {
  border-bottom: none;
}

.entry-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.project-tag {
  flex-shrink: 0;
}

.entry-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.duration-text {
  color: var(--n-primary-color);
  font-size: 0.95rem;
}

.time-range {
  font-size: 0.8rem;
  color: var(--n-text-color-3);
}

.action-buttons {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.entry-row:hover .action-buttons {
  opacity: 1;
}

/* Empty & Loading States */
.empty-state,
.loading-state {
  padding: 64px 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .week-stats {
    flex-wrap: wrap;
  }

  .day-stat {
    min-width: calc(25% - 8px);
  }

  .week-total {
    width: 100%;
    border-left: none;
    border-top: 2px solid var(--n-border-color);
    margin-left: 0;
    margin-top: 8px;
    padding-top: 12px;
  }

  .entry-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .entry-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-buttons {
    opacity: 1;
  }
}
</style>

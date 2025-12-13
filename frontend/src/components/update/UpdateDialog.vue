<template>
    <n-modal v-model:show="showModal" :mask-closable="!isMandatory && status !== 'downloading'"
        :close-on-esc="!isMandatory && status !== 'downloading'" preset="card" title="Update Available"
        class="update-modal" :style="{ width: '600px' }">
        <template #header-extra>
            <n-tag type="success" round>
                {{ updateInfo?.version }}
            </n-tag>
        </template>

        <div v-if="status === 'error'" class="mb-4 text-red-500">
            Error: {{ state.error }}
        </div>

        <div v-if="updateInfo">
            <!-- Release Notes View -->
            <div v-if="status === 'available'">
                <div class="mb-4 text-gray-400">
                    Released on {{ formatDate(updateInfo.releaseDate) }}
                </div>

                <div class="release-notes bg-gray-800/50 p-4 rounded mb-6">
                    <div class="prose prose-invert prose-sm">
                        <pre class="whitespace-pre-wrap font-sans text-gray-300">{{ updateInfo.releaseNotes }}</pre>
                    </div>
                </div>
            </div>

            <!-- Downloading View -->
            <div v-if="status === 'downloading'" class="py-8 text-center">
                <div class="mb-4 text-lg">Downloading Update...</div>
                <n-progress type="line" :percentage="downloadPercentage" :indicator-placement="'inside'" processing />
                <div class="mt-2 text-gray-400 text-sm">
                    {{ formatBytes(progress.current) }} / {{ formatBytes(progress.total) }}
                </div>
            </div>

            <!-- Ready View -->
            <div v-if="status === 'ready'" class="py-6 text-center">
                <div class="text-xl text-green-500 mb-2">Download Complete!</div>
                <p class="text-gray-400 mb-6">The update is ready to be installed.</p>
                <div class="text-sm bg-gray-800 p-4 rounded text-left mb-4">
                    <p class="font-bold mb-2">Installation Instructions:</p>
                    <ol class="list-decimal list-inside space-y-1">
                        <li>Click "Install Update" below to open the disk image.</li>
                        <li>Drag the application to your Applications folder.</li>
                        <li>Restart the application.</li>
                    </ol>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 actions mt-4">
                <template v-if="status === 'available' || status === 'error'">
                    <n-button v-if="!isMandatory || status === 'error'" @click="handleSkip" quaternary>
                        {{ status === 'error' ? 'Close' : 'Skip This Version' }}
                    </n-button>
                    <n-button v-if="status !== 'error'" type="primary" @click="handleDownload">
                        Download Update
                    </n-button>
                </template>

                <template v-if="status === 'downloading'">
                    <n-button @click="handleCancel" type="error" ghost>
                        Cancel
                    </n-button>
                </template>

                <template v-if="status === 'ready'">
                    <n-button @click="handleSkip" quaternary>
                        Close
                    </n-button>
                    <n-button type="primary" @click="handleInstall">
                        Install Update
                    </n-button>
                </template>
            </div>
        </div>
    </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUpdateStore } from '@/stores/update'
import { storeToRefs } from 'pinia'
import { NModal, NButton, NTag, NProgress } from 'naive-ui'

const store = useUpdateStore()
const { state, progress } = storeToRefs(store)

const status = computed(() => state.value.status)
const updateInfo = computed(() => state.value.updateInfo)
const isMandatory = computed(() => updateInfo.value?.mandatory || false)

const showModal = computed({
    get: () => ['available', 'downloading', 'ready', 'error'].includes(status.value),
    set: (val) => {
        if (!val && !isMandatory.value && status.value !== 'downloading') {
            store.skipVersion()
        }
    }
})

const downloadPercentage = computed(() => {
    if (progress.value.total > 0) {
        return Math.floor((progress.value.current / progress.value.total) * 100)
    }
    return 0
})

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString()
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleSkip() {
    store.skipVersion()
}

function handleDownload() {
    store.startDownload()
}

function handleCancel() {
    store.cancelDownload()
}

function handleInstall() {
    store.installUpdate()
}
</script>

<style scoped>
.release-notes {
    max-height: 300px;
    overflow: auto;
}
</style>

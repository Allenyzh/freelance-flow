<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useBootstrapStore } from "@/stores/bootstrap";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  isReady: boolean;
  isAutoRedirecting: boolean;
}>();

const bootstrapStore = useBootstrapStore();
const { t } = useI18n();

type StageKey = "backend" | "update" | "auth" | "finalize";

type Stage = {
  key: StageKey;
  label: string;
  weight: number;
  done: boolean;
};

const stages = computed<Stage[]>(() => {
  const backendDone = bootstrapStore.backendTimings != null;
  const updateDone = bootstrapStore.frontendMarks.updateInitMs != null;
  const authDone = bootstrapStore.frontendMarks.authInitMs != null;
  const finalizeDone = props.isReady;

  return [
    {
      key: "backend",
      label: t("splash.progress.backendInit"),
      weight: 0.6,
      done: backendDone,
    },
    {
      key: "update",
      label: t("splash.progress.updateCheck"),
      weight: 0.1,
      done: updateDone,
    },
    {
      key: "auth",
      label: t("splash.progress.sessionRestore"),
      weight: 0.25,
      done: authDone,
    },
    {
      key: "finalize",
      label: t("splash.progress.preparingWorkspace"),
      weight: 0.05,
      done: finalizeDone,
    },
  ];
});

const targetProgress = computed(() => {
  const total = stages.value.reduce((acc, s) => acc + (s.done ? s.weight : 0), 0);
  const raw = Math.round(total * 100);
  if (!props.isReady) return Math.min(raw + 8, 95); // gentle lead so UI feels alive
  return 100;
});

const displayProgress = ref(0);
let rafId: number | null = null;

function tick() {
  const delta = targetProgress.value - displayProgress.value;
  if (Math.abs(delta) < 0.5) {
    displayProgress.value = targetProgress.value;
    rafId = null;
    return;
  }
  displayProgress.value += delta * 0.12;
  rafId = requestAnimationFrame(tick);
}

watch(targetProgress, () => {
  if (rafId == null && typeof requestAnimationFrame !== "undefined") {
    rafId = requestAnimationFrame(tick);
  }
});

onMounted(() => {
  if (typeof requestAnimationFrame !== "undefined") {
    rafId = requestAnimationFrame(tick);
  }
});

onUnmounted(() => {
  if (rafId != null && typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(rafId);
  }
});

const currentStageLabel = computed(() => {
  if (props.isAutoRedirecting) return t("splash.welcomeBack");
  if (props.isReady) return t("splash.progress.ready");
  const firstPending = stages.value.find((s) => !s.done);
  return firstPending?.label ?? t("splash.progress.ready");
});
</script>

<template>
  <div class="progress-shell" aria-live="polite">
    <div class="progress-header">
      <span class="progress-label">{{ currentStageLabel }}</span>
      <span class="progress-percent">{{ Math.round(displayProgress) }}%</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${displayProgress}%` }" />
      <div class="progress-glow" :style="{ left: `${displayProgress}%` }" />
    </div>
  </div>
</template>

<style scoped>
.progress-shell {
  width: min(520px, 86vw);
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.progress-label {
  opacity: 0.95;
}

.progress-percent {
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}

.progress-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.35),
    rgba(255, 255, 255, 0.7)
  );
  transition: width 120ms ease-out;
}

.progress-glow {
  position: absolute;
  top: -8px;
  width: 36px;
  height: 26px;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.65) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  pointer-events: none;
  filter: blur(6px);
}
</style>

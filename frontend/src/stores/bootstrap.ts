import { defineStore } from "pinia";
import { ref } from "vue";
// @ts-ignore - Wails runtime
import { EventsOn } from "@/wailsjs/runtime/runtime";

export type BackendBootTimings = {
  processStart: string;
  dbInitMs: number;
  servicesInitMs: number;
  totalBeforeUiMs: number;
};

export type FrontendMarks = {
  appMountedMs?: number;
  splashMountedMs?: number;
  authInitMs?: number;
  updateInitMs?: number;
  totalToReadyMs?: number;
};

export const useBootstrapStore = defineStore("bootstrap", () => {
  const backendTimings = ref<BackendBootTimings | null>(null);
  const frontendMarks = ref<FrontendMarks>({});
  const startTs = ref<number>(typeof performance !== "undefined" ? performance.now() : 0);

  function mark(name: keyof FrontendMarks, valueMs?: number) {
    frontendMarks.value[name] =
      valueMs ?? (typeof performance !== "undefined" ? performance.now() - startTs.value : 0);
  }

  function init() {
    EventsOn("bootstrap:backend-timings", (t: BackendBootTimings) => {
      backendTimings.value = t;
    });
  }

  return {
    backendTimings,
    frontendMarks,
    startTs,
    mark,
    init,
  };
});


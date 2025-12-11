import { defineStore } from "pinia";
import { ref } from "vue";
import type { UpdateState, UpdateStatus } from "@/types/update";
// @ts-ignore - Wails binding will be generated
import {
  CheckForUpdate,
  GetUpdateState,
  SkipVersion,
  StartDownload,
  CancelDownload,
  InstallUpdate,
} from "@/wailsjs/go/services/UpdateService";
// @ts-ignore - Wails runtime
import { EventsOn } from "@/wailsjs/runtime/runtime";

export const useUpdateStore = defineStore("update", () => {
  const state = ref<UpdateState>({
    status: "none",
    currentVersion: "",
  });

  const isChecking = ref(false);
  const progress = ref<{ total: number; current: number }>({
    total: 0,
    current: 0,
  });

  // Listen for backend events
  const init = () => {
    EventsOn("update:state", (newState: any) => {
      console.log("Update state received:", newState);
      state.value = {
        ...newState,
        status: newState.status as UpdateStatus,
      };
    });

    EventsOn("update:progress", (p: { total: number; current: number }) => {
      progress.value = p;
      if (p.total > 0) {
        state.value.downloadProgress = (p.current / p.total) * 100;
      }
    });

    // Initial fetch
    GetUpdateState()
      .then((s: any) => {
        state.value = {
          ...s,
          status: s.status as UpdateStatus,
        };
      })
      .catch((err: unknown) =>
        console.error("Failed to get update state:", err)
      );
  };

  async function checkForUpdate() {
    if (isChecking.value) return;
    isChecking.value = true;
    try {
      await CheckForUpdate();
      const newState = await GetUpdateState();
      state.value = {
        ...newState,
        status: newState.status as UpdateStatus,
      };
    } catch (e) {
      console.error("Failed to check for updates:", e);
      state.value.status = "error";
      state.value.error = String(e);
    } finally {
      isChecking.value = false;
    }
  }

  async function skipVersion() {
    try {
      await SkipVersion();
      const newState = await GetUpdateState();
      state.value = {
        ...newState,
        status: newState.status as UpdateStatus,
      };
    } catch (e) {
      console.error("Failed to skip version:", e);
    }
  }

  async function startDownload() {
    try {
      await StartDownload();
    } catch (e) {
      console.error("Failed to start download:", e);
    }
  }

  async function cancelDownload() {
    try {
      await CancelDownload();
    } catch (e) {
      console.error("Failed to cancel download:", e);
    }
  }

  async function installUpdate() {
    try {
      await InstallUpdate();
    } catch (e) {
      console.error("Failed to install update:", e);
    }
  }

  return {
    state,
    isChecking,
    progress,
    init,
    checkForUpdate,
    skipVersion,
    startDownload,
    cancelDownload,
    installUpdate,
  };
});

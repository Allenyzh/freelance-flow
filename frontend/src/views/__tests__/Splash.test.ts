import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Splash from "@/views/Splash.vue";
import { mountView } from "@/test-utils/mount";

const mockAuthStore = {
  initialize: vi.fn(),
  isAuthenticated: false,
  usersList: [],
};

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("vue-router", () => ({
  useRouter: () => mockRouter,
}));

// Mock setInterval and clearInterval
global.setInterval = vi.fn((fn) => {
  const interval = { id: 1, fn };
  return interval as any;
});

global.clearInterval = vi.fn();

describe("Splash view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.initialize = vi.fn().mockResolvedValue(undefined);
    mockAuthStore.isAuthenticated = false;
    mockAuthStore.usersList = [];
    localStorage.removeItem("lastAuthedRoute");
  });

  it("initializes auth store on mount", async () => {
    mountView(Splash, { global: { stubs: ["router-link"] } });

    await flushPromises();

    expect(mockAuthStore.initialize).toHaveBeenCalledTimes(1);
  });

  it("redirects to dashboard if user is authenticated", async () => {
    vi.useFakeTimers();
    mockAuthStore.isAuthenticated = true;

    try {
      mountView(Splash, {
        global: { stubs: ["router-link"] },
      });

      await flushPromises();
      vi.advanceTimersByTime(600);
      await flushPromises();

      expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows start button when backend is ready", async () => {
    const wrapper = mountView(Splash, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    // Initially button might be disabled, wait for backend ready
    await new Promise(resolve => setTimeout(resolve, 100));

    const startButton = wrapper.find("button");
    expect(startButton.text()).toContain("splash.start");
  });

  it("navigates to login when users exist and start button clicked", async () => {
    mockAuthStore.usersList = [
      { id: 1, username: "user1", avatarUrl: "", settings: {} },
    ];

    const wrapper = mountView(Splash, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    const startButton = wrapper.find("button");
    await startButton.trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("navigates to register when no users exist and start button clicked", async () => {
    mockAuthStore.usersList = [];

    const wrapper = mountView(Splash, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    const startButton = wrapper.find("button");
    await startButton.trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith("/register");
  });

  it("shows loading state when backend is not ready", async () => {
    // Mock backend not ready by not resolving initialize
    let resolveInitialize: (value?: any) => void;
    mockAuthStore.initialize = vi.fn(() => {
      return new Promise(resolve => {
        resolveInitialize = resolve;
      });
    });

    const wrapper2 = mountView(Splash, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    expect(wrapper2.find("button").exists()).toBe(false);
    expect(wrapper2.text()).toContain("splash.progress.backendInit");

    // Resolve to simulate backend ready
    resolveInitialize!();
    await flushPromises();
    expect(wrapper2.find("button").exists()).toBe(true);
  });

  it("clears intervals on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const wrapper = mountView(Splash, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    wrapper.unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Login from "@/views/Login.vue";
import { mountView } from "@/test-utils/mount";

const mockAuthStore = {
  usersList: [
    { id: 1, username: "user1", avatarUrl: "", settings: {} },
    { id: 2, username: "user2", avatarUrl: "", settings: {} },
  ],
  login: vi.fn<[{ username: string; password: string }], Promise<void>>(),
};

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  currentRoute: { value: { path: "/login" } },
};

vi.mock("vue-router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("Login view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.usersList = [
      { id: 1, username: "user1", avatarUrl: "", settings: {} },
      { id: 2, username: "user2", avatarUrl: "", settings: {} },
    ];
  });

  it("renders user selection grid when users exist", async () => {
    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("auth.welcome");
    expect(wrapper.text()).toContain("auth.selectUser");
    expect(wrapper.text()).toContain("user1");
    expect(wrapper.text()).toContain("user2");
  });

  it("redirects to register if no users exist", async () => {
    mockAuthStore.usersList = [];

    mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    expect(mockRouter.replace).toHaveBeenCalledWith("/register");
  });

  it("selects a user and shows password input", async () => {
    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    const userCard = wrapper.find(".user-card");
    await userCard.trigger("click");

    await flushPromises();

    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("auth.login");
  });

  it("cancels user selection", async () => {
    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    // Select a user
    const userCard = wrapper.find(".user-card");
    await userCard.trigger("click");

    await flushPromises();

    const buttons = wrapper.findAll("button");
    const cancelButton = buttons.find((b) => b.text().includes("common.cancel"));
    await cancelButton?.trigger("click");

    await flushPromises();

    // Should return to user selection
    expect(wrapper.text()).toContain("auth.selectUser");
    expect(wrapper.find('input[type="password"]').exists()).toBe(false);
  });

  it("logs in successfully with correct password", async () => {
    mockAuthStore.login.mockResolvedValueOnce(undefined);

    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    // Select user
    const userCard = wrapper.find(".user-card");
    await userCard.trigger("click");

    await flushPromises();

    // Enter password
    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue("correctpassword");

    const buttons = wrapper.findAll("button");
    const loginButton = buttons.find((b) => b.text().includes("auth.login"));
    await loginButton?.trigger("click");

    await flushPromises();

    expect(mockAuthStore.login).toHaveBeenCalledWith({
      username: "user1",
      password: "correctpassword",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows error on incorrect password", async () => {
    mockAuthStore.login.mockRejectedValueOnce(new Error("Invalid password"));

    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    // Select user
    const userCard = wrapper.find(".user-card");
    await userCard.trigger("click");

    await flushPromises();

    // Enter wrong password
    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue("wrongpassword");

    const buttons = wrapper.findAll("button");
    const loginButton = buttons.find((b) => b.text().includes("auth.login"));
    await loginButton?.trigger("click");

    await flushPromises();

    expect(mockAuthStore.login).toHaveBeenCalled();
    expect(wrapper.text()).toContain("auth.invalidPassword");
  });

  it("goes to register page", async () => {
    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    const addUserCard = wrapper.find(".user-card.add-user");
    await addUserCard.trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith("/register");
  });

  it("disables login button when password is empty", async () => {
    const wrapper = mountView(Login, {
      global: { stubs: ["router-link"] },
    });

    await flushPromises();

    // Select user
    const userCard = wrapper.find(".user-card");
    await userCard.trigger("click");

    await flushPromises();

    const buttons = wrapper.findAll("button");
    const loginButton = buttons.find((b) => b.text().includes("auth.login"));
    expect(loginButton?.attributes("disabled")).toBeDefined();

    // Enter password
    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue("password");

    await flushPromises();

    // Button should be enabled now
    expect(loginButton?.attributes("disabled")).toBeUndefined();
  });
});

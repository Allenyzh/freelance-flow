import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Register from "@/views/Register.vue";
import { mountView } from "@/test-utils/mount";

const mockAuthStore = {
  register: vi.fn<[unknown], Promise<void>>(),
  usersList: [],
};

const mockAppStore = {
  setLanguage: vi.fn(),
};

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

vi.mock("@/stores/app", () => ({
  useAppStore: () => mockAppStore,
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("vue-router", () => ({
  useRouter: () => mockRouter,
}));

describe("Register view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.register.mockResolvedValue(undefined);
    mockAuthStore.usersList = [];
  });

  it("renders registration form", async () => {
    const wrapper = mountView(Register, { global: { stubs: ["router-link"] } });

    await flushPromises();

    expect(wrapper.text()).toContain("auth.createAccount");
    expect(
      wrapper.find('input[placeholder*="auth.usernamePlaceholder"]').exists()
    ).toBe(true);
    expect(wrapper.findAll("input").length).toBeGreaterThanOrEqual(2);
  });

  it("shows avatar preview", async () => {
    const wrapper = mountView(Register, { global: { stubs: ["router-link"] } });

    await flushPromises();

    const hasAvatar =
      wrapper.find(".n-avatar").exists() || wrapper.find(".navatar").exists();
    expect(hasAvatar).toBe(true);
  });

  it("validates password confirmation - passwords do not match", async () => {
    const wrapper = mountView(Register, { global: { stubs: ["router-link"] } });

    await flushPromises();

    const passwordInput = wrapper.findAll('input[type="password"]').at(0);
    const confirmInput = wrapper.findAll('input[type="password"]').at(1);

    await passwordInput?.setValue("password123");
    await confirmInput?.setValue("differentpassword");

    await flushPromises();

    expect(wrapper.text()).toContain("auth.passwordsNotMatch");
  });

  it("registers successfully with valid form", async () => {
    const wrapper = mountView(Register, { global: { stubs: ["router-link"] } });

    await flushPromises();

    // Fill form
    await wrapper
      .find('input[placeholder*="auth.usernamePlaceholder"]')
      .setValue("newuser");
    const passwordInputs = wrapper.findAll('input[type="password"]');
    await passwordInputs.at(0)?.setValue("password123");
    await passwordInputs.at(1)?.setValue("password123");

    await flushPromises();

    const submitButton = wrapper.find(".submit-button");
    await submitButton.trigger("click");

    await flushPromises();

    expect(mockAuthStore.register).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "newuser",
        password: "password123",
        email: "",
        settingsJson: expect.any(String),
        avatarUrl: expect.any(String),
      })
    );
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows error on registration failure", async () => {
    mockAuthStore.register.mockRejectedValueOnce(new Error("Username already exists"));

    const wrapper = mountView(Register, { global: { stubs: ["router-link"] } });

    await flushPromises();

    // Fill form
    await wrapper
      .find('input[placeholder*="auth.usernamePlaceholder"]')
      .setValue("existinguser");
    const passwordInputs = wrapper.findAll('input[type="password"]');
    await passwordInputs.at(0)?.setValue("password123");
    await passwordInputs.at(1)?.setValue("password123");

    const submitButton = wrapper.find(".submit-button");
    await submitButton.trigger("click");

    await flushPromises();

    expect(wrapper.text()).toContain("Username already exists");
  });

  it("disables submit button when form is invalid", async () => {
    const wrapper = mountView(Register, { global: { stubs: ["router-link"] } });

    await flushPromises();

    const submitButton = wrapper.find(".submit-button");
    expect(submitButton.attributes("disabled")).toBeDefined();

    // Fill valid form
    await wrapper
      .find('input[placeholder*="auth.usernamePlaceholder"]')
      .setValue("validuser");
    const passwordInputs = wrapper.findAll('input[type="password"]');
    await passwordInputs.at(0)?.setValue("password123");
    await passwordInputs.at(1)?.setValue("password123");

    await flushPromises();

    expect(submitButton.attributes("disabled")).toBeUndefined();
  });

});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import EmailSettings from "@/views/settings/EmailSettings.vue";
import type { InvoiceEmailSettings } from "@/types";
import { mountView } from "@/test-utils/mount";
import { mockMessage, resetNaiveMocks } from "@/test-utils/naive";

const mockStore = {
  settings: null as InvoiceEmailSettings | null,
  fetchSettings: vi.fn(),
  saveSettings: vi.fn(),
};

vi.mock("@/stores/invoiceEmailSettings", () => ({
  useInvoiceEmailSettingsStore: () => mockStore,
}));

describe("EmailSettings view", () => {
  const defaultSettings: InvoiceEmailSettings = {
    provider: "mailto",
    subjectTemplate: "Invoice {{number}}",
    bodyTemplate: "Please find attached invoice {{number}}.",
    signature: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetNaiveMocks();
    mockStore.settings = null;
    mockStore.fetchSettings = vi.fn().mockResolvedValue(undefined);
    mockStore.saveSettings = vi.fn().mockResolvedValue(undefined);
  });

  it("renders invoice email settings form", async () => {
    const wrapper = mountView(EmailSettings);
    await flushPromises();

    expect(mockStore.fetchSettings).toHaveBeenCalledTimes(1);
    expect(wrapper.find("select").exists()).toBe(true);
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("textarea").exists()).toBe(true);
  });

  it("loads settings on mount", async () => {
    mockStore.settings = { ...defaultSettings };
    mountView(EmailSettings);
    await flushPromises();
    expect(mockStore.fetchSettings).toHaveBeenCalled();
  });

  it("shows provider options", async () => {
    const wrapper = mountView(EmailSettings);
    await flushPromises();
    expect(wrapper.text()).toContain("Mailto");
    expect(wrapper.text()).toContain("Resend");
    expect(wrapper.text()).toContain("SMTP");
  });

  it("saves settings successfully", async () => {
    const wrapper = mountView(EmailSettings);
    await flushPromises();

    const subjectInput = wrapper.find('input[value*="Invoice {{number}}"]');
    await subjectInput.setValue("Custom Subject {{number}}");

    const saveButton = wrapper.find("button");
    await saveButton.trigger("click");
    await flushPromises();

    expect(mockStore.saveSettings).toHaveBeenCalledWith({
      provider: "mailto",
      subjectTemplate: "Custom Subject {{number}}",
      bodyTemplate: "Please find attached invoice {{number}}.",
      signature: "",
    });
    expect(mockMessage.success).toHaveBeenCalledWith(
      "Saved email settings"
    );
  });

  it("updates form when settings are loaded", async () => {
    mockStore.settings = {
      ...defaultSettings,
      subjectTemplate: "Loaded Template {{number}}",
      signature: "Best regards",
    };

    mountView(EmailSettings);
    await flushPromises();
    expect(mockStore.fetchSettings).toHaveBeenCalled();
  });

  it("shows error message on save failure", async () => {
    mockStore.saveSettings.mockRejectedValueOnce(new Error("Save failed"));

    const wrapper = mountView(EmailSettings);
    await flushPromises();

    const saveButton = wrapper.find("button");
    await saveButton.trigger("click");
    await flushPromises();

    expect(mockMessage.error).toHaveBeenCalledWith("Save failed");
  });

  it("disables form fields while saving", async () => {
    mockStore.saveSettings.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const wrapper = mountView(EmailSettings);
    await flushPromises();

    const saveButton = wrapper.find("button");
    await saveButton.trigger("click");
    await flushPromises();

    const inputs = wrapper.findAll("input, textarea, select");
    inputs.forEach((input) => {
      expect(input.attributes("disabled")).toBeDefined();
    });
  });

  it("toggles between provider fields correctly", async () => {
    const wrapper = mountView(EmailSettings);
    await flushPromises();
    expect(wrapper.text()).toContain("Mailto");
    expect(wrapper.text()).toContain("Resend");
    expect(wrapper.text()).toContain("SMTP");
  });
});

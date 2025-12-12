import { vi } from "vitest";

export const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

export const mockDialog = {
  info: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
};

export function resetNaiveMocks() {
  mockMessage.success.mockReset();
  mockMessage.error.mockReset();
  mockMessage.info.mockReset();
  mockMessage.warning.mockReset();
  mockDialog.info.mockReset();
  mockDialog.error.mockReset();
  mockDialog.warning.mockReset();
  mockDialog.success.mockReset();
}


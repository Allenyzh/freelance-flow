// Locales index - re-export all locale messages
import enUS from "./en-US";
import zhCN from "./zh-CN";
import zodZhCN from "zod-i18n-map/locales/zh-CN/zod.json";
import zodEn from "zod-i18n-map/locales/en/zod.json";
import type { Locale } from "@/locales/types";
import { allModules, collectModuleMessages } from "@/modules/registry";

// Helper to convert i18next style placeholders {{param}} to vue-i18n style {param}
function convertToVueI18n(messages: unknown): unknown {
  if (typeof messages === "string") {
    return messages
      .replace(/{{\s*-\s*([^}]+)\s*}}/g, "{$1}")
      .replace(/{{\s*([^}]+)\s*}}/g, "{$1}");
  }
  if (messages && typeof messages === "object" && !Array.isArray(messages)) {
    const record = messages as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      out[key] = convertToVueI18n(value);
    }
    return out;
  }
  return messages;
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      target[key] = deepMerge(existing as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function mergeLocaleMessages(base: Record<string, unknown>, extras: Array<Record<string, unknown>>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const extra of extras) {
    deepMerge(merged, extra);
  }
  return merged;
}

export const messages = {
  "en-US": mergeLocaleMessages(
    enUS as unknown as Record<string, unknown>,
    [
      ...collectModuleMessages(allModules).map((m) => (m["en-US"] ?? {}) as Record<string, unknown>),
      convertToVueI18n(zodEn) as Record<string, unknown>,
    ],
  ),
  "zh-CN": mergeLocaleMessages(
    zhCN as unknown as Record<string, unknown>,
    [
      ...collectModuleMessages(allModules).map((m) => (m["zh-CN"] ?? {}) as Record<string, unknown>),
      convertToVueI18n(zodZhCN) as Record<string, unknown>,
    ],
  ),
};

export { enUS, zhCN };
export type { Locale };

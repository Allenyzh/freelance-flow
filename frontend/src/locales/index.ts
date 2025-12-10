// Locales index - re-export all locale messages
import enUS from "./en-US";
import zhCN from "./zh-CN";

export const messages = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

export type Locale = "en-US" | "zh-CN";

export { enUS, zhCN };

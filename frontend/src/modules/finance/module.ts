import type { AppModule } from "@/modules/types";
import { financeMessages } from "@/modules/finance/i18n";
import { WalletOutlined } from "@vicons/antd";

export const financeModule: AppModule = {
  id: "finance",
  enabledByDefault: false,
  toggleable: true,
  nav: {
    labelKey: "nav.finance",
    key: "finance",
    icon: WalletOutlined,
    children: [
      { labelKey: "finance.nav.overview", key: "finance/overview", moduleID: "finance" },
      { labelKey: "finance.nav.accounts", key: "finance/accounts", moduleID: "finance" },
      { labelKey: "finance.nav.transactions", key: "finance/transactions", moduleID: "finance" },
      { labelKey: "finance.nav.import", key: "finance/import", moduleID: "finance" },
      { labelKey: "finance.nav.categories", key: "finance/categories", moduleID: "finance" },
      { labelKey: "finance.nav.reports", key: "finance/reports", moduleID: "finance" },
    ],
  },
  routes: [
    {
      path: "/finance",
      component: () => import("@/views/finance/FinanceLayout.vue"),
      meta: { requiresAuth: true, layout: "main", moduleID: "finance" },
      children: [
        { path: "", redirect: "/finance/overview" },
        { path: "overview", component: () => import("@/views/finance/index.vue") },
        { path: "accounts", component: () => import("@/views/finance/accounts/index.vue") },
        {
          path: "transactions",
          component: () => import("@/views/finance/transactions/index.vue"),
        },
        { path: "import", component: () => import("@/views/finance/import/index.vue") },
        {
          path: "categories",
          component: () => import("@/views/finance/categories/index.vue"),
        },
        { path: "reports", component: () => import("@/views/finance/reports/index.vue") },
      ],
    },
  ],
  settingsPages: [
    {
      key: "finance",
      labelKey: "settings.finance.title",
      component: () => import("@/views/settings/FinanceSettings.vue"),
      order: 50,
      moduleID: "finance",
    },
  ],
  messages: financeMessages,
};

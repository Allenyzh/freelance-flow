import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Auth views (no lazy loading for faster initial load)
import Splash from "@/views/Splash.vue";

const routes = [
  // Auth routes (no auth required)
  {
    path: "/",
    redirect: "/splash",
  },
  {
    path: "/splash",
    component: Splash,
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/login",
    component: () => import("@/views/Login.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/register",
    component: () => import("@/views/Register.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },

  // Main app routes (auth required)
  {
    path: "/dashboard",
    component: () => import("@/views/Dashboard.vue"),
    meta: { requiresAuth: true, layout: "main" },
  },
  {
    path: "/clients",
    component: () => import("@/views/Clients.vue"),
    meta: { requiresAuth: true, layout: "main" },
  },
  {
    path: "/projects",
    component: () => import("@/views/Projects.vue"),
    meta: { requiresAuth: true, layout: "main" },
  },
  {
    path: "/timesheet",
    component: () => import("@/views/Timesheet.vue"),
    meta: { requiresAuth: true, layout: "main" },
  },
  {
    path: "/invoices",
    component: () => import("@/views/Invoices.vue"),
    meta: { requiresAuth: true, layout: "main" },
  },
  {
    path: "/reports",
    component: () => import("@/views/Reports.vue"),
    meta: { requiresAuth: true, layout: "main" },
  },
  {
    path: "/finance",
    component: () => import("@/views/finance/FinanceLayout.vue"),
    meta: { requiresAuth: true, layout: "main" },
    children: [
      {
        path: "",
        redirect: "/finance/overview",
      },
      {
        path: "overview",
        component: () => import("@/views/finance/index.vue"),
      },
      {
        path: "accounts",
        component: () => import("@/views/finance/accounts/index.vue"),
      },
      {
        path: "transactions",
        component: () => import("@/views/finance/transactions/index.vue"),
      },
      {
        path: "import",
        component: () => import("@/views/finance/import/index.vue"),
      },
      {
        path: "categories",
        component: () => import("@/views/finance/categories/index.vue"),
      },
      {
        path: "reports",
        component: () => import("@/views/finance/reports/index.vue"),
      },
    ],
  },
  {
    path: "/settings",
    component: () => import("@/views/settings/SettingsLayout.vue"),
    meta: { requiresAuth: true, layout: "main" },
    children: [
      {
        path: "",
        redirect: "/settings/general",
      },
      {
        path: "general",
        component: () => import("@/views/settings/GeneralSettings.vue"),
      },
      {
        path: "profile",
        component: () => import("@/views/settings/ProfileSettings.vue"),
      },
      {
        path: "invoice",
        component: () => import("@/views/settings/InvoiceSettings.vue"),
      },
      {
        path: "email",
        component: () => import("@/views/settings/EmailSettings.vue"),
      },
      {
        path: "finance",
        component: () => import("@/views/settings/FinanceSettings.vue"),
      },
    ],
  },
];

const router = createRouter({
  // Use Hash history for Wails/Desktop compatibility
  history: createWebHashHistory(),
  routes,
});

// Persist last authenticated route for session restore.
router.afterEach((to) => {
  if (to.meta.requiresAuth) {
    localStorage.setItem("lastAuthedRoute", to.fullPath);
  }
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to splash if not initialized, otherwise to login
    if (!authStore.isInitialized) {
      next("/splash");
    } else if (authStore.usersList.length > 0) {
      next("/login");
    } else {
      next("/register");
    }
  }
  // If authenticated user tries to access auth pages, redirect to dashboard
  else if (
    !to.meta.requiresAuth &&
    authStore.isAuthenticated &&
    to.path !== "/splash"
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;

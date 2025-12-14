import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import type { Locale } from "@/locales/types";

export type ModuleID =
  | "dashboard"
  | "clients"
  | "projects"
  | "timesheet"
  | "invoices"
  | "reports"
  | "finance"
  | "settings";

export type ModuleMessages = Partial<Record<Locale, Record<string, unknown>>>;

export type ModuleNavItem = {
  key: string;
  labelKey: string;
  icon?: Component;
  moduleID?: ModuleID;
  children?: ModuleNavItem[];
};

export type ModuleSettingsPage = {
  key: string;
  labelKey: string;
  component: RouteRecordRaw["component"];
  order: number;
  moduleID: ModuleID;
};

export type AppModule = {
  id: ModuleID;
  enabledByDefault: boolean;
  toggleable: boolean;
  nav?: ModuleNavItem;
  routes: RouteRecordRaw[];
  settingsPages?: ModuleSettingsPage[];
  messages?: ModuleMessages;
};

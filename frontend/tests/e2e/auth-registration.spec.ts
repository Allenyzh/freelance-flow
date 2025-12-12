import { test, expect } from "@playwright/test";
import {
  baseURL,
  isDevServerReachable,
  hasWailsRuntime,
} from "./helpers";

let reachable = false;

test.beforeAll(async ({ request }) => {
  reachable = await isDevServerReachable(request);
});

test("T1: Splash → Register → Dashboard complete registration flow", async ({
  page,
}) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available for auth");

  // Step 1: Navigate to Splash screen
  await page.goto(`${baseURL}/#/`);

  // Verify splash screen elements
  await expect(page.locator(".splash-container")).toBeVisible();
  await expect(page.getByText("FreelanceFlow")).toBeVisible();
  await expect(page.getByRole("button", { name: /start/i })).toBeVisible();

  // Wait for backend to be ready
  await expect(page.getByRole("button", { name: /start/i })).toBeEnabled();

  // Step 2: Click start button to go to registration
  await page.getByRole("button", { name: /start/i }).click();

  // Should redirect to register page (no users exist)
  await expect(page).toHaveURL(/#\/register/);
  await expect(page.getByText(/register|注册/i)).toBeVisible();

  // Step 3: Fill registration form
  const username = `e2e_reg_${Date.now()}`;
  const password = "pass1234";
  const currency = "EUR";
  const timezone = "Europe/London";

  // Fill username
  await page.getByPlaceholder(/username|用户名/i).fill(username);

  // Fill password
  await page.getByPlaceholder(/password(?!.*confirm)|密码/i).first().fill(password);

  // Confirm password
  await page.getByPlaceholder(/confirm|确认/i).fill(password);

  // Set currency preference
  const prefSelects = page.locator(".preferences-section .n-select");
  await prefSelects.nth(1).click();
  await page.getByText(new RegExp(currency, "i")).click();

  // Set timezone preference
  await prefSelects.nth(2).click();
  await page.getByText(timezone).click();

  // Step 4: Submit registration
  await page.getByRole("button", { name: /create|注册|profile/i }).click();

  // Step 5: Verify redirect to dashboard
  await expect(page).toHaveURL(/#\/dashboard/);

  // Step 6: Verify dashboard loads with user content
  await expect(page.locator("main, .main-layout, .page-container")).toBeVisible();
  await expect(page.getByText(/dashboard|总览/i)).toBeVisible();

  // Step 7: Verify settings_json persisted (check that currency/timezone are set)
  await page.goto(`${baseURL}/#/settings`);

  const currencyField = page.locator(".user-settings").getByText("Currency");
  await expect(currencyField).toBeVisible();
  await expect(page.locator(".user-settings")).toContainText(currency);

  const timezoneField = page.locator(".user-settings").getByText("Timezone");
  await expect(timezoneField).toBeVisible();
  await expect(page.locator(".user-settings")).toContainText(timezone);

  // Step 8: Verify user can navigate to other sections
  await page.goto(`${baseURL}/#/clients`);
  await expect(page.getByText(/clients|客户/i)).toBeVisible();

  await page.goto(`${baseURL}/#/dashboard`);
  await expect(page.locator("main, .main-layout, .page-container")).toBeVisible();
});

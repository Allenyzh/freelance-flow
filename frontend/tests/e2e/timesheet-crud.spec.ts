import { test, expect } from "@playwright/test";
import {
  baseURL,
  isDevServerReachable,
  hasWailsRuntime,
  registerUserAndGoDashboard,
} from "./helpers";

let reachable = false;

test.beforeAll(async ({ request }) => {
  reachable = await isDevServerReachable(request);
});

test("T4: Timesheet complete CRUD flow with timer", async ({ page }) => {
  test.skip(!reachable, "dev server not running at baseURL");

  const wails = await hasWailsRuntime(page);
  test.skip(!wails, "Wails runtime not available");

  // Setup: Register user and create a project
  await registerUserAndGoDashboard(page);
  await page.goto(`${baseURL}/#/projects`);

  // Create a test project
  await page.getByRole("button", { name: /add|新建|create/i }).click();
  await page.getByPlaceholder(/name|名称/i).fill("Test Project");
  await page.getByPlaceholder(/rate|费率/i).fill("50");
  await page.getByRole("button", { name: /save|保存/i }).click();
  await expect(page.locator(".n-message__content")).toContainText(/saved|创建/i);

  // Navigate to timesheet
  await page.goto(`${baseURL}/#/timesheet`);
  await expect(page.getByText(/timesheet|时间追踪/i)).toBeVisible();

  // Step 1: Start timer with project
  const projectSelect = page.locator(".timer-bar").locator(".n-select");
  await projectSelect.click();
  await page.getByText("Test Project").click();

  const descriptionInput = page.locator(".timer-bar").getByPlaceholder(/description|task|任务/i);
  await descriptionInput.fill("Test timer task");

  // Start timer
  const startButton = page.locator(".timer-bar").getByRole("button", { name: /start|play/i }).first();
  await startButton.click();

  // Verify timer is running (should see pause button)
  await expect(page.locator(".timer-bar").getByRole("button", { name: /pause|stop/i })).toBeVisible();

  // Wait for timer to run for at least 3 seconds
  await page.waitForTimeout(3000);

  // Step 2: Stop timer and verify entry is created
  const stopButton = page.locator(".timer-bar").getByRole("button", { name: /pause|stop/i }).first();
  await stopButton.click();

  // Wait for entry to appear in table
  await expect(page.locator(".n-message__content")).toContainText(/logged|saved/i);

  // Verify entry appears in the table
  await expect(page.locator("table")).toContainText("Test timer task");
  await expect(page.locator("table")).toContainText("Test Project");

  // Get the entry row for later actions
  const entryRow = page.locator("table tbody tr").filter({ hasText: "Test timer task" }).first();

  // Step 3: Edit the entry
  await entryRow.locator('button[title*="edit" i]').click();

  // Fill edit form
  const editDescription = page.locator(".n-modal").getByPlaceholder(/description|task|任务/i);
  await editDescription.fill("Updated test task");
  const editDuration = page.locator(".n-modal").getByPlaceholder(/duration|hours|小时/i);
  await editDuration.clear();
  await editDuration.fill("1.5");

  await page.getByRole("button", { name: /save|更新/i }).click();
  await expect(page.locator(".n-message__content")).toContainText(/updated|saved/i);

  // Verify entry is updated
  await expect(page.locator("table")).toContainText("Updated test task");

  // Step 4: Test Continue Timer feature
  // Create another entry first
  const quickEntrySection = page.locator(".quick-entry");
  await quickEntrySection.locator(".n-select").click();
  await page.getByText("Test Project").click();
  await quickEntrySection.getByPlaceholder(/description|task|任务/i).fill("Quick entry task");
  await quickEntrySection.getByPlaceholder(/duration|hours|小时/i).fill("2");
  await quickEntrySection.getByRole("button", { name: /add|log/i }).click();

  // Wait for entry
  await expect(page.locator("table")).toContainText("Quick entry task");

  // Find the quick entry row and click continue timer
  const quickEntryRow = page.locator("table tbody tr").filter({ hasText: "Quick entry task" }).first();
  await quickEntryRow.locator('button[title*="continue" i]').click();

  // Verify timer continues with that project
  const runningProjectSelect = page.locator(".timer-bar").locator(".n-select");
  const selectedProject = await runningProjectSelect.locator(".n-base-select-option--selected").textContent();
  await expect(selectedProject).toContainText("Test Project");

  // Stop the continued timer
  await page.locator(".timer-bar").getByRole("button", { name: /pause|stop/i }).first().click();

  // Step 5: Delete an entry
  const entryToDelete = page.locator("table tbody tr").filter({ hasText: "Updated test task" }).first();
  await entryToDelete.locator('button[title*="delete" i]').click();

  // Confirm deletion
  await page.getByRole("button", { name: /confirm|是|确定/i }).click();
  await expect(page.locator(".n-message__content")).toContainText(/deleted/i);

  // Verify entry is deleted
  await expect(page.locator("table")).not.toContainText("Updated test task");

  // Step 6: Test CSV export
  const exportButton = page.getByRole("button", { name: /export.*csv/i });
  await expect(exportButton).toBeVisible();

  // Note: CSV download cannot be fully tested in headless mode,
  // but we can verify the button is clickable
  await exportButton.click();

  // Should show success message
  await expect(page.locator(".n-message__content")).toContainText(/export/i);

  // Step 7: Verify entries persist after reload
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("table")).toBeVisible();

  // At least one entry should still be there
  const rowCount = await page.locator("table tbody tr").count();
  expect(rowCount).toBeGreaterThan(0);
});

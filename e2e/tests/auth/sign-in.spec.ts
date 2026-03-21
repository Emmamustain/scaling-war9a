import { test, expect } from "@playwright/test";
import { TEST_CUSTOMER } from "../../fixtures/test-data";

const SIGN_IN_URL = "/sign-in";

test.describe("Sign In", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SIGN_IN_URL, { waitUntil: "domcontentloaded" });
  });

  test("displays sign-in form with Email, Password fields", async ({
    page,
  }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("shows 'Welcome back' heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });

  test("navigates to sign-up via 'Don't have an account?' link", async ({
    page,
  }) => {
    const link = page
      .getByRole("link", { name: /don.*t have an account/i })
      .or(page.getByText(/don.*t have an account/i).locator("a"));
    await link.click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test("has 'Forgot password?' link pointing to /forgot-password", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: /forgot password/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /forgot-password/);
  });

  test("successfully signs in and redirects to /discover", async ({
    page,
  }) => {
    await page.getByLabel(/email/i).fill(TEST_CUSTOMER.email);
    await page.getByLabel(/password/i).fill(TEST_CUSTOMER.password);
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(/discover/, { timeout: 15_000 });
  });

  test("shows toast 'Welcome back!'", async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_CUSTOMER.email);
    await page.getByLabel(/password/i).fill(TEST_CUSTOMER.password);
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /welcome back/i });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("shows error toast for invalid credentials", async ({ page }) => {
    await page.getByLabel(/email/i).fill("nonexistent@test.war9a.com");
    await page.getByLabel(/password/i).fill("WrongPassword123!");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /invalid|incorrect|wrong|error/i });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("disables submit button and shows spinner while pending", async ({
    page,
  }) => {
    await page.getByLabel(/email/i).fill(TEST_CUSTOMER.email);
    await page.getByLabel(/password/i).fill(TEST_CUSTOMER.password);

    const submitBtn = page.getByRole("button", { name: /sign in|log in/i });
    await submitBtn.click();

    // The button should be disabled or show a spinner briefly
    await expect(
      submitBtn.and(page.locator("[disabled]")).first(),
    ).toBeVisible({ timeout: 3_000 });
  });

  test("persists session across page refresh", async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_CUSTOMER.email);
    await page.getByLabel(/password/i).fill(TEST_CUSTOMER.password);
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(/discover/, { timeout: 15_000 });

    // Reload and verify still authenticated
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/discover/);
    // Should not be redirected to sign-in
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test.fixme(
    "shows error for banned user account",
    // Expected: a specific error toast like "Your account has been suspended"
    async ({ page }) => {},
  );

  test.fixme(
    "rate limits after multiple failed attempts",
    // Expected: after N failed login attempts, show "Too many attempts" or similar
    async ({ page }) => {},
  );

  test.fixme(
    "redirects to original page after sign-in (return URL)",
    // Expected: navigating to a protected page while logged out should redirect to sign-in,
    // then after successful sign-in redirect back to the originally requested page
    async ({ page }) => {},
  );
});

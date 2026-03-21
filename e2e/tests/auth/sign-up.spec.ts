import { test, expect } from "@playwright/test";
import { TEST_CUSTOMER } from "../../fixtures/test-data";

const SIGN_UP_URL = "/sign-up";

test.describe("Sign Up", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SIGN_UP_URL, { waitUntil: "domcontentloaded" });
  });

  test("displays sign-up form with Full Name, Email, Password fields", async ({
    page,
  }) => {
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("shows War9a logo and 'Create an account' heading", async ({
    page,
  }) => {
    await expect(page.getByRole("img", { name: /war9a/i }).or(page.locator("a[href='/'] svg, a[href='/'] img"))).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /create an account/i }),
    ).toBeVisible();
  });

  test("navigates to sign-in via 'Already have an account?' link", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: /already have an account/i }).or(
      page.getByText(/already have an account/i).locator("a"),
    );
    await link.click();
    await expect(page).toHaveURL(/sign-in/);
  });

  test("successfully creates account and redirects to /discover", async ({
    page,
  }) => {
    const uniqueEmail = `e2e-signup-${Date.now()}@test.war9a.com`;

    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByRole("button", { name: /sign up|create|register/i }).click();

    await expect(page).toHaveURL(/discover/, { timeout: 15_000 });
  });

  test("shows toast 'Account created! Welcome to War9a!'", async ({
    page,
  }) => {
    const uniqueEmail = `e2e-signup-toast-${Date.now()}@test.war9a.com`;

    await page.getByLabel(/full name/i).fill("Toast Test User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByRole("button", { name: /sign up|create|register/i }).click();

    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /account created/i });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("shows error toast for duplicate email", async ({ page }) => {
    await page.getByLabel(/full name/i).fill("Duplicate User");
    await page.getByLabel(/email/i).fill(TEST_CUSTOMER.email);
    await page.getByLabel(/password/i).fill("TestPass123!");
    await page.getByRole("button", { name: /sign up|create|register/i }).click();

    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /already|exists|duplicate|taken/i });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("shows client-side toast for password < 8 characters", async ({
    page,
  }) => {
    await page.getByLabel(/full name/i).fill("Short Pass User");
    await page.getByLabel(/email/i).fill("short-pass@test.war9a.com");
    await page.getByLabel(/password/i).fill("Ab1!");
    await page.getByRole("button", { name: /sign up|create|register/i }).click();

    // Expect a client-side validation toast or inline error about password length
    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /password|characters|short|minimum/i });
    const inlineError = page.getByText(/at least 8|minimum 8|8 characters/i);
    await expect(toast.first().or(inlineError.first())).toBeVisible({
      timeout: 5_000,
    });
  });

  test("disables submit button while request is pending", async ({ page }) => {
    const uniqueEmail = `e2e-pending-${Date.now()}@test.war9a.com`;

    await page.getByLabel(/full name/i).fill("Pending User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill("TestPass123!");

    const submitBtn = page.getByRole("button", {
      name: /sign up|create|register/i,
    });
    await submitBtn.click();

    // The button should be disabled or show a loading state briefly
    await expect(
      submitBtn.and(page.locator("[disabled]")).or(
        submitBtn.locator("svg.animate-spin, .animate-spin"),
      ),
    ).toBeVisible({ timeout: 3_000 });
  });

  test.fixme(
    "shows password strength indicator",
    // Expected: a visual indicator (bar/meter) showing password strength as user types
    async ({ page }) => {},
  );

  test.fixme(
    "shows confirm password field",
    // Expected: a second password input for confirmation that must match the first
    async ({ page }) => {},
  );

  test.fixme(
    "Google OAuth sign-up button visible",
    // Expected: a "Sign up with Google" button that initiates OAuth flow
    async ({ page }) => {},
  );
});

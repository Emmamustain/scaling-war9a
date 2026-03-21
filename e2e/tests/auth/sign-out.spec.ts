import { test, expect } from "../../fixtures/auth.fixture";
import { MainNavComponent } from "../../page-objects/components/main-nav.component";

test.describe("Sign Out", () => {
  test("signs out via logout button in desktop nav", async ({
    customerPage,
  }, testInfo) => {
    // Only run on desktop project
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await nav.logout();

    await expect(customerPage).toHaveURL(/^\/$/, { timeout: 10_000 });
  });

  test("shows 'Signed out' toast", async ({ customerPage }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await nav.logout();

    const toast = customerPage
      .locator("[data-sonner-toast]")
      .filter({ hasText: /signed out|logged out/i });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("redirects to landing page (/)", async ({ customerPage }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await nav.logout();

    await expect(customerPage).toHaveURL(/^\/$/, { timeout: 10_000 });
  });

  test("shows sign-in/sign-up buttons in nav after sign-out", async ({
    customerPage,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await nav.logout();

    await expect(customerPage).toHaveURL(/^\/$/, { timeout: 10_000 });

    await expect(nav.signInButton).toBeVisible({ timeout: 5_000 });
    await expect(nav.signUpButton).toBeVisible();
  });

  test("cannot access protected pages after sign-out", async ({
    customerPage,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await nav.logout();

    await expect(customerPage).toHaveURL(/^\/$/, { timeout: 10_000 });

    // Try navigating to a protected page — should redirect to sign-in or landing
    await customerPage.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(customerPage).not.toHaveURL(/dashboard/);
    await expect(customerPage).toHaveURL(/sign-in|\//);
  });
});

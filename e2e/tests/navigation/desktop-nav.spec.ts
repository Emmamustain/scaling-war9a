import { test, expect } from "../../fixtures/auth.fixture";
import { MainNavComponent } from "../../page-objects/components/main-nav.component";

test.describe("Desktop Navigation", () => {
  test("shows sticky top nav on desktop", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await expect(nav.nav.first()).toBeVisible();

    // Verify the nav is sticky/fixed
    const position = await nav.nav.first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.position;
    });
    expect(["sticky", "fixed"]).toContain(position);
  });

  test("shows War9a logo linking to home", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await expect(nav.logo).toBeVisible();
    await expect(nav.logo).toHaveAttribute("href", /^\/?$/);
  });

  test("shows Discover, Map, FAQ links", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await expect(nav.discoverLink).toBeVisible();
    await expect(nav.mapLink).toBeVisible();
    await expect(nav.faqLink).toBeVisible();
  });

  test("shows search bar", async ({ customerPage }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await expect(nav.searchInput).toBeVisible();
  });

  test("shows sign-in/Get Started when unauthenticated", async (
    { guestPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await guestPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(guestPage);
    await expect(nav.signInButton).toBeVisible();
    await expect(nav.signUpButton).toBeVisible();
  });

  test("shows notifications, profile, logout when authenticated", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await expect(nav.notificationsBell).toBeVisible();
    await expect(nav.profileIcon).toBeVisible();

    // Open profile menu to see logout
    await nav.openProfileMenu();
    await expect(nav.logoutButton).toBeVisible();
  });

  test("shows Dashboard link for owner", async (
    { ownerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await ownerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(ownerPage);
    await expect(nav.dashboardLink).toBeVisible();
  });

  test("shows dark mode toggle", async ({ customerPage }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const nav = new MainNavComponent(customerPage);
    await expect(nav.darkModeToggle).toBeVisible();
  });

  test("hidden on mobile viewports", async ({ customerPage }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    // Desktop header nav should not be visible on mobile
    const desktopNav = customerPage.locator("header nav, header").first();
    await expect(desktopNav).not.toBeVisible();
  });
});

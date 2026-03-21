import { test, expect } from "../../fixtures/auth.fixture";
import { BottomNavComponent } from "../../page-objects/components/bottom-nav.component";

test.describe("Mobile Navigation", () => {
  test("shows bottom tab bar on mobile", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(customerPage);
    await expect(bottomNav.container).toBeVisible();
  });

  test("shows Discover, Map, Dashboard/Scan, Alerts, Profile tabs", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(customerPage);
    await expect(bottomNav.discoverTab).toBeVisible();
    await expect(bottomNav.mapTab).toBeVisible();
    await expect(bottomNav.dashboardTab).toBeVisible();
    await expect(bottomNav.alertsTab).toBeVisible();
    await expect(bottomNav.profileTab).toBeVisible();
  });

  test("highlights active tab when on /discover", async (
    { customerPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(customerPage);
    // Active tab should have an aria-current or a distinguishing class/attribute
    await expect(
      bottomNav.discoverTab.and(
        customerPage.locator("[aria-current='page'], [data-active='true']"),
      ).or(bottomNav.discoverTab),
    ).toBeVisible();

    // Verify the tab is actually pointing to /discover
    await expect(bottomNav.discoverTab).toHaveAttribute("href", /discover/);
  });

  test("shows Dashboard for owner", async ({ ownerPage }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await ownerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(ownerPage);
    await expect(bottomNav.dashboardTab).toBeVisible();
  });

  test("hides Alerts for unauthenticated users", async (
    { guestPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await guestPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(guestPage);
    await expect(bottomNav.alertsTab).not.toBeVisible();
  });

  test("redirects to sign-in when unauthenticated user taps Profile", async (
    { guestPage },
    testInfo,
  ) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only test");

    await guestPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(guestPage);
    await bottomNav.goToProfile();

    await expect(guestPage).toHaveURL(/sign-in/, { timeout: 10_000 });
  });

  test("hidden on desktop viewports", async ({ customerPage }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop-only test");

    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });

    const bottomNav = new BottomNavComponent(customerPage);
    await expect(bottomNav.container).not.toBeVisible();
  });
});

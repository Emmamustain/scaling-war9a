import { test, expect } from "../../fixtures/auth.fixture";

test.describe("Session Management", () => {
  test("session persists across page navigations", async ({
    customerPage,
  }) => {
    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });
    await expect(customerPage).toHaveURL(/discover/);

    // Navigate to another page
    await customerPage.goto("/map", { waitUntil: "domcontentloaded" });
    await expect(customerPage).toHaveURL(/map/);

    // Navigate back — should still be authenticated, not redirected to sign-in
    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });
    await expect(customerPage).toHaveURL(/discover/);
    await expect(customerPage).not.toHaveURL(/sign-in/);
  });

  test("session persists across browser refresh", async ({ customerPage }) => {
    await customerPage.goto("/discover", { waitUntil: "domcontentloaded" });
    await expect(customerPage).toHaveURL(/discover/);

    await customerPage.reload({ waitUntil: "domcontentloaded" });

    await expect(customerPage).toHaveURL(/discover/);
    await expect(customerPage).not.toHaveURL(/sign-in/);
  });

  test.fixme(
    "handles expired session with redirect to sign-in",
    // Expected: when the session/token expires, the user is redirected to /sign-in
    async ({ customerPage }) => {},
  );

  test.fixme(
    "shows 'Session expired' toast",
    // Expected: when session expires, a toast reading "Session expired" is shown
    async ({ customerPage }) => {},
  );
});

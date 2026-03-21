import { test, expect } from "@playwright/test";

test.describe("Setup Username", () => {
  test.fixme(
    "displays username setup form after sign-up",
    // Expected: after creating a new account, user is prompted to choose a username
    async ({ page }) => {},
  );

  test.fixme(
    "validates 3-50 chars alphanumeric + underscore/hyphen",
    // Expected: usernames outside this range or with invalid chars show validation errors
    async ({ page }) => {},
  );

  test.fixme(
    "rejects duplicate usernames",
    // Expected: choosing an already-taken username shows an error like "Username already taken"
    async ({ page }) => {},
  );

  test.fixme(
    "redirects to /discover after setting username",
    // Expected: after successfully setting a username, the user is redirected to /discover
    async ({ page }) => {},
  );
});

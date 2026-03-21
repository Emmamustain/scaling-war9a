import { test, expect } from "@playwright/test";

test.describe("OAuth", () => {
  test.fixme(
    "shows Google OAuth button on sign-in",
    // Expected: a "Sign in with Google" button is visible on the sign-in page
    async ({ page }) => {},
  );

  test.fixme(
    "shows Google OAuth button on sign-up",
    // Expected: a "Sign up with Google" button is visible on the sign-up page
    async ({ page }) => {},
  );

  test.fixme(
    "initiates OAuth flow on click",
    // Expected: clicking the Google button redirects to Google's OAuth consent screen
    async ({ page }) => {},
  );
});

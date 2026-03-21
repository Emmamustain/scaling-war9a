import { test, expect } from "@playwright/test";

test.describe("Forgot Password", () => {
  test.fixme(
    "displays forgot password form",
    // Expected: a form with email input and submit button at /forgot-password
    async ({ page }) => {},
  );

  test.fixme(
    "sends reset link on valid email",
    // Expected: submitting a valid email sends a password reset link and shows confirmation
    async ({ page }) => {},
  );

  test.fixme(
    "shows success message",
    // Expected: after submitting, a success message like "Check your email for a reset link"
    async ({ page }) => {},
  );

  test.fixme(
    "shows error for non-existent email",
    // Expected: submitting an email that is not registered shows an appropriate error
    async ({ page }) => {},
  );
});

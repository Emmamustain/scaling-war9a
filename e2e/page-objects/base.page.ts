import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Base page-object providing helpers shared by every page.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  // ---------------------------------------------------------------------------
  // Viewport helpers
  // ---------------------------------------------------------------------------

  isMobile(): boolean {
    const vp = this.page.viewportSize();
    return (vp?.width ?? 1280) < 768;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  // ---------------------------------------------------------------------------
  // Toast helpers (sonner toasts render at [data-sonner-toaster])
  // ---------------------------------------------------------------------------

  /** Wait for a toast containing the given text. */
  async expectToast(text: string): Promise<void> {
    const toast = this.page.locator("[data-sonner-toast]").filter({ hasText: text });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  }

  /** Assert no toast with the given text is visible. */
  async expectNoToast(text: string): Promise<void> {
    const toast = this.page.locator("[data-sonner-toast]").filter({ hasText: text });
    await expect(toast).not.toBeVisible({ timeout: 3_000 });
  }

  // ---------------------------------------------------------------------------
  // Common element accessors
  // ---------------------------------------------------------------------------

  heading(text: string | RegExp): Locator {
    return this.page.getByRole("heading", { name: text });
  }

  link(text: string | RegExp): Locator {
    return this.page.getByRole("link", { name: text });
  }

  button(text: string | RegExp): Locator {
    return this.page.getByRole("button", { name: text });
  }

  /** Wait for URL to match a pattern. */
  async expectUrl(pattern: string | RegExp): Promise<void> {
    if (typeof pattern === "string") {
      await expect(this.page).toHaveURL(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    } else {
      await expect(this.page).toHaveURL(pattern);
    }
  }

  /** Get the page title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}

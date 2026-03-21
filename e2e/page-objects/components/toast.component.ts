import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Sonner toast notification component.
 */
export class ToastComponent {
  constructor(private readonly page: Page) {}

  // -- Locators ---------------------------------------------------------------

  private toastWithText(text: string | RegExp): Locator {
    return this.page.locator("[data-sonner-toast]").filter({ hasText: text });
  }

  get allToasts(): Locator {
    return this.page.locator("[data-sonner-toast]");
  }

  // -- Assertions -------------------------------------------------------------

  async expectVisible(text: string | RegExp, timeout = 8_000): Promise<void> {
    const toast = this.toastWithText(text);
    await expect(toast.first()).toBeVisible({ timeout });
  }

  async expectNotVisible(text: string | RegExp, timeout = 3_000): Promise<void> {
    const toast = this.toastWithText(text);
    await expect(toast).not.toBeVisible({ timeout });
  }

  async expectCount(count: number): Promise<void> {
    await expect(this.allToasts).toHaveCount(count);
  }

  // -- Actions ----------------------------------------------------------------

  async waitForToast(text: string | RegExp, timeout = 8_000): Promise<Locator> {
    const toast = this.toastWithText(text);
    await expect(toast.first()).toBeVisible({ timeout });
    return toast.first();
  }

  async dismiss(text: string | RegExp): Promise<void> {
    const toast = this.toastWithText(text).first();
    const closeBtn = toast.getByRole("button", { name: /close|dismiss/i }).or(
      toast.locator("button[aria-label*='lose']"),
    );
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }
}

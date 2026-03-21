import { type Page, type Locator, expect } from "@playwright/test";

/**
 * QR code dialog displaying a scannable QR image for a business/service.
 */
export class QrModalComponent {
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.locator("[data-testid='qr-modal']");
  }

  // -- Locators ---------------------------------------------------------------

  get qrImage(): Locator {
    return this.dialog.locator("[data-testid='qr-code']").first();
  }

  get businessName(): Locator {
    return this.dialog.getByRole("heading").first();
  }

  get serviceName(): Locator {
    return this.dialog.getByText(/service/i).or(
      this.dialog.locator("[data-testid='service-name']"),
    );
  }

  get downloadButton(): Locator {
    return this.dialog.getByRole("button", { name: /download/i }).or(
      this.dialog.getByRole("link", { name: /download/i }),
    );
  }

  get closeButton(): Locator {
    return this.dialog.locator("[data-testid='qr-modal-close']").or(
      this.dialog.getByRole("button", { name: /close/i }),
    );
  }

  // -- Assertions -------------------------------------------------------------

  async expectVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible({ timeout: 5_000 });
  }

  async expectHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible({ timeout: 3_000 });
  }

  // -- Actions ----------------------------------------------------------------

  async download(): Promise<void> {
    await this.downloadButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}

import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Alert dialog shown when a user tries to join a queue while already in another.
 * Displays current queue info and asks for confirmation to leave.
 */
export class ForfeitDialogComponent {
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("alertdialog").or(
      page.getByRole("dialog").filter({ hasText: /leave|forfeit/i }),
    );
  }

  // -- Locators ---------------------------------------------------------------

  get businessName(): Locator {
    return this.dialog.locator("[data-testid='current-business']").or(
      this.dialog.getByText(/business|queue/i).first(),
    );
  }

  get serviceName(): Locator {
    return this.dialog.locator("[data-testid='current-service']").or(
      this.dialog.getByText(/service/i).first(),
    );
  }

  get positionInfo(): Locator {
    return this.dialog.locator("[data-testid='current-position']").or(
      this.dialog.getByText(/#\d+/),
    );
  }

  get cancelButton(): Locator {
    return this.dialog.getByRole("button", { name: /cancel/i });
  }

  get leaveAndJoinButton(): Locator {
    return this.dialog.getByRole("button", { name: /leave.*join|forfeit/i });
  }

  // -- Assertions -------------------------------------------------------------

  async expectVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible({ timeout: 5_000 });
  }

  async expectHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible({ timeout: 3_000 });
  }

  // -- Actions ----------------------------------------------------------------

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async confirmLeaveAndJoin(): Promise<void> {
    await this.leaveAndJoinButton.click();
  }
}

import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Setup username page at `/setup-username`.
 */
export class SetupUsernamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/setup-username");
  }

  // -- Locators ---------------------------------------------------------------

  get usernameInput(): Locator {
    return this.page.getByLabel(/username/i).or(
      this.page.getByPlaceholder(/username/i),
    );
  }

  get setUsernameButton(): Locator {
    return this.button(/set username/i);
  }

  get validationMessage(): Locator {
    return this.page.locator("[role='alert'], [data-testid='validation-message'], .text-destructive, .text-red-500");
  }

  // -- Actions ----------------------------------------------------------------

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async submit(): Promise<void> {
    await this.setUsernameButton.click();
  }

  async setUsername(username: string): Promise<void> {
    await this.fillUsername(username);
    await this.submit();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.setUsernameButton).toBeVisible();
  }

  async expectValidationError(text: string | RegExp): Promise<void> {
    await expect(this.validationMessage.filter({ hasText: text })).toBeVisible();
  }
}

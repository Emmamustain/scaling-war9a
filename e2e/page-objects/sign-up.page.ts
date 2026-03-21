import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Sign-up / registration page at `/sign-up`.
 */
export class SignUpPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/sign-up");
  }

  // -- Locators ---------------------------------------------------------------

  get createAccountHeading(): Locator {
    return this.heading(/create an account/i);
  }

  get nameInput(): Locator {
    return this.page.getByLabel(/full name/i).or(
      this.page.getByPlaceholder("Ahmed Benali"),
    );
  }

  get emailInput(): Locator {
    return this.page.getByLabel(/email/i).or(
      this.page.getByPlaceholder("ahmed@example.com"),
    );
  }

  get passwordInput(): Locator {
    return this.page.getByLabel(/password/i).or(
      this.page.getByPlaceholder(/min.*8/i),
    );
  }

  get createAccountButton(): Locator {
    return this.button(/create account/i);
  }

  get signInLink(): Locator {
    return this.link(/sign in/i);
  }

  // -- Actions ----------------------------------------------------------------

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.createAccountButton.click();
  }

  async signUp(name: string, email: string, password: string): Promise<void> {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.createAccountHeading).toBeVisible();
    await expect(this.nameInput).toBeVisible();
  }
}

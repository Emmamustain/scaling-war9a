import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Sign-in page at `/sign-in`.
 */
export class SignInPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/sign-in");
  }

  // -- Locators ---------------------------------------------------------------

  get welcomeHeading(): Locator {
    return this.heading(/welcome back/i);
  }

  get emailInput(): Locator {
    return this.page.getByLabel(/email/i).or(
      this.page.getByPlaceholder("name@example.com"),
    );
  }

  get passwordInput(): Locator {
    return this.page.getByLabel(/password/i).or(
      this.page.getByPlaceholder(/••••/),
    );
  }

  get signInButton(): Locator {
    return this.button(/sign in/i);
  }

  get forgotPasswordLink(): Locator {
    return this.link(/forgot password/i);
  }

  get signUpLink(): Locator {
    return this.link(/sign up/i);
  }

  // -- Actions ----------------------------------------------------------------

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.signInButton.click();
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.welcomeHeading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }
}

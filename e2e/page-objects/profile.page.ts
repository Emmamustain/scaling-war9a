import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Profile page at `/profile`.
 */
export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/profile");
  }

  // -- User info --------------------------------------------------------------

  get avatar(): Locator {
    return this.page.locator("[data-testid='profile-avatar'], .avatar, img[alt*='avatar' i]").first();
  }

  get displayName(): Locator {
    return this.page.locator("[data-testid='display-name']").or(
      this.page.getByRole("heading").first(),
    );
  }

  get emailText(): Locator {
    return this.page.locator("[data-testid='email']").or(
      this.page.getByText(/@/),
    ).first();
  }

  get roleBadge(): Locator {
    return this.page.locator("[data-testid='role-badge']").or(
      this.page.getByText(/owner|worker|admin|user/i).first(),
    );
  }

  // -- Edit profile form ------------------------------------------------------

  get editDisplayNameInput(): Locator {
    return this.page.getByLabel(/display name|name/i).first();
  }

  get editPhoneInput(): Locator {
    return this.page.getByLabel(/phone/i);
  }

  get saveProfileButton(): Locator {
    return this.button(/save|update/i);
  }

  async editProfile(displayName: string, phone?: string): Promise<void> {
    await this.editDisplayNameInput.fill(displayName);
    if (phone) await this.editPhoneInput.fill(phone);
    await this.saveProfileButton.click();
  }

  // -- My Businesses ----------------------------------------------------------

  get myBusinessesList(): Locator {
    return this.page.locator("[data-testid='my-businesses']").or(
      this.page.locator("section, div").filter({ hasText: /my businesses/i }).first(),
    );
  }

  // -- Preferences ------------------------------------------------------------

  get darkModeToggle(): Locator {
    return this.page.getByRole("switch", { name: /dark mode/i }).or(
      this.page.getByLabel(/dark mode/i),
    );
  }

  get notificationsToggle(): Locator {
    return this.page.getByRole("switch", { name: /notification/i }).or(
      this.page.getByLabel(/notification/i),
    );
  }

  get languageLink(): Locator {
    return this.link(/language/i);
  }

  // -- Sign out ---------------------------------------------------------------

  get signOutButton(): Locator {
    return this.button(/sign out|log out/i);
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  // -- Unauthenticated state --------------------------------------------------

  get notSignedInText(): Locator {
    return this.page.getByText(/not signed in/i);
  }

  get signInButton(): Locator {
    return this.button(/sign in/i).or(this.link(/sign in/i));
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.page.getByRole("heading").first()).toBeVisible();
  }

  async expectAuthenticated(): Promise<void> {
    await expect(this.displayName).toBeVisible();
  }

  async expectUnauthenticated(): Promise<void> {
    await expect(this.notSignedInText).toBeVisible();
  }
}

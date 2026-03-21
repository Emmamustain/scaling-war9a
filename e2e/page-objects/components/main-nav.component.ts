import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Desktop top navigation bar (visible at md+ breakpoint, 768px+).
 */
export class MainNavComponent {
  readonly nav: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.locator("header nav, header");
  }

  // -- Brand ------------------------------------------------------------------

  get logo(): Locator {
    return this.page.getByRole("link", { name: /war9a/i }).first();
  }

  // -- Nav links --------------------------------------------------------------

  get discoverLink(): Locator {
    return this.page.getByRole("link", { name: /discover/i });
  }

  get mapLink(): Locator {
    return this.page.getByRole("link", { name: /map/i });
  }

  get faqLink(): Locator {
    return this.page.getByRole("link", { name: /faq/i });
  }

  get dashboardLink(): Locator {
    return this.page.getByRole("link", { name: /dashboard/i });
  }

  get myQueueBadge(): Locator {
    return this.page.getByRole("link", { name: /my queue/i });
  }

  // -- Categories dropdown ----------------------------------------------------

  get categoriesDropdown(): Locator {
    return this.page.getByRole("button", { name: /categories/i });
  }

  categoryOption(name: string | RegExp): Locator {
    return this.page.getByRole("menuitem", { name }).or(
      this.page.getByRole("option", { name }),
    );
  }

  // -- Search -----------------------------------------------------------------

  get searchInput(): Locator {
    return this.nav.getByRole("searchbox").or(
      this.nav.locator("input[type='search'], input[placeholder*='earch']"),
    );
  }

  // -- Auth buttons -----------------------------------------------------------

  get signInButton(): Locator {
    return this.page.getByRole("link", { name: /sign.?in/i }).or(
      this.page.getByRole("button", { name: /sign.?in/i }),
    );
  }

  get signUpButton(): Locator {
    return this.page.getByRole("link", { name: /sign.?up|get started/i }).or(
      this.page.getByRole("button", { name: /sign.?up|get started/i }),
    );
  }

  // -- Authenticated controls -------------------------------------------------

  get notificationsBell(): Locator {
    return this.page.locator("[data-testid='nav-notifications']").or(
      this.page.getByRole("button", { name: /notification/i }),
    );
  }

  get profileIcon(): Locator {
    return this.page.locator("[data-testid='nav-profile']").or(
      this.page.getByRole("button", { name: /profile|account|user/i }),
    );
  }

  get logoutButton(): Locator {
    return this.page.getByRole("button", { name: /log.?out|sign.?out/i }).or(
      this.page.getByRole("menuitem", { name: /log.?out|sign.?out/i }),
    );
  }

  // -- Dark mode toggle -------------------------------------------------------

  get darkModeToggle(): Locator {
    return this.page.locator("[data-testid='nav-theme-toggle']").or(
      this.page.getByRole("button", { name: /dark|light|theme|toggle theme/i }),
    );
  }

  // -- Actions ----------------------------------------------------------------

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
  }

  async openCategories(): Promise<void> {
    await this.categoriesDropdown.click();
  }

  async selectCategory(name: string | RegExp): Promise<void> {
    await this.openCategories();
    await this.categoryOption(name).click();
  }

  async navigateToDiscover(): Promise<void> {
    await this.discoverLink.click();
  }

  async navigateToMap(): Promise<void> {
    await this.mapLink.click();
  }

  async clickSignIn(): Promise<void> {
    await this.signInButton.click();
  }

  async clickSignUp(): Promise<void> {
    await this.signUpButton.click();
  }

  async openProfileMenu(): Promise<void> {
    await this.profileIcon.click();
  }

  async logout(): Promise<void> {
    await this.openProfileMenu();
    await this.logoutButton.click();
  }

  async toggleDarkMode(): Promise<void> {
    await this.darkModeToggle.click();
  }
}

import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Discover page at `/discover`.
 */
export class DiscoverPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/discover");
  }

  // -- Greeting section -------------------------------------------------------

  get greetingAvatar(): Locator {
    return this.page.locator("[data-testid='greeting-avatar'], .avatar").first();
  }

  get greetingText(): Locator {
    return this.page.getByText(/welcome back|hello there/i).first();
  }

  // -- City selector ----------------------------------------------------------

  get citySelector(): Locator {
    return this.page.getByRole("combobox", { name: /city/i }).or(
      this.page.locator("button").filter({ hasText: /city|location/i }),
    );
  }

  async selectCity(city: string): Promise<void> {
    await this.citySelector.click();
    await this.page.getByRole("option", { name: new RegExp(city, "i") }).click();
  }

  // -- Search -----------------------------------------------------------------

  get searchInput(): Locator {
    return this.page.getByPlaceholder(/search businesses/i).or(
      this.page.getByRole("searchbox"),
    );
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
  }

  // -- Category chips ---------------------------------------------------------

  get categoryChips(): Locator {
    return this.page.locator("[data-testid='category-chip'], [role='tab'], button").filter({ hasText: /.+/ });
  }

  categoryChip(name: string | RegExp): Locator {
    return this.page.getByRole("tab", { name }).or(
      this.page.getByRole("button", { name }),
    );
  }

  async selectCategory(name: string | RegExp): Promise<void> {
    await this.categoryChip(name).click();
  }

  // -- My Queue banner --------------------------------------------------------

  get myQueueCard(): Locator {
    return this.page.locator("[data-testid='my-queue-card']").or(
      this.page.locator("a, div").filter({ hasText: /my queue|you.?re in/i }).first(),
    );
  }

  // -- Sections ---------------------------------------------------------------

  get featuredSection(): Locator {
    return this.page.locator("section").filter({ hasText: /featured/i }).first();
  }

  get nearbySection(): Locator {
    return this.page.locator("section").filter({ hasText: /nearby/i }).first();
  }

  // -- Business cards ---------------------------------------------------------

  get businessCards(): Locator {
    return this.page.locator("[data-testid='business-card'], a[href*='/business/']");
  }

  businessCard(name: string | RegExp): Locator {
    return this.businessCards.filter({ hasText: name }).first();
  }

  async clickBusiness(name: string | RegExp): Promise<void> {
    await this.businessCard(name).click();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.searchInput).toBeVisible();
  }

  async expectGreeting(text: string | RegExp): Promise<void> {
    await expect(this.page.getByText(text).first()).toBeVisible();
  }
}

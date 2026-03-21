import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Landing / home page at `/`.
 */
export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // -- Navigation -------------------------------------------------------------

  async goto(): Promise<void> {
    await super.goto("/");
  }

  // -- Hero section -----------------------------------------------------------

  get heroHeading(): Locator {
    return this.heading(/virtual waitlists without the wait/i);
  }

  get tryItFreeButton(): Locator {
    return this.link(/try it free/i).or(this.button(/try it free/i));
  }

  get discoverBusinessesButton(): Locator {
    return this.link(/discover businesses/i).or(this.button(/discover businesses/i));
  }

  // -- Content sections -------------------------------------------------------

  get customersSection(): Locator {
    return this.page.locator("section").filter({ hasText: /customer/i }).first();
  }

  get adminSection(): Locator {
    return this.page.locator("section").filter({ hasText: /admin/i }).first();
  }

  get staffSection(): Locator {
    return this.page.locator("section").filter({ hasText: /staff/i }).first();
  }

  get industryTags(): Locator {
    return this.page.locator("[data-testid='industry-tag'], .badge, [class*='tag']").or(
      this.page.locator("section").filter({ hasText: /industr/i }).locator("span, a"),
    );
  }

  // -- Actions ----------------------------------------------------------------

  async clickTryItFree(): Promise<void> {
    await this.tryItFreeButton.click();
  }

  async clickDiscoverBusinesses(): Promise<void> {
    await this.discoverBusinessesButton.click();
  }

  // -- Assertions -------------------------------------------------------------

  async expectHeroVisible(): Promise<void> {
    await expect(this.heroHeading).toBeVisible();
  }
}

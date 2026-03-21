import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Business detail page at `/business/[slug]`.
 */
export class BusinessDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(slug: string): Promise<void> {
    await super.goto(`/business/${slug}`);
  }

  // -- Business info ----------------------------------------------------------

  get businessName(): Locator {
    return this.page.getByRole("heading").first();
  }

  get businessLogo(): Locator {
    return this.page.locator("img[alt*='logo'], [data-testid='business-logo']").first();
  }

  get businessDescription(): Locator {
    return this.page.locator("[data-testid='business-description']").or(
      this.page.locator("p").first(),
    );
  }

  get statusBadge(): Locator {
    return this.page.getByText(/open|closed/i).first();
  }

  // -- QR button --------------------------------------------------------------

  get qrButton(): Locator {
    return this.page.locator("[data-testid='qr-button']").or(
      this.button(/qr/i),
    );
  }

  async openQrModal(): Promise<void> {
    await this.qrButton.click();
  }

  // -- Info section (collapsible) ---------------------------------------------

  get infoSection(): Locator {
    return this.page.locator("[data-testid='business-info'], details, [data-state]").filter({ hasText: /info|about|hour|address/i }).first();
  }

  async toggleInfoSection(): Promise<void> {
    const trigger = this.infoSection.getByRole("button").or(this.infoSection.locator("summary"));
    await trigger.first().click();
  }

  // -- Service list -----------------------------------------------------------

  get serviceCards(): Locator {
    return this.page.locator("[data-testid='service-card'], [role='listitem']").filter({
      has: this.page.locator("[data-testid='service-name'], h3, h4"),
    });
  }

  serviceCard(name: string | RegExp): Locator {
    return this.serviceCards.filter({ hasText: name }).first();
  }

  serviceWaitingCount(name: string | RegExp): Locator {
    return this.serviceCard(name).getByText(/\d+\s*(waiting|in queue)/i).or(
      this.serviceCard(name).locator("[data-testid='waiting-count']"),
    );
  }

  async selectService(name: string | RegExp): Promise<void> {
    await this.serviceCard(name).click();
  }

  // -- Queue entries (after service selected) ---------------------------------

  get queueEntries(): Locator {
    return this.page.locator("[data-testid='queue-entry']").or(
      this.page.locator("li, tr").filter({ hasText: /#\d+/ }),
    );
  }

  // -- Action queue card ------------------------------------------------------

  get joinQueueButton(): Locator {
    return this.button(/join.*queue/i).or(this.link(/join.*queue/i));
  }

  get leaveQueueButton(): Locator {
    return this.button(/leave.*queue/i);
  }

  async joinQueue(): Promise<void> {
    await this.joinQueueButton.click();
  }

  async leaveQueue(): Promise<void> {
    await this.leaveQueueButton.click();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.businessName).toBeVisible();
  }

  async expectOpen(): Promise<void> {
    await expect(this.page.getByText(/open/i).first()).toBeVisible();
  }

  async expectClosed(): Promise<void> {
    await expect(this.page.getByText(/closed/i).first()).toBeVisible();
  }
}

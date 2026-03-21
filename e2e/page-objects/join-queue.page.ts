import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Join queue page at `/join/[serviceId]`.
 */
export class JoinQueuePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(serviceId: string): Promise<void> {
    await super.goto(`/join/${serviceId}`);
  }

  // -- Info -------------------------------------------------------------------

  get serviceName(): Locator {
    return this.page.getByRole("heading").first();
  }

  get businessName(): Locator {
    return this.page.getByText(/business/i).or(
      this.page.locator("[data-testid='business-name']"),
    ).first();
  }

  get statusBadge(): Locator {
    return this.page.getByText(/open|closed|paused/i).first();
  }

  get waitingCount(): Locator {
    return this.page.getByText(/\d+\s*(waiting|people|in queue)/i).or(
      this.page.locator("[data-testid='waiting-count']"),
    ).first();
  }

  get estimatedWaitTime(): Locator {
    return this.page.getByText(/\d+\s*(min|hour|est)/i).or(
      this.page.locator("[data-testid='est-wait']"),
    ).first();
  }

  // -- Group size controls ----------------------------------------------------

  get groupSizeValue(): Locator {
    return this.page.locator("[data-testid='group-size']").or(
      this.page.getByRole("spinbutton"),
    ).first();
  }

  get incrementGroupSize(): Locator {
    return this.page.locator("[data-testid='increment-group']").or(
      this.page.getByRole("button", { name: /increase|plus|\+/i }),
    ).first();
  }

  get decrementGroupSize(): Locator {
    return this.page.locator("[data-testid='decrement-group']").or(
      this.page.getByRole("button", { name: /decrease|minus|-/i }),
    ).first();
  }

  async setGroupSize(size: number): Promise<void> {
    // Reset to 1 then increment
    for (let i = 0; i < 10; i++) {
      if (await this.decrementGroupSize.isEnabled()) {
        await this.decrementGroupSize.click();
      } else break;
    }
    for (let i = 1; i < size; i++) {
      await this.incrementGroupSize.click();
    }
  }

  // -- Priority ---------------------------------------------------------------

  priorityOption(level: "Normal" | "Priority" | "Urgent"): Locator {
    return this.page.getByRole("radio", { name: new RegExp(level, "i") }).or(
      this.page.getByLabel(new RegExp(level, "i")),
    );
  }

  async selectPriority(level: "Normal" | "Priority" | "Urgent"): Promise<void> {
    await this.priorityOption(level).click();
  }

  // -- Join button ------------------------------------------------------------

  get joinQueueButton(): Locator {
    return this.button(/join.*queue/i);
  }

  async joinQueue(): Promise<void> {
    await this.joinQueueButton.click();
  }

  // -- Anonymous join ---------------------------------------------------------

  get anonymousSection(): Locator {
    return this.page.locator("[data-testid='anonymous-join']").or(
      this.page.locator("section, div").filter({ hasText: /anonymous|guest|without.*account/i }).first(),
    );
  }

  get anonymousNameInput(): Locator {
    return this.anonymousSection.getByLabel(/name/i).or(
      this.anonymousSection.getByPlaceholder(/name/i),
    );
  }

  get anonymousPhoneInput(): Locator {
    return this.anonymousSection.getByLabel(/phone/i).or(
      this.anonymousSection.getByPlaceholder(/phone/i),
    );
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.serviceName).toBeVisible();
    await expect(this.joinQueueButton).toBeVisible();
  }
}

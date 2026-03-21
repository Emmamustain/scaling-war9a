import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Queue tracker page at `/queue/[entryId]`.
 */
export class QueueTrackerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(entryId: string): Promise<void> {
    await super.goto(`/queue/${entryId}`);
  }

  // -- Gauge / position display -----------------------------------------------

  get svgGauge(): Locator {
    return this.page.locator("svg[data-testid='gauge'], svg.gauge, svg").first();
  }

  get countdownTimer(): Locator {
    return this.page.locator("[data-testid='countdown']").or(
      this.page.getByText(/\d+:\d+/),
    ).first();
  }

  get positionDisplay(): Locator {
    return this.page.getByText(/#\d+\s*(of\s*\d+)?/i).or(
      this.page.locator("[data-testid='position']"),
    ).first();
  }

  // -- Stats row --------------------------------------------------------------

  get waitTimeStat(): Locator {
    return this.page.getByText(/wait\s*time/i).or(
      this.page.locator("[data-testid='wait-time']"),
    ).first();
  }

  get groupSizeStat(): Locator {
    return this.page.getByText(/group\s*size/i).or(
      this.page.locator("[data-testid='group-size']"),
    ).first();
  }

  get priorityStat(): Locator {
    return this.page.getByText(/priority/i).or(
      this.page.locator("[data-testid='priority']"),
    ).first();
  }

  // -- Neighborhood list ------------------------------------------------------

  get neighborhoodList(): Locator {
    return this.page.locator("[data-testid='neighborhood-list']").or(
      this.page.locator("ol, ul").filter({ hasText: /#\d+/ }).first(),
    );
  }

  // -- Action buttons ---------------------------------------------------------

  get shareButton(): Locator {
    return this.button(/share/i).or(
      this.page.locator("button:has(svg.lucide-share)"),
    );
  }

  get leaveQueueButton(): Locator {
    return this.button(/leave.*queue/i);
  }

  async leaveQueue(): Promise<void> {
    await this.leaveQueueButton.click();
  }

  async share(): Promise<void> {
    await this.shareButton.click();
  }

  // -- Called state ------------------------------------------------------------

  get calledHeading(): Locator {
    return this.page.getByText(/it.?s your turn/i).first();
  }

  async expectCalled(): Promise<void> {
    await expect(this.calledHeading).toBeVisible({ timeout: 10_000 });
  }

  // -- Served state -----------------------------------------------------------

  get servedHeading(): Locator {
    return this.page.getByText(/all done/i).first();
  }

  async expectServed(): Promise<void> {
    await expect(this.servedHeading).toBeVisible({ timeout: 10_000 });
  }

  // -- Notification opt-in ----------------------------------------------------

  get notificationOptIn(): Locator {
    return this.button(/enable.*notification|notify me/i).or(
      this.page.locator("[data-testid='notification-opt-in']"),
    );
  }

  async enableNotifications(): Promise<void> {
    await this.notificationOptIn.click();
  }

  // -- Map section ------------------------------------------------------------

  get mapSection(): Locator {
    return this.page.locator(".leaflet-container, [data-testid='map']").first();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.positionDisplay).toBeVisible();
  }

  async expectPosition(pos: number): Promise<void> {
    await expect(this.page.getByText(new RegExp(`#${pos}`))).toBeVisible();
  }
}

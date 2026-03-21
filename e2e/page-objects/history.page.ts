import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Queue history page at `/history`.
 */
export class HistoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/history");
  }

  // -- Locators ---------------------------------------------------------------

  get pageHeading(): Locator {
    return this.heading(/queue history/i);
  }

  get historyEntries(): Locator {
    return this.page.locator("[data-testid='history-entry']").or(
      this.page.locator("li, [role='listitem'], tr").filter({
        has: this.page.getByText(/served|left|no.?show/i),
      }),
    );
  }

  historyEntry(businessName: string | RegExp): Locator {
    return this.historyEntries.filter({ hasText: businessName }).first();
  }

  entryBusinessName(entry: Locator): Locator {
    return entry.locator("[data-testid='business-name']").or(
      entry.getByRole("heading"),
    ).first();
  }

  entryServiceName(entry: Locator): Locator {
    return entry.locator("[data-testid='service-name']").or(
      entry.getByText(/service/i),
    ).first();
  }

  entryStatusBadge(entry: Locator): Locator {
    return entry.getByText(/served|left|no.?show/i).first();
  }

  // -- Empty state ------------------------------------------------------------

  get emptyState(): Locator {
    return this.page.getByText(/no queue history yet/i);
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async expectEntryCount(count: number): Promise<void> {
    await expect(this.historyEntries).toHaveCount(count);
  }
}

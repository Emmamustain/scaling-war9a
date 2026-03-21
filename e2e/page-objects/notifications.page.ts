import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Notifications page at `/notifications`.
 */
export class NotificationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/notifications");
  }

  // -- Locators ---------------------------------------------------------------

  get pageHeading(): Locator {
    return this.heading(/notifications/i);
  }

  get unreadCount(): Locator {
    return this.page.locator("[data-testid='unread-count']").or(
      this.page.getByText(/\d+\s*unread/i),
    ).first();
  }

  get markAllReadButton(): Locator {
    return this.button(/mark all read/i);
  }

  get notificationItems(): Locator {
    return this.page.locator("[data-testid='notification-item']").or(
      this.page.locator("li, [role='listitem']").filter({
        has: this.page.locator("[data-testid='notification-title'], h3, h4, strong"),
      }),
    );
  }

  notificationByTitle(title: string | RegExp): Locator {
    return this.notificationItems.filter({ hasText: title }).first();
  }

  notificationTitle(item: Locator): Locator {
    return item.locator("[data-testid='notification-title'], h3, h4, strong").first();
  }

  notificationBody(item: Locator): Locator {
    return item.locator("[data-testid='notification-body'], p").first();
  }

  notificationTime(item: Locator): Locator {
    return item.locator("[data-testid='notification-time'], time, span").last();
  }

  // -- Empty state ------------------------------------------------------------

  get emptyState(): Locator {
    return this.page.getByText(/no notifications yet/i);
  }

  // -- Actions ----------------------------------------------------------------

  async markAllRead(): Promise<void> {
    await this.markAllReadButton.click();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
}

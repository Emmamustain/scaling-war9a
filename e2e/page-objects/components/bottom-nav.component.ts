import { type Page, type Locator } from "@playwright/test";

/**
 * Mobile bottom tab bar (visible below md breakpoint, < 768px).
 * 5 tabs: Discover, Map, Dashboard/Scan, Alerts, Profile.
 */
export class BottomNavComponent {
  readonly container: Locator;

  constructor(private readonly page: Page) {
    this.container = page.locator("[data-testid='bottom-nav']");
  }

  // -- Tab accessors ----------------------------------------------------------

  get discoverTab(): Locator {
    return this.page.getByRole("link", { name: /discover/i }).last();
  }

  get mapTab(): Locator {
    return this.page.getByRole("link", { name: /map/i }).last();
  }

  get dashboardTab(): Locator {
    return this.page.getByRole("link", { name: /dashboard|scan/i }).last();
  }

  get alertsTab(): Locator {
    return this.page.getByRole("link", { name: /alert|notification/i }).last();
  }

  get profileTab(): Locator {
    return this.page.getByRole("link", { name: /profile/i }).last();
  }

  // -- Actions ----------------------------------------------------------------

  async goToDiscover(): Promise<void> {
    await this.discoverTab.click();
  }

  async goToMap(): Promise<void> {
    await this.mapTab.click();
  }

  async goToDashboard(): Promise<void> {
    await this.dashboardTab.click();
  }

  async goToAlerts(): Promise<void> {
    await this.alertsTab.click();
  }

  async goToProfile(): Promise<void> {
    await this.profileTab.click();
  }

  tab(name: string | RegExp): Locator {
    return this.container.getByRole("link", { name });
  }
}

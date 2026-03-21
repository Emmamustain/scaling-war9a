import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Map page at `/map`.
 */
export class MapPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto("/map");
  }

  // -- Map container ----------------------------------------------------------

  get mapContainer(): Locator {
    return this.page.locator(".leaflet-container, [data-testid='map']").first();
  }

  // -- Controls ---------------------------------------------------------------

  get myLocationButton(): Locator {
    return this.button(/my location|locate/i).or(
      this.page.locator("[aria-label*='ocation'], button:has(svg.lucide-locate), button:has(svg.lucide-crosshair)"),
    );
  }

  async clickMyLocation(): Promise<void> {
    await this.myLocationButton.click();
  }

  // -- Markers ----------------------------------------------------------------

  get businessMarkers(): Locator {
    return this.page.locator(".leaflet-marker-icon, [data-testid='business-marker']");
  }

  async clickMarker(index = 0): Promise<void> {
    await this.businessMarkers.nth(index).click();
  }

  // -- Popup card -------------------------------------------------------------

  get popup(): Locator {
    return this.page.locator(".leaflet-popup, [data-testid='map-popup']").first();
  }

  get popupBusinessName(): Locator {
    return this.popup.locator("h3, h4, strong, [data-testid='popup-name']").first();
  }

  get popupCity(): Locator {
    return this.popup.locator("[data-testid='popup-city']").or(
      this.popup.getByText(/city|location/i),
    ).first();
  }

  get popupStatus(): Locator {
    return this.popup.getByText(/open|closed/i).first();
  }

  get viewAndJoinButton(): Locator {
    return this.popup.getByRole("link", { name: /view.*join|join.*queue/i }).or(
      this.popup.getByRole("button", { name: /view.*join|join.*queue/i }),
    );
  }

  async viewAndJoinQueue(): Promise<void> {
    await this.viewAndJoinButton.click();
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.mapContainer).toBeVisible({ timeout: 10_000 });
  }

  async expectPopupVisible(): Promise<void> {
    await expect(this.popup).toBeVisible();
  }

  async expectMarkerCount(count: number): Promise<void> {
    await expect(this.businessMarkers).toHaveCount(count);
  }
}

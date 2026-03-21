import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Feedback page at `/feedback/[entryId]`.
 */
export class FeedbackPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(entryId: string): Promise<void> {
    await super.goto(`/feedback/${entryId}`);
  }

  // -- Rating -----------------------------------------------------------------

  starButton(rating: 1 | 2 | 3 | 4 | 5): Locator {
    return this.page.getByRole("button", { name: new RegExp(`${rating}\\s*star`, "i") }).or(
      this.page.locator(`[data-testid='star-${rating}'], button:nth-child(${rating})`).filter({
        has: this.page.locator("svg"),
      }),
    );
  }

  get starButtons(): Locator {
    return this.page.locator("[data-testid^='star-'], button:has(svg.lucide-star)");
  }

  async rate(stars: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await this.starButton(stars).click();
  }

  // -- Comment ----------------------------------------------------------------

  get commentTextarea(): Locator {
    return this.page.getByPlaceholder(/tell us more/i).or(
      this.page.getByRole("textbox"),
    );
  }

  async fillComment(comment: string): Promise<void> {
    await this.commentTextarea.fill(comment);
  }

  // -- Actions ----------------------------------------------------------------

  get submitButton(): Locator {
    return this.button(/submit/i);
  }

  get skipButton(): Locator {
    return this.button(/skip/i).or(this.link(/skip/i));
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async skip(): Promise<void> {
    await this.skipButton.click();
  }

  async submitFeedback(stars: 1 | 2 | 3 | 4 | 5, comment?: string): Promise<void> {
    await this.rate(stars);
    if (comment) await this.fillComment(comment);
    await this.submit();
  }

  // -- Success state ----------------------------------------------------------

  get thankYouHeading(): Locator {
    return this.page.getByText(/thank you/i).first();
  }

  get discoverMoreLink(): Locator {
    return this.link(/discover more/i);
  }

  // -- Assertions -------------------------------------------------------------

  async expectPageLoaded(): Promise<void> {
    await expect(this.starButtons.first()).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.thankYouHeading).toBeVisible();
  }
}

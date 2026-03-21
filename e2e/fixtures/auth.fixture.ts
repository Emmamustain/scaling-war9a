/**
 * Extended Playwright test fixture that provides pre-authenticated
 * Page objects for each role.
 *
 * Usage in spec files:
 *   import { test, expect } from "@fixtures/auth.fixture";
 *   test("owner can see dashboard", async ({ ownerPage }) => { ... });
 */
import { test as base, type Page, type BrowserContext } from "@playwright/test";
import path from "path";
import fs from "fs";

// Re-export expect for convenience
export { expect } from "@playwright/test";

/** IDs created during global setup */
export interface TestIds {
  customerId: string;
  ownerId: string;
  workerId: string;
  adminId: string;
  businessId?: string;
  businessSlug?: string;
  serviceId?: string;
  guichetId?: string;
}

function loadTestIds(): TestIds {
  const p = path.resolve(__dirname, "../.auth/test-ids.json");
  if (!fs.existsSync(p)) {
    return {
      customerId: "",
      ownerId: "",
      workerId: "",
      adminId: "",
    };
  }
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

type AuthFixtures = {
  /** Page authenticated as regular customer */
  customerPage: Page;
  /** Page authenticated as business owner */
  ownerPage: Page;
  /** Page authenticated as a worker */
  workerPage: Page;
  /** Page authenticated as admin */
  adminPage: Page;
  /** Page with NO authentication (guest) */
  guestPage: Page;
  /** IDs of test entities created during global-setup */
  testIds: TestIds;
};

async function authedPage(
  browser: BrowserContext["browser"],
  stateFile: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const statePath = path.resolve(__dirname, "../.auth", stateFile);
  const context = await browser!.newContext({
    storageState: fs.existsSync(statePath) ? statePath : undefined,
  });
  const page = await context.newPage();
  return { context, page };
}

export const test = base.extend<AuthFixtures>({
  customerPage: async ({ browser }, use) => {
    const { context, page } = await authedPage(browser, "customer.json");
    await use(page);
    await context.close();
  },

  ownerPage: async ({ browser }, use) => {
    const { context, page } = await authedPage(browser, "owner.json");
    await use(page);
    await context.close();
  },

  workerPage: async ({ browser }, use) => {
    const { context, page } = await authedPage(browser, "worker.json");
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const { context, page } = await authedPage(browser, "admin.json");
    await use(page);
    await context.close();
  },

  guestPage: async ({ browser }, use) => {
    const context = await browser!.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  testIds: async ({}, use) => {
    await use(loadTestIds());
  },
});

/**
 * Queue Lifecycle — full end-to-end scenario
 *
 * All accounts and the "E2E Queue Clinic" business are created by `make db-seed`.
 * The test runs every check sequentially (one browser context at a time) so
 * there is never any session bleed between actors.
 *
 * Phases:
 *   1. Users 1–4 join  → verify each user's position, count, join/leave button
 *   2. User 1 leaves   → verify shifted positions
 *   3. Worker calls next (User 2) → verify worker dashboard + remaining users
 *   4. User 5 joins    → verify they land at the end of the list
 */

import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import {
  signIn,
  joinQueue,
  leaveQueue,
  callNext,
  getQueueStatus,
  getMyEntries,
} from "../../fixtures/api-helpers";

// ─── Seeded constants (make db-seed creates these) ───────────────────────────

const PASSWORD     = process.env.FAKE_USERS_PASSWORD || "123123123";
const BIZ_SLUG     = "e2e-queue-clinic";
const WORKER_EMAIL = "e2e-qworker@war9a.test";
const userEmail    = (n: number) => `e2e-user${n}@war9a.test`;

const API    = process.env.API_BASE_URL    || "http://localhost:4000";
const ORIGIN = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

// ─── Auth helper — signs in from within the browser context ──────────────────

async function signInContext(ctx: BrowserContext, email: string): Promise<void> {
  const res = await ctx.request.post(`${API}/auth/sign-in/email`, {
    data: { email, password: PASSWORD },
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
  });
  if (!res.ok()) {
    throw new Error(`Sign-in failed for ${email} (${res.status()}): ${await res.text()}`);
  }
}

/** Open a fresh isolated context, sign in, return a ready page. */
async function openAs(browser: Browser, email: string): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx  = await browser.newContext();
  await signInContext(ctx, email);
  const page = await ctx.newPage();
  return { ctx, page };
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

async function openServiceQueue(page: Page): Promise<void> {
  await page.goto(`/business/${BIZ_SLUG}`);
  await page.getByText("Queue Test Service", { exact: false }).first().click();
  await expect(page.getByText(/\d+\s*waiting/i).first()).toBeVisible({ timeout: 10_000 });
}

async function expectWaitingCount(page: Page, n: number): Promise<void> {
  await expect(
    page.getByText(new RegExp(`${n}\\s*waiting`, "i")).first(),
  ).toBeVisible({ timeout: 8_000 });
}

async function expectJoinButton(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: /join queue/i })).toBeVisible({ timeout: 6_000 });
}

async function expectLeaveButton(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: /leave queue/i })).toBeVisible({ timeout: 6_000 });
}

async function expectPosition(page: Page, pos: number): Promise<void> {
  await expect(
    page.getByText(new RegExp(`#${pos}\\b`)).first(),
  ).toBeVisible({ timeout: 6_000 });
}

/** Check a user's view of the business page then close their context. */
async function checkUser(
  browser: Browser,
  email: string,
  fn: (page: Page) => Promise<void>,
): Promise<void> {
  const { ctx, page } = await openAs(browser, email);
  try {
    await openServiceQueue(page);
    await fn(page);
  } finally {
    await ctx.close();
  }
}

/** Check the worker dashboard then close their context. */
async function checkWorker(
  browser: Browser,
  fn: (page: Page) => Promise<void>,
): Promise<void> {
  const { ctx, page } = await openAs(browser, WORKER_EMAIL);
  try {
    await page.goto(`/worker/${BIZ_SLUG}`);
    await expect(page.getByRole("button", { name: /call next/i }).first()).toBeVisible({ timeout: 15_000 });
    await fn(page);
  } finally {
    await ctx.close();
  }
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe("Queue Lifecycle", () => {
  test.setTimeout(300_000);

  let serviceId:    string;
  let guichetId:    string;
  let workerCookies: string;
  let userCookies:  string[];   // index 0–4 → users 1–5
  let entryIds:     string[];   // populated as users join

  test.beforeAll(async () => {
    // API cookies for queue mutations
    workerCookies = (await signIn(WORKER_EMAIL, PASSWORD)).cookies;
    userCookies   = [];
    for (let i = 1; i <= 5; i++) {
      userCookies.push((await signIn(userEmail(i), PASSWORD)).cookies);
    }

    // Resolve serviceId & guichetId from the seeded business
    const bizRes = await fetch(`${API}/businesses/${BIZ_SLUG}`, { headers: { Origin: ORIGIN } });
    if (!bizRes.ok) throw new Error(`Cannot fetch business "${BIZ_SLUG}" (${bizRes.status}) — run make db-seed`);
    const biz = await bizRes.json() as { id: string; services: Array<{ id: string; name: string }> };

    const svc = biz.services.find((s) => s.name === "Queue Test Service");
    if (!svc) throw new Error(`Service not found — run make db-seed`);
    serviceId = svc.id;

    const gRes = await fetch(`${API}/businesses/${biz.id}/guichets`, {
      headers: { Origin: ORIGIN, Cookie: workerCookies },
    });
    if (!gRes.ok) throw new Error(`Cannot fetch guichets (${gRes.status})`);
    const guichets = await gRes.json() as Array<{ id: string; serviceId: string | null; name: string }>;
    const g = guichets.find((g) => g.serviceId === serviceId && g.name === "Test Window");
    if (!g) throw new Error(`Guichet not found — run make db-seed`);
    guichetId = g.id;

    // Clean up any leftover entries from a previous test run
    for (const cookies of userCookies) {
      const entries = await getMyEntries(cookies);
      for (const entry of entries) {
        if (entry.serviceId === serviceId && (entry.status === "waiting" || entry.status === "called")) {
          await leaveQueue(cookies, entry.id).catch(() => { /* already gone */ });
        }
      }
    }
  });

  test("full lifecycle: join × 4 → leave → call-next → join #5", async ({ browser }) => {

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1 — Users 1–4 join
    // ══════════════════════════════════════════════════════════════════════════
    await test.step("Phase 1: Users 1–4 join the queue", async () => {
      entryIds = [];
      for (let i = 1; i <= 4; i++) {
        const { entry } = await joinQueue(userCookies[i - 1], serviceId);
        expect(entry.position, `User ${i} position`).toBe(i);
        entryIds.push(entry.id);
      }
      expect((await getQueueStatus(serviceId)).waitingCount).toBe(4);

      // Each joined user sees their position and Leave Queue
      for (let i = 1; i <= 4; i++) {
        await test.step(`User ${i} sees position #${i} and Leave Queue`, async () => {
          await checkUser(browser, userEmail(i), async (page) => {
            await expectWaitingCount(page, 4);
            await expectLeaveButton(page);
            await expectPosition(page, i);
            // All 4 cards visible in the queue list
            for (let pos = 1; pos <= 4; pos++) await expectPosition(page, pos);
          });
        });
      }

      // User 5 not yet joined
      await test.step("User 5 sees Join Queue + 4 waiting", async () => {
        await checkUser(browser, userEmail(5), async (page) => {
          await expectWaitingCount(page, 4);
          await expectJoinButton(page);
          await expectPosition(page, 4); // ActionQueueCard hint = queueTotal
        });
      });

      // Worker dashboard
      await test.step("Worker: 4 waiting, Call Next enabled", async () => {
        await checkWorker(browser, async (page) => {
          await expect(page.locator("[data-testid='waiting-count']").filter({ hasText: "4" })).toBeVisible({ timeout: 8_000 });
          await expect(page.getByRole("button", { name: /call next/i })).toBeEnabled();
        });
      });
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 2 — User 1 leaves
    // ══════════════════════════════════════════════════════════════════════════
    await test.step("Phase 2: User 1 leaves — positions shift up", async () => {
      await leaveQueue(userCookies[0], entryIds[0]);
      expect((await getQueueStatus(serviceId)).waitingCount).toBe(3);

      await test.step("User 1 now sees Join Queue", async () => {
        await checkUser(browser, userEmail(1), async (page) => {
          await expectWaitingCount(page, 3);
          await expectJoinButton(page);
        });
      });

      for (let i = 2; i <= 4; i++) {
        const newPos = i - 1;
        await test.step(`User ${i} shifted to #${newPos}`, async () => {
          await checkUser(browser, userEmail(i), async (page) => {
            await expectWaitingCount(page, 3);
            await expectLeaveButton(page);
            await expectPosition(page, newPos);
          });
        });
      }

      await test.step("User 5 still sees Join Queue, 3 waiting", async () => {
        await checkUser(browser, userEmail(5), async (page) => {
          await expectWaitingCount(page, 3);
          await expectJoinButton(page);
        });
      });

      await test.step("Worker: 3 waiting, Call Next enabled, User 2 first in list", async () => {
        await checkWorker(browser, async (page) => {
          await expect(page.locator("[data-testid='waiting-count']").filter({ hasText: "3" })).toBeVisible({ timeout: 8_000 });
          await expect(page.getByRole("button", { name: /call next/i })).toBeEnabled();
          await expect(page.locator("[data-testid='queue-entry-row']").first()).toContainText("E2E User 2");
        });
      });
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 3 — Worker calls next (User 2)
    // ══════════════════════════════════════════════════════════════════════════
    await test.step("Phase 3: Worker calls next — User 2 is called", async () => {
      const { entry: called } = await callNext(workerCookies, serviceId, guichetId);
      expect(called.status).toBe("called");
      expect(called.id).toBe(entryIds[1]);
      expect((await getQueueStatus(serviceId)).waitingCount).toBe(2);

      await test.step("Worker: Now Serving User 2, 2 still waiting, Call Next disabled", async () => {
        await checkWorker(browser, async (page) => {
          await expect(page.getByText(/now serving/i)).toBeVisible({ timeout: 10_000 });
          await expect(page.locator("[data-testid='waiting-count']").filter({ hasText: "2" })).toBeVisible();
          await expect(page.getByRole("button", { name: /call next/i })).toBeDisabled();
          await expect(page.getByRole("button", { name: /done/i })).toBeVisible();
          await expect(page.getByRole("button", { name: /no.show/i })).toBeVisible();
        });
      });

      // User 2: entry is "called" → myEntry found → Leave Queue still shown
      await test.step("User 2: entry is 'called', still sees Leave Queue", async () => {
        await checkUser(browser, userEmail(2), async (page) => {
          await expectWaitingCount(page, 2);
          await expectLeaveButton(page);
        });
      });

      await test.step("User 3 shifted to #1", async () => {
        await checkUser(browser, userEmail(3), async (page) => {
          await expectWaitingCount(page, 2);
          await expectLeaveButton(page);
          await expectPosition(page, 1);
        });
      });

      await test.step("User 4 shifted to #2", async () => {
        await checkUser(browser, userEmail(4), async (page) => {
          await expectWaitingCount(page, 2);
          await expectLeaveButton(page);
          await expectPosition(page, 2);
        });
      });

      for (const i of [1, 5]) {
        await test.step(`User ${i} sees Join Queue`, async () => {
          await checkUser(browser, userEmail(i), async (page) => {
            await expectWaitingCount(page, 2);
            await expectJoinButton(page);
          });
        });
      }
    });

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 4 — User 5 joins at the back
    // ══════════════════════════════════════════════════════════════════════════
    await test.step("Phase 4: User 5 joins at the back of the queue", async () => {
      const { entry } = await joinQueue(userCookies[4], serviceId);
      expect(entry.position, "User 5 is #3").toBe(3);
      expect((await getQueueStatus(serviceId)).waitingCount).toBe(3);

      await test.step("User 5: Leave Queue, at #3, all 3 positions visible", async () => {
        await checkUser(browser, userEmail(5), async (page) => {
          await expectWaitingCount(page, 3);
          await expectLeaveButton(page);
          await expectPosition(page, 1);
          await expectPosition(page, 2);
          await expectPosition(page, 3);
        });
      });

      await test.step("User 3: still #1, now 3 waiting", async () => {
        await checkUser(browser, userEmail(3), async (page) => {
          await expectWaitingCount(page, 3);
          await expectLeaveButton(page);
          await expectPosition(page, 1);
        });
      });

      await test.step("User 4: still #2, now 3 waiting", async () => {
        await checkUser(browser, userEmail(4), async (page) => {
          await expectWaitingCount(page, 3);
          await expectLeaveButton(page);
          await expectPosition(page, 2);
        });
      });

      await test.step("Worker: 3 waiting, User 2 still served, list order 3 → 4 → 5", async () => {
        await checkWorker(browser, async (page) => {
          await expect(page.locator("[data-testid='waiting-count']").filter({ hasText: "3" })).toBeVisible({ timeout: 8_000 });
          await expect(page.getByText(/now serving/i)).toBeVisible();
          await expect(page.getByRole("button", { name: /call next/i })).toBeDisabled();
          const rows = page.locator("[data-testid='queue-entry-row']");
          await expect(rows.nth(0)).toContainText("E2E User 3");
          await expect(rows.nth(1)).toContainText("E2E User 4");
          await expect(rows.nth(2)).toContainText("E2E User 5");
        });
      });
    });
  });
});

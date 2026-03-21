import { test, expect } from "@playwright/test";

const API = process.env.API_BASE_URL || "http://localhost:4000";
const ORIGIN = process.env.PLAYWRIGHT_BASE_URL || "https://war9a.localhost";

const baseHeaders = {
  "Content-Type": "application/json",
  Origin: ORIGIN,
};

test.describe("Rate Limiting", () => {
  test("auth endpoints return rate limit headers", async ({ request }) => {
    const res = await request.post(`${API}/auth/sign-in/email`, {
      headers: baseHeaders,
      data: { email: "nonexistent@test.com", password: "wrongpass" },
    });

    // better-auth returns 401/403 for bad creds — rate limit headers still present
    expect(res.status()).not.toBe(404);
    const headers = res.headers();
    expect(
      headers["ratelimit-limit"] ?? headers["x-ratelimit-limit"],
    ).toBeDefined();
    expect(
      headers["ratelimit-remaining"] ?? headers["x-ratelimit-remaining"],
    ).toBeDefined();
  });

  test("global API returns rate limit headers", async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    // /health is skipped from rate limiting — no headers expected
    // Verify a normal endpoint has them instead
    const res2 = await request.get(`${API}/`, {
      headers: { Origin: ORIGIN },
    });
    const headers = res2.headers();
    expect(
      headers["ratelimit-limit"] ??
        headers["x-ratelimit-limit"] ??
        headers["retry-after"],
    ).toBeDefined();
  });

  test("returns 429 after exceeding auth rate limit", async ({ request }) => {
    // Only meaningful in production where limits are low.
    // In dev (NODE_ENV=development) limits are 10 000 — skip.
    const isCI = !!process.env.CI;
    test.skip(!isCI, "Rate limit 429 test only runs in CI / production config");

    const MAX = 25; // prod auth limit is 20, send a few more
    let got429 = false;

    for (let i = 0; i < MAX; i++) {
      const res = await request.post(`${API}/auth/sign-in/email`, {
        headers: baseHeaders,
        data: { email: `flood${i}@test.com`, password: "wrongpass" },
      });
      if (res.status() === 429) {
        got429 = true;
        const body = await res.json();
        expect(body.message).toMatch(/too many/i);
        break;
      }
    }

    expect(got429).toBeTruthy();
  });

  test("queue join endpoint rate limits are enforced in CI", async ({
    request,
  }) => {
    const isCI = !!process.env.CI;
    test.skip(!isCI, "Rate limit 429 test only runs in CI / production config");

    // Hit a non-existent service to get consistent 404/401, not 429 from auth
    const MAX = 10;
    let got429 = false;

    for (let i = 0; i < MAX; i++) {
      const res = await request.post(
        `${API}/queue/service/00000000-0000-0000-0000-000000000000/join`,
        {
          headers: baseHeaders,
          data: { groupSize: 1, priority: "normal" },
        },
      );
      if (res.status() === 429) {
        got429 = true;
        break;
      }
    }

    expect(got429).toBeTruthy();
  });
});

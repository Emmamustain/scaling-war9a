/**
 * Direct API helpers for test data setup / teardown.
 *
 * All calls go to the backend (default http://localhost:4000) and carry
 * cookie-based auth exactly like the real frontend does.
 */

const API = process.env.API_BASE_URL || "http://localhost:4000";
const ORIGIN = process.env.PLAYWRIGHT_BASE_URL || "https://war9a.localhost";

// ---------------------------------------------------------------------------
// Low-level fetch wrapper
// ---------------------------------------------------------------------------

type CookieJar = string;

interface ApiResponse<T = unknown> {
  data: T;
  cookies: CookieJar;
}

async function api<T = unknown>(
  path: string,
  options: RequestInit & { cookies?: string } = {},
): Promise<ApiResponse<T>> {
  const { cookies, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Origin": ORIGIN,
    ...(cookies ? { Cookie: cookies } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API}${path}`, { ...init, headers, redirect: "manual" });

  // Collect set-cookie headers
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const mergedCookies = mergeCookies(cookies ?? "", setCookies);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${init.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }

  const data = res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  return { data, cookies: mergedCookies };
}

function mergeCookies(existing: string, setCookies: string[]): string {
  const jar = new Map<string, string>();
  // Parse existing
  for (const pair of existing.split(";")) {
    const [k, v] = pair.split("=").map((s) => s.trim());
    if (k && v) jar.set(k, v);
  }
  // Apply new
  for (const sc of setCookies) {
    const first = sc.split(";")[0];
    const [k, v] = first.split("=").map((s) => s.trim());
    if (k && v) jar.set(k, v);
  }
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{ cookies: CookieJar; userId?: string }> {
  const { data, cookies } = await api<{ user?: { id: string } }>(
    "/auth/sign-up/email",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    },
  );
  return { cookies, userId: data?.user?.id };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ cookies: CookieJar }> {
  const { cookies } = await api("/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return { cookies };
}

export async function getMe(cookies: string): Promise<{ id: string; role: string; username: string; email: string }> {
  const { data } = await api<{ id: string; role: string; username: string; email: string }>("/users/me", {
    cookies,
  });
  return data;
}

export async function setUsername(
  cookies: string,
  username: string,
): Promise<void> {
  await api("/users/me/username", {
    method: "PATCH",
    body: JSON.stringify({ username }),
    cookies,
  });
}

// ---------------------------------------------------------------------------
// Business helpers
// ---------------------------------------------------------------------------

export interface Business {
  id: string;
  slug: string;
  name: string;
  status: string;
}

export async function createBusiness(
  cookies: string,
  data: {
    name: string;
    description: string;
    location: string;
    city: string;
    phone?: string;
  },
): Promise<{ business: Business; cookies: string }> {
  const res = await api<Business>("/businesses", {
    method: "POST",
    body: JSON.stringify(data),
    cookies,
  });
  return { business: res.data, cookies: res.cookies };
}

export async function approveBusiness(
  cookies: string,
  businessId: string,
): Promise<void> {
  await api(`/admin/businesses/${businessId}/approve`, {
    method: "PUT",
    cookies,
  });
}

export async function updateBusiness(
  cookies: string,
  businessId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await api(`/businesses/${businessId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    cookies,
  });
}

// ---------------------------------------------------------------------------
// Service helpers
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  name: string;
  businessId: string;
}

export async function createService(
  cookies: string,
  businessId: string,
  data: {
    name: string;
    description?: string;
    averageTime?: number;
    maxCapacity?: number;
  },
): Promise<{ service: Service; cookies: string }> {
  const res = await api<Service>(`/businesses/${businessId}/services`, {
    method: "POST",
    body: JSON.stringify(data),
    cookies,
  });
  return { service: res.data, cookies: res.cookies };
}

// ---------------------------------------------------------------------------
// Guichet helpers
// ---------------------------------------------------------------------------

export interface Guichet {
  id: string;
  name: string;
  status: string;
}

export async function createGuichet(
  cookies: string,
  businessId: string,
  data: { name: string; serviceId?: string },
): Promise<{ guichet: Guichet; cookies: string }> {
  const res = await api<Guichet>(`/businesses/${businessId}/guichets`, {
    method: "POST",
    body: JSON.stringify(data),
    cookies,
  });
  return { guichet: res.data, cookies: res.cookies };
}

export async function updateGuichetStatus(
  cookies: string,
  businessId: string,
  guichetId: string,
  status: "open" | "closed" | "paused",
): Promise<void> {
  await api(`/businesses/${businessId}/guichets/${guichetId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    cookies,
  });
}

export async function assignWorkerToGuichet(
  cookies: string,
  businessId: string,
  guichetId: string,
  userId: string,
): Promise<void> {
  await api(`/businesses/${businessId}/guichets/${guichetId}/assign-worker`, {
    method: "PUT",
    body: JSON.stringify({ userId }),
    cookies,
  });
}

export async function assignServiceToGuichet(
  cookies: string,
  businessId: string,
  guichetId: string,
  serviceId: string,
): Promise<void> {
  await api(`/businesses/${businessId}/guichets/${guichetId}/assign-service`, {
    method: "PUT",
    body: JSON.stringify({ serviceId }),
    cookies,
  });
}

// ---------------------------------------------------------------------------
// Worker helpers
// ---------------------------------------------------------------------------

export async function addWorker(
  cookies: string,
  businessId: string,
  userId: string,
  role: "worker" | "manager" = "worker",
): Promise<void> {
  await api(`/businesses/${businessId}/workers`, {
    method: "POST",
    body: JSON.stringify({ userId, role }),
    cookies,
  });
}

// ---------------------------------------------------------------------------
// Queue helpers
// ---------------------------------------------------------------------------

export interface QueueEntry {
  id: string;
  position: number;
  status: string;
  serviceId: string;
}

export async function joinQueue(
  cookies: string,
  serviceId: string,
  opts: { groupSize?: number; priority?: string } = {},
): Promise<{ entry: QueueEntry; cookies: string }> {
  const res = await api<QueueEntry>(`/queue/service/${serviceId}/join`, {
    method: "POST",
    body: JSON.stringify({
      groupSize: opts.groupSize ?? 1,
      priority: opts.priority ?? "normal",
    }),
    cookies,
  });
  return { entry: res.data, cookies: res.cookies };
}

export async function leaveQueue(
  cookies: string,
  entryId: string,
): Promise<void> {
  await api(`/queue/entry/${entryId}/leave`, {
    method: "DELETE",
    cookies,
  });
}

export async function callNext(
  cookies: string,
  serviceId: string,
  guichetId: string,
): Promise<{ entry: QueueEntry; cookies: string }> {
  const res = await api<QueueEntry>(`/queue/service/${serviceId}/call-next`, {
    method: "POST",
    body: JSON.stringify({ guichetId }),
    cookies,
  });
  return { entry: res.data, cookies: res.cookies };
}

export async function markServed(
  cookies: string,
  entryId: string,
): Promise<void> {
  await api(`/queue/entry/${entryId}/served`, {
    method: "PUT",
    cookies,
  });
}

export async function markNoShow(
  cookies: string,
  entryId: string,
): Promise<void> {
  await api(`/queue/entry/${entryId}/no-show`, {
    method: "PUT",
    cookies,
  });
}

export async function addWalkIn(
  cookies: string,
  serviceId: string,
  data: { name?: string; phone?: string; groupSize?: number; priority?: string; guichetId: string },
): Promise<{ entry: QueueEntry; cookies: string }> {
  const res = await api<QueueEntry>(`/queue/service/${serviceId}/walk-in`, {
    method: "POST",
    body: JSON.stringify(data),
    cookies,
  });
  return { entry: res.data, cookies: res.cookies };
}

export async function getQueueStatus(
  serviceId: string,
): Promise<{ waitingCount: number; estimatedWait: number }> {
  const { data } = await api<{ waitingCount: number; estimatedWait: number }>(
    `/queue/service/${serviceId}/status`,
  );
  return data;
}

export async function getMyEntries(
  cookies: string,
): Promise<QueueEntry[]> {
  const { data } = await api<QueueEntry[]>("/queue/my-entries", { cookies });
  return data;
}

// ---------------------------------------------------------------------------
// Admin helpers
// ---------------------------------------------------------------------------

export async function updateUserRole(
  cookies: string,
  userId: string,
  role: string,
): Promise<void> {
  await api(`/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
    cookies,
  });
}

// ---------------------------------------------------------------------------
// Feedback helpers
// ---------------------------------------------------------------------------

export async function submitFeedback(
  cookies: string,
  entryId: string,
  data: { rating: number; comment?: string },
): Promise<void> {
  await api(`/feedback/entry/${entryId}`, {
    method: "POST",
    body: JSON.stringify(data),
    cookies,
  });
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function waitForBackend(
  timeoutMs = 30_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  // Try the root endpoint as fallback
  try {
    const res = await fetch(`${API}/`);
    if (res.ok) return;
  } catch {
    // ignore
  }
  throw new Error(`Backend at ${API} did not become ready within ${timeoutMs}ms`);
}

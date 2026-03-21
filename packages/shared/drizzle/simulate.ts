/**
 * War9a Queue Simulator
 *
 * Simulates real-time queue activity by hitting the backend API:
 * - Users join and leave queues
 * - Workers call next and mark served
 *
 * Usage:
 *   ts-node --compiler-options '{"module":"CommonJS"}' simulate.ts [options]
 *
 * Options:
 *   --business    <uuid>   Only simulate services belonging to this business
 *   --service     <uuid>   Only simulate this specific service
 *   --users       <n>      Number of simulated users to authenticate (default: 20)
 *   --join-rate   <0-100>  % of users that attempt to join a queue each tick (default: 30)
 *   --leave-rate  <0-100>  % of queued users that leave each tick (default: 15)
 *   --worker-rate <0-100>  % of workers that call next each tick (default: 50)
 *   --serve-delay <ms>     Fixed ms before marking a called entry as served (default: 2000)
 *   --interval    <ms>     Tick interval in ms (default: 2000)
 *
 * Env:
 *   DATABASE_URL        - postgres connection (to discover services/guichets)
 *   API_URL             - backend base URL (default: https://api.war9a.localhost)
 *   FAKE_USERS_PASSWORD - password for seeded accounts
 */

import "dotenv/config";
import { createDrizzle } from "./db";
import { schema } from "./drizzle";
import { eq, and, inArray } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const PASSWORD = process.env.FAKE_USERS_PASSWORD;
if (!PASSWORD) throw new Error("FAKE_USERS_PASSWORD is required");

const API = process.env.API_URL ?? "https://api.war9a.localhost";
const ORIGIN = process.env.FRONTEND_URL ?? "https://war9a.localhost";
const INTERVAL = Number(process.env.SIM_INTERVAL_MS ?? 2000);
const SIM_USERS = Number(process.env.SIM_USERS ?? 20);

// ─── CLI args ──────────────────────────────────────────────────────────────
function parseArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
}
const FILTER_BUSINESS = parseArg("--business");
const FILTER_SERVICE  = parseArg("--service");

const CLI_USERS       = parseArg("--users");
const CLI_JOIN_RATE   = parseArg("--join-rate");
const CLI_LEAVE_RATE  = parseArg("--leave-rate");
const CLI_WORKER_RATE = parseArg("--worker-rate");
const CLI_SERVE_DELAY = parseArg("--serve-delay");
const CLI_INTERVAL    = parseArg("--interval");

const NUM_USERS    = CLI_USERS       ? Number(CLI_USERS)       : SIM_USERS;
const JOIN_RATE    = CLI_JOIN_RATE   ? Number(CLI_JOIN_RATE)   : 30;   // % of active users that try to join
const LEAVE_RATE   = CLI_LEAVE_RATE  ? Number(CLI_LEAVE_RATE)  : 15;   // % of queued users that leave
const WORKER_RATE  = CLI_WORKER_RATE ? Number(CLI_WORKER_RATE) : 50;   // % of workers that call next
const SERVE_DELAY  = CLI_SERVE_DELAY ? Number(CLI_SERVE_DELAY) : 2000; // ms before marking served
const TICK_MS      = CLI_INTERVAL    ? Number(CLI_INTERVAL)    : INTERVAL;

const db = createDrizzle(DATABASE_URL);

// ─── types ─────────────────────────────────────────────────────────────────

interface Session {
  email: string;
  cookies: string;
  role: string;
}

interface ServiceInfo {
  id: string;
  name: string;
  businessId: string;
  businessName: string;
}

interface GuichetInfo {
  id: string;
  name: string;
  serviceId: string;
  businessId: string;
}

// ─── helpers ───────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function log(tag: string, msg: string) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${tag} ${msg}`);
}

async function apiCall(
  path: string,
  cookies: string,
  method = "GET",
  body?: object,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
        Origin: ORIGIN,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: (err as Error).message };
  }
}

async function signIn(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${API}/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: API },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const cookies = res.headers.getSetCookie?.() ?? [];
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

// ─── main ──────────────────────────────────────────────────────────────────

async function run() {
  const filterLabel = FILTER_SERVICE
    ? `service: ${FILTER_SERVICE.slice(0, 8)}…`
    : FILTER_BUSINESS
    ? `business: ${FILTER_BUSINESS.slice(0, 8)}…`
    : "all businesses";

  console.log(`
╔══════════════════════════════════════════╗
║        War9a Queue Simulator             ║
║  API: ${API.padEnd(35)}║
║  Interval: ${String(TICK_MS + "ms").padEnd(30)}║
║  Simulated users: ${String(NUM_USERS).padEnd(23)}║
║  Join rate: ${String(JOIN_RATE + "%").padEnd(29)}║
║  Leave rate: ${String(LEAVE_RATE + "%").padEnd(28)}║
║  Worker rate: ${String(WORKER_RATE + "%").padEnd(27)}║
║  Serve delay: ${String(SERVE_DELAY + "ms").padEnd(27)}║
║  Scope: ${filterLabel.padEnd(33)}║
╚══════════════════════════════════════════╝
`);

  // ── Discover services and guichets from DB ────────────────────────────────
  log("🔍", "Loading services and guichets from database...");

  const serviceConditions = [];
  if (FILTER_SERVICE)  serviceConditions.push(eq(schema.queueServices.id, FILTER_SERVICE));
  if (FILTER_BUSINESS) serviceConditions.push(eq(schema.queueServices.businessId, FILTER_BUSINESS));

  const dbServices = await db.query.queueServices.findMany({
    with: { business: true },
    where: serviceConditions.length ? and(...serviceConditions) : undefined,
  });

  const serviceIds = dbServices.map((s) => s.id);

  const dbGuichets = serviceIds.length
    ? await db.query.guichets.findMany({
        where: (g) => and(eq(g.status, "open"), inArray(g.serviceId!, serviceIds)),
      })
    : [];

  if (dbServices.length === 0) {
    const hint = FILTER_SERVICE
      ? `No service found with id: ${FILTER_SERVICE}`
      : FILTER_BUSINESS
      ? `No services found for business: ${FILTER_BUSINESS}`
      : "Run 'make db-seed' first.";
    console.error(`❌ ${hint}`);
    process.exit(1);
  }

  const services: ServiceInfo[] = dbServices.map((s) => ({
    id: s.id,
    name: s.name,
    businessId: s.businessId,
    businessName: (s as unknown as { business: { name: string } }).business?.name ?? "?",
  }));

  const guichets: GuichetInfo[] = dbGuichets
    .filter((g) => g.serviceId)
    .map((g) => ({
      id: g.id,
      name: g.name,
      serviceId: g.serviceId!,
      businessId: g.businessId,
    }));

  log("✅", `Found ${services.length} services and ${guichets.length} open guichets`);

  // ── Authenticate users ────────────────────────────────────────────────────
  log("🔑", `Authenticating ${NUM_USERS} users + workers...`);

  const userSessions: Session[] = [];
  const workerSessions: Session[] = [];

  // Sign in regular users (user1..NUM_USERS)
  for (let i = 1; i <= NUM_USERS; i++) {
    const email = i === 1 ? "user@war9a.com" : `user${i}@war9a.test`;
    const cookies = await signIn(email, PASSWORD);
    if (cookies) {
      userSessions.push({ email, cookies, role: "regular" });
    }
  }

  // Sign in workers
  const workerEmails = [
    "worker@war9a.com",
    ...Array.from({ length: 9 }, (_, i) => `worker${i + 2}@war9a.test`),
  ];
  for (const email of workerEmails) {
    const cookies = await signIn(email, PASSWORD);
    if (cookies) {
      workerSessions.push({ email, cookies, role: "worker" });
    }
  }

  log("✅", `${userSessions.length} users, ${workerSessions.length} workers authenticated`);

  if (userSessions.length === 0) {
    console.error("❌ No users authenticated. Make sure the backend is running and the seed ran.");
    process.exit(1);
  }

  // ── Clear all active queue entries before starting ────────────────────────
  log("🧹", "Clearing all active queue entries for simulated users...");
  let cleared = 0;
  for (const user of userSessions) {
    const res = await apiCall("/queue/my-entries", user.cookies);
    if (!res.ok) continue;
    const entries = (res.data as Array<{ id: string; status: string }>) ?? [];
    for (const entry of entries) {
      if (entry.status === "waiting" || entry.status === "called") {
        const del = await apiCall(`/queue/entry/${entry.id}/leave`, user.cookies, "DELETE");
        if (del.ok) cleared++;
      }
    }
  }
  log("✅", `Cleared ${cleared} active entries`);

  // ── State ─────────────────────────────────────────────────────────────────
  // Track which queues each user is currently in: email → Set<serviceId>
  const userQueues = new Map<string, Set<string>>();
  for (const s of userSessions) userQueues.set(s.email, new Set());

  // Track which user owns each entry: entryId → { email, serviceId }
  const entryOwner = new Map<string, { email: string; serviceId: string }>();

  let tick = 0;
  let totalJoins = 0;
  let totalCalls = 0;
  let totalServed = 0;
  let totalLeaves = 0;

  // ── Simulation loop ───────────────────────────────────────────────────────
  console.log("\n🚀  Simulation running... (Ctrl+C to stop)\n");

  const interval = setInterval(async () => {
    tick++;

    // ── User actions ──────────────────────────────────────────────────────
    // Each tick, JOIN_RATE% of users are active
    const activeUsers = userSessions.sort(() => Math.random() - 0.5).slice(0, Math.ceil(userSessions.length * JOIN_RATE / 100));

    for (const user of activeUsers) {
      const inQueues = userQueues.get(user.email) ?? new Set<string>();

      // Decide action: join vs leave based on LEAVE_RATE
      const joinThreshold = 1 - LEAVE_RATE / 100;
      const roll = Math.random();

      if (roll < joinThreshold && inQueues.size < 3) {
        // JOIN a random service not already in
        const available = services.filter((s) => !inQueues.has(s.id));
        if (available.length === 0) continue;
        const svc = pick(available);

        const res = await apiCall(
          `/queue/service/${svc.id}/join`,
          user.cookies,
          "POST",
          { groupSize: pick([1, 1, 2]), priority: pick(["normal", "normal", "priority"]) },
        );

        if (res.ok) {
          inQueues.add(svc.id);
          userQueues.set(user.email, inQueues);
          totalJoins++;
          const joinedId = (res.data as { id?: string }).id;
          if (joinedId) entryOwner.set(joinedId, { email: user.email, serviceId: svc.id });
          log("➡️ ", `${user.email.split("@")[0]} joined "${svc.name}" at ${svc.businessName}`);
        } else {
          log("⚠️ ", `JOIN failed for ${user.email.split("@")[0]} on "${svc.name}": ${res.status} ${JSON.stringify(res.data)}`);
        }
      } else if (inQueues.size > 0) {
        // LEAVE a random queue
        const serviceId = pick([...inQueues]);
        const svc = services.find((s) => s.id === serviceId);

        // Get the entry ID first
        const myEntry = await apiCall(`/queue/my/${serviceId}`, user.cookies);
        if (myEntry.ok && myEntry.data && (myEntry.data as { id?: string }).id) {
          const entryId = (myEntry.data as { id: string }).id;
          const res = await apiCall(`/queue/entry/${entryId}/leave`, user.cookies, "DELETE");
          if (res.ok) {
            inQueues.delete(serviceId);
            userQueues.set(user.email, inQueues);
            entryOwner.delete(entryId);
            totalLeaves++;
            log("⬅️ ", `${user.email.split("@")[0]} left "${svc?.name ?? serviceId}"`);
          } else {
            log("⚠️ ", `LEAVE failed for ${user.email.split("@")[0]}: ${res.status} ${JSON.stringify(res.data)}`);
          }
        }
      }
    }

    // ── Worker actions ────────────────────────────────────────────────────
    // WORKER_RATE% of workers call next each tick
    {
      const activeWorkers = workerSessions.sort(() => Math.random() - 0.5).slice(0, Math.ceil(workerSessions.length * WORKER_RATE / 100));

      for (const worker of activeWorkers) {
        const guichet = pick(guichets);
        const svc = services.find((s) => s.id === guichet.serviceId);
        if (!svc) continue;

        // Call next
        const callRes = await apiCall(
          `/queue/service/${guichet.serviceId}/call-next`,
          worker.cookies,
          "POST",
          { guichetId: guichet.id },
        );

        if (callRes.ok && callRes.data) {
          const entry = callRes.data as { id?: string };
          if (entry.id) {
            totalCalls++;
            log("📢", `${worker.email.split("@")[0]} called next in "${svc.name}" → entry ${entry.id.slice(0, 8)}`);

            // Clear the called user from queue tracking so they can rejoin
            const owner = entryOwner.get(entry.id);
            if (owner) {
              userQueues.get(owner.email)?.delete(owner.serviceId);
              entryOwner.delete(entry.id);
            }

            // Mark served after the configured delay (simulates service time)
            setTimeout(async () => {
              const serveRes = await apiCall(`/queue/entry/${entry.id}/served`, worker.cookies, "PUT");
              if (serveRes.ok) {
                totalServed++;
                log("✅", `Served entry ${entry.id!.slice(0, 8)} in "${svc.name}"`);
              } else {
                log("⚠️ ", `SERVE failed for entry ${entry.id!.slice(0, 8)}: ${serveRes.status} ${JSON.stringify(serveRes.data)}`);
              }
            }, SERVE_DELAY);
          }
        } else if (!callRes.ok && callRes.status !== 404) {
          // 404 is normal when queue is empty — log anything else
          log("⚠️ ", `CALL-NEXT failed for ${worker.email.split("@")[0]} on "${svc.name}": ${callRes.status} ${JSON.stringify(callRes.data)}`);
        }
      }
    }

    // ── Stats every 10 ticks ──────────────────────────────────────────────
    if (tick % 10 === 0) {
      console.log(`\n📊  Tick ${tick} | Joins: ${totalJoins} | Calls: ${totalCalls} | Served: ${totalServed} | Leaves: ${totalLeaves}\n`);
    }
  }, TICK_MS);

  // Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(interval);
    console.log(`\n\n🛑  Simulation stopped.`);
    console.log(`📊  Final stats — Joins: ${totalJoins} | Calls: ${totalCalls} | Served: ${totalServed} | Leaves: ${totalLeaves}`);
    process.exit(0);
  });
}

run().catch((err) => {
  console.error("❌  Simulator failed:", err);
  process.exit(1);
});

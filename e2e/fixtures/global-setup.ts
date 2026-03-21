/**
 * Global setup — executed once by the "setup" Playwright project before
 * any test project runs.
 *
 * 1. Waits for the backend to be healthy.
 * 2. Creates four test users (customer, owner, worker, admin).
 * 3. Promotes the admin user.
 * 4. Creates a test business → service → guichet.
 * 5. Approves the business & assigns the worker.
 * 6. Saves authenticated browser storage-state files so tests can
 *    start already logged in.
 */
import { test as setup, expect } from "@playwright/test";
import {
  waitForBackend,
  signUp,
  signIn,
  getMe,
  createBusiness,
  createService,
  createGuichet,
  addWorker,
  approveBusiness,
  updateBusiness,
  updateGuichetStatus,
  assignWorkerToGuichet,
  assignServiceToGuichet,
  updateUserRole,
} from "./api-helpers";
import {
  TEST_CUSTOMER,
  TEST_OWNER,
  TEST_WORKER,
  TEST_ADMIN,
  TEST_BUSINESS,
  TEST_SERVICE,
  TEST_GUICHET,
} from "./test-data";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.resolve(__dirname, "../.auth");

// Ensure .auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Helper: sign up (ignore duplicate errors) then sign in, return cookies
// ---------------------------------------------------------------------------
async function ensureUser(
  name: string,
  email: string,
  password: string,
): Promise<{ cookies: string; userId: string }> {
  try {
    await signUp(name, email, password);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // If user already exists, that's fine
    if (!msg.includes("409") && !msg.includes("already") && !msg.includes("exists") && !msg.includes("422")) {
      throw e;
    }
  }
  const { cookies } = await signIn(email, password);
  const me = await getMe(cookies);
  return { cookies, userId: me.id };
}

// ---------------------------------------------------------------------------
// Helper: save cookies as a Playwright storageState JSON file
// ---------------------------------------------------------------------------
function saveStorageState(cookies: string, filePath: string): void {
  const cookieObjects = cookies.split("; ").filter(Boolean).map((pair) => {
    const [name, ...rest] = pair.split("=");
    return {
      name: name.trim(),
      value: rest.join("=").trim(),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
      expires: Date.now() / 1000 + 86400, // 24h
    };
  });

  const state = {
    cookies: cookieObjects,
    origins: [],
  };

  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

// ---------------------------------------------------------------------------
// Setup test
// ---------------------------------------------------------------------------
setup("seed test data and save auth states", async ({ }) => {
  setup.setTimeout(120_000);

  // 1. Wait for backend
  console.log("  Waiting for backend...");
  await waitForBackend(60_000);
  console.log("  Backend is ready");

  // 2. Create users
  console.log("  Creating test users...");
  const customer = await ensureUser(TEST_CUSTOMER.name, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
  const owner = await ensureUser(TEST_OWNER.name, TEST_OWNER.email, TEST_OWNER.password);
  const worker = await ensureUser(TEST_WORKER.name, TEST_WORKER.email, TEST_WORKER.password);
  const admin = await ensureUser(TEST_ADMIN.name, TEST_ADMIN.email, TEST_ADMIN.password);

  // 3. Promote admin (may fail if already promoted — ignore)
  console.log("  Promoting admin user...");
  try {
    // First promote admin to founder so they can promote others
    await updateUserRole(admin.cookies, admin.userId, "admin");
  } catch {
    // Ignore — may already be admin, or may need DB seed for first admin
    console.log("  (admin promotion skipped — may need manual DB seed for first admin)");
  }

  // Re-sign-in admin to refresh session with new role
  try {
    const { cookies: adminCookies } = await signIn(TEST_ADMIN.email, TEST_ADMIN.password);
    admin.cookies = adminCookies;
  } catch {
    // keep existing cookies
  }

  // 4. Promote owner role
  console.log("  Promoting owner user...");
  try {
    await updateUserRole(admin.cookies, owner.userId, "owner");
    // Re-sign-in to pick up new role
    const { cookies: ownerCookies } = await signIn(TEST_OWNER.email, TEST_OWNER.password);
    owner.cookies = ownerCookies;
  } catch {
    console.log("  (owner promotion skipped)");
  }

  // 5. Promote worker role
  console.log("  Promoting worker user...");
  try {
    await updateUserRole(admin.cookies, worker.userId, "worker");
    const { cookies: workerCookies } = await signIn(TEST_WORKER.email, TEST_WORKER.password);
    worker.cookies = workerCookies;
  } catch {
    console.log("  (worker promotion skipped)");
  }

  // 6. Create test business (as owner)
  console.log("  Creating test business...");
  let businessId: string | undefined;
  let businessSlug: string | undefined;
  let serviceId: string | undefined;
  let guichetId: string | undefined;

  try {
    const { business } = await createBusiness(owner.cookies, TEST_BUSINESS);
    businessId = business.id;
    businessSlug = business.slug;
    console.log(`  Business created: ${business.slug} (${business.id})`);

    // Approve business
    try {
      await approveBusiness(admin.cookies, businessId);
      console.log("  Business approved");
    } catch {
      console.log("  (business approval skipped)");
    }

    // Open business
    try {
      await updateBusiness(owner.cookies, businessId, { isOpen: true });
      console.log("  Business opened");
    } catch {
      console.log("  (business open skipped)");
    }

    // Create service
    const { service } = await createService(owner.cookies, businessId, TEST_SERVICE);
    serviceId = service.id;
    console.log(`  Service created: ${service.id}`);

    // Create guichet
    const { guichet } = await createGuichet(owner.cookies, businessId, {
      name: TEST_GUICHET.name,
      serviceId: service.id,
    });
    guichetId = guichet.id;
    console.log(`  Guichet created: ${guichet.id}`);

    // Open guichet
    try {
      await updateGuichetStatus(owner.cookies, businessId, guichetId, "open");
    } catch {
      console.log("  (guichet open skipped)");
    }

    // Add worker to business
    try {
      await addWorker(owner.cookies, businessId, worker.userId, "worker");
      console.log("  Worker added to business");
    } catch {
      console.log("  (worker add skipped — may already be added)");
    }

    // Assign worker to guichet
    try {
      await assignWorkerToGuichet(owner.cookies, businessId, guichetId, worker.userId);
      console.log("  Worker assigned to guichet");
    } catch {
      console.log("  (worker guichet assignment skipped)");
    }

    // Assign service to guichet
    try {
      await assignServiceToGuichet(owner.cookies, businessId, guichetId, serviceId);
      console.log("  Service assigned to guichet");
    } catch {
      console.log("  (service guichet assignment skipped)");
    }
  } catch (e) {
    console.log(`  (business setup error: ${e instanceof Error ? e.message : e})`);
  }

  // 7. Save storage states
  console.log("  Saving auth storage states...");
  saveStorageState(customer.cookies, path.join(AUTH_DIR, "customer.json"));
  saveStorageState(owner.cookies, path.join(AUTH_DIR, "owner.json"));
  saveStorageState(worker.cookies, path.join(AUTH_DIR, "worker.json"));
  saveStorageState(admin.cookies, path.join(AUTH_DIR, "admin.json"));

  // Also save test IDs for other tests to use
  const testIds = {
    customerId: customer.userId,
    ownerId: owner.userId,
    workerId: worker.userId,
    adminId: admin.userId,
    businessId,
    businessSlug,
    serviceId,
    guichetId,
  };
  fs.writeFileSync(
    path.join(AUTH_DIR, "test-ids.json"),
    JSON.stringify(testIds, null, 2),
  );
  console.log("  Global setup complete!");
});

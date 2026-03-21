import "dotenv/config";
import * as bcrypt from "bcrypt";
import { eq, and } from "drizzle-orm";
import { createDrizzle } from "./db";
import { schema } from "./drizzle";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const PASSWORD = process.env.FAKE_USERS_PASSWORD;
if (!PASSWORD) throw new Error("FAKE_USERS_PASSWORD is required");

const db = createDrizzle(DATABASE_URL);

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱  Starting War9a seed...\n");

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // ── 1. Core test accounts ─────────────────────────────────────────────────
  console.log("👤  Creating core test accounts...");

  const coreUsers = [
    { email: "user@war9a.com",    username: "war9a_user",    displayName: "Regular User",     role: "regular" as const, city: "annaba" },
    { email: "owner@war9a.com",   username: "war9a_owner",   displayName: "Business Owner",   role: "owner"   as const, city: "annaba" },
    { email: "manager@war9a.com", username: "war9a_manager", displayName: "Queue Manager",    role: "manager" as const, city: "annaba" },
    { email: "worker@war9a.com",  username: "war9a_worker",  displayName: "Front Desk Worker",role: "worker"  as const, city: "annaba" },
    { email: "admin@war9a.com",   username: "war9a_admin",   displayName: "Platform Admin",   role: "admin"   as const, city: "annaba" },
  ];

  const createdUsers: Record<string, typeof schema.users.$inferSelect> = {};

  for (const u of coreUsers) {
    const [user] = await db
      .insert(schema.users)
      .values({ ...u, emailVerified: true, usernameNeedsSetup: false })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { displayName: u.displayName, role: u.role, updatedAt: new Date() },
      })
      .returning();
    createdUsers[u.email] = user;
    await upsertAccount(user.id, hashedPassword);
    console.log(`   ✔ ${u.email}  (${u.role})`);
  }

  // ── 2. 100 fake regular users ─────────────────────────────────────────────
  console.log("\n👥  Creating 100 fake users...");

  const cities = ["annaba", "algiers", "oran", "constantine", "setif", "batna", "blida", "bejaia", "tlemcen", "biskra"];
  const firstNames = ["Youssef","Amira","Karim","Nadia","Mohamed","Sara","Amine","Fatima","Rayan","Lina","Bilal","Hajar","Walid","Meriem","Tarek","Imane","Samir","Asma","Reda","Yasmine","Omar","Sirine","Ayoub","Malak","Hamza","Rima","Adel","Wafa","Rachid","Dalila"];
  const lastNames = ["Benali","Khelifi","Boudjenane","Mebarki","Hadj","Cherif","Bouazza","Amrani","Bensalem","Meziane","Ferhat","Ziani","Laabidi","Mansouri","Djamel","Ouali","Brahim","Touati","Saadi","Boudiaf"];

  const fakeUserIds: string[] = [];

  for (let i = 1; i <= 100; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const displayName = `${first} ${last}`;
    const username = `${first.toLowerCase()}_${last.toLowerCase()}_${i}`;
    const email = `user${i}@war9a.test`;
    const city = pick(cities);

    const [user] = await db
      .insert(schema.users)
      .values({ email, username, displayName, role: "regular", emailVerified: true, usernameNeedsSetup: false, city })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { displayName, updatedAt: new Date() },
      })
      .returning();
    fakeUserIds.push(user.id);
    await upsertAccount(user.id, hashedPassword);
  }
  console.log(`   ✔ 100 users created`);

  // ── 3. 5 extra owner accounts ─────────────────────────────────────────────
  console.log("\n🏪  Creating extra owner accounts...");

  const ownerIds: string[] = [createdUsers["owner@war9a.com"].id];

  for (let i = 2; i <= 5; i++) {
    const email = `owner${i}@war9a.test`;
    const [user] = await db
      .insert(schema.users)
      .values({ email, username: `owner_${i}`, displayName: `Owner ${i}`, role: "owner", emailVerified: true, usernameNeedsSetup: false, city: pick(cities) })
      .onConflictDoUpdate({ target: schema.users.email, set: { updatedAt: new Date() } })
      .returning();
    ownerIds.push(user.id);
    await upsertAccount(user.id, hashedPassword);
    console.log(`   ✔ ${email}`);
  }

  // ── 4. 10 worker accounts ─────────────────────────────────────────────────
  console.log("\n👷  Creating worker accounts...");

  const workerIds: string[] = [createdUsers["worker@war9a.com"].id];

  for (let i = 2; i <= 10; i++) {
    const email = `worker${i}@war9a.test`;
    const [user] = await db
      .insert(schema.users)
      .values({ email, username: `worker_${i}`, displayName: `Worker ${i}`, role: "worker", emailVerified: true, usernameNeedsSetup: false, city: pick(cities) })
      .onConflictDoUpdate({ target: schema.users.email, set: { updatedAt: new Date() } })
      .returning();
    workerIds.push(user.id);
    await upsertAccount(user.id, hashedPassword);
    console.log(`   ✔ ${email}`);
  }

  // ── 5. Categories ─────────────────────────────────────────────────────────
  console.log("\n🏷️   Creating categories...");

  const categoriesData = [
    { name: "Post Offices",       slug: "post-offices",       description: "Postal and shipping services",        iconName: "Mail"     },
    { name: "Government Offices", slug: "government-offices", description: "Official government services",        iconName: "Scroll"   },
    { name: "Banking Services",   slug: "banking-services",   description: "Banks and financial institutions",    iconName: "Wallet"   },
    { name: "Healthcare",         slug: "healthcare",         description: "Hospitals, clinics and pharmacies",   iconName: "Cross"    },
    { name: "Barbers",            slug: "barbers",            description: "Barbershops and hair salons",         iconName: "Scissors" },
    { name: "Repair Services",    slug: "repair-services",    description: "Electronics and appliance repair",    iconName: "Wrench"   },
    { name: "Telecoms",           slug: "telecoms",           description: "Mobile and internet providers",       iconName: "Wifi"     },
    { name: "Education",          slug: "education",          description: "Schools, universities and training",  iconName: "GraduationCap" },
  ];

  const createdCategories: Record<string, typeof schema.categories.$inferSelect> = {};

  for (const cat of categoriesData) {
    const [category] = await db
      .insert(schema.categories)
      .values(cat)
      .onConflictDoUpdate({ target: schema.categories.slug, set: { description: cat.description, updatedAt: new Date() } })
      .returning();
    createdCategories[cat.slug] = category;
    console.log(`   ✔ ${cat.name}`);
  }

  // ── 6. 30 businesses ──────────────────────────────────────────────────────
  console.log("\n🏢  Creating 30 businesses...");

  const businessTemplates = [
    // Post Offices (5)
    { name: "Annaba Central Post Office",    city: "annaba",        lat: "36.9000", lon: "7.7667",  cat: "post-offices",       avgTime: 8,  featured: true  },
    { name: "Algiers Main Post Office",      city: "algiers",       lat: "36.7372", lon: "3.0869",  cat: "post-offices",       avgTime: 7,  featured: true  },
    { name: "Oran Post Office",              city: "oran",          lat: "35.6976", lon: "-0.6337", cat: "post-offices",       avgTime: 9,  featured: false },
    { name: "Constantine Post Office",       city: "constantine",   lat: "36.3650", lon: "6.6147",  cat: "post-offices",       avgTime: 6,  featured: false },
    { name: "Sétif Post Office",             city: "setif",         lat: "36.1898", lon: "5.4108",  cat: "post-offices",       avgTime: 8,  featured: false },
    // Banking (6)
    { name: "CPA Bank Annaba",               city: "annaba",        lat: "36.9002", lon: "7.7680",  cat: "banking-services",   avgTime: 12, featured: false },
    { name: "BNA Algiers Branch",            city: "algiers",       lat: "36.7400", lon: "3.0900",  cat: "banking-services",   avgTime: 15, featured: true  },
    { name: "BEA Oran Branch",               city: "oran",          lat: "35.6900", lon: "-0.6400", cat: "banking-services",   avgTime: 10, featured: false },
    { name: "CCP Constantine",               city: "constantine",   lat: "36.3600", lon: "6.6100",  cat: "banking-services",   avgTime: 8,  featured: false },
    { name: "Société Générale Algérie Blida",city: "blida",         lat: "36.4700", lon: "2.8300",  cat: "banking-services",   avgTime: 12, featured: false },
    { name: "BADR Bank Béjaïa",              city: "bejaia",        lat: "36.7500", lon: "5.0600",  cat: "banking-services",   avgTime: 11, featured: false },
    // Government (5)
    { name: "Annaba DAIRA Office",           city: "annaba",        lat: "36.8950", lon: "7.7650",  cat: "government-offices", avgTime: 20, featured: false },
    { name: "Algiers Wilaya HQ",             city: "algiers",       lat: "36.7300", lon: "3.0800",  cat: "government-offices", avgTime: 25, featured: false },
    { name: "Oran Civil Registry",           city: "oran",          lat: "35.7000", lon: "-0.6300", cat: "government-offices", avgTime: 18, featured: false },
    { name: "Batna Prefecture Office",       city: "batna",         lat: "35.5600", lon: "6.1700",  cat: "government-offices", avgTime: 22, featured: false },
    { name: "Tlemcen City Hall",             city: "tlemcen",       lat: "34.8800", lon: "-1.3200", cat: "government-offices", avgTime: 20, featured: false },
    // Healthcare (5)
    { name: "CHU Annaba Hospital",           city: "annaba",        lat: "36.9100", lon: "7.7700",  cat: "healthcare",         avgTime: 30, featured: true  },
    { name: "Mustapha Pacha Hospital",       city: "algiers",       lat: "36.7500", lon: "3.0600",  cat: "healthcare",         avgTime: 35, featured: true  },
    { name: "Oran CPMC Clinic",              city: "oran",          lat: "35.7100", lon: "-0.6200", cat: "healthcare",         avgTime: 25, featured: false },
    { name: "Biskra Health Center",          city: "biskra",        lat: "34.8500", lon: "5.7300",  cat: "healthcare",         avgTime: 20, featured: false },
    { name: "Constantine Dermatology Clinic",city: "constantine",   lat: "36.3700", lon: "6.6200",  cat: "healthcare",         avgTime: 28, featured: false },
    // Barbers (4)
    { name: "Annaba Classic Barber",         city: "annaba",        lat: "36.9050", lon: "7.7650",  cat: "barbers",            avgTime: 25, featured: false },
    { name: "Algiers Style Cut",             city: "algiers",       lat: "36.7350", lon: "3.0850",  cat: "barbers",            avgTime: 20, featured: false },
    { name: "Oran Trend Barber",             city: "oran",          lat: "35.6950", lon: "-0.6350", cat: "barbers",            avgTime: 22, featured: false },
    { name: "Setif Precision Cuts",          city: "setif",         lat: "36.1850", lon: "5.4150",  cat: "barbers",            avgTime: 18, featured: false },
    // Telecoms (3)
    { name: "Algérie Télécom Annaba",        city: "annaba",        lat: "36.9020", lon: "7.7660",  cat: "telecoms",           avgTime: 15, featured: false },
    { name: "Djezzy Store Algiers",          city: "algiers",       lat: "36.7380", lon: "3.0880",  cat: "telecoms",           avgTime: 10, featured: false },
    { name: "Mobilis Oran Agency",           city: "oran",          lat: "35.6980", lon: "-0.6320", cat: "telecoms",           avgTime: 12, featured: false },
    // Repair (2)
    { name: "TechFix Annaba",                city: "annaba",        lat: "36.9030", lon: "7.7670",  cat: "repair-services",    avgTime: 40, featured: false },
    { name: "ElectroPro Algiers",            city: "algiers",       lat: "36.7360", lon: "3.0860",  cat: "repair-services",    avgTime: 35, featured: false },
  ];

  const createdBusinesses: typeof schema.businesses.$inferSelect[] = [];
  let ownerIdx = 0;

  for (const biz of businessTemplates) {
    const ownerId = ownerIds[ownerIdx % ownerIds.length];
    ownerIdx++;

    const bizSlug = slug(biz.name);
    const [business] = await db
      .insert(schema.businesses)
      .values({
        name: biz.name,
        slug: bizSlug,
        ownerId,
        description: `${biz.name} — quality service in ${biz.city}.`,
        phone: `+213 ${rand(30, 39)} ${rand(10, 99)} ${rand(10, 99)} ${rand(10, 99)}`,
        location: `${rand(1, 200)} Rue ${pick(["Principale","de la Paix","du 1er Novembre","Mohamed Khemisti","Ben M'hidi"])} , ${biz.city}`,
        city: biz.city,
        latitude: biz.lat,
        longitude: biz.lon,
        status: "active",
        isOpen: true,
        featured: biz.featured,
        maxQueueCapacity: 300,
      })
      .onConflictDoUpdate({
        target: schema.businesses.slug,
        set: { status: "active", isOpen: true, updatedAt: new Date() },
      })
      .returning();

    createdBusinesses.push(business);

    // Category link
    const cat = createdCategories[biz.cat];
    if (cat) {
      await db.insert(schema.businessCategories)
        .values({ businessId: business.id, categoryId: cat.id })
        .onConflictDoNothing();
    }

    // Business hours
    const hours = [
      { day: 0, open: "08:00", close: "17:00", closed: true  },
      { day: 1, open: "08:00", close: "17:00", closed: false },
      { day: 2, open: "08:00", close: "17:00", closed: false },
      { day: 3, open: "08:00", close: "17:00", closed: false },
      { day: 4, open: "08:00", close: "17:00", closed: false },
      { day: 5, open: "08:00", close: "12:00", closed: false },
      { day: 6, open: "08:00", close: "17:00", closed: true  },
    ];
    for (const h of hours) {
      await db.insert(schema.businessHours)
        .values({ businessId: business.id, dayOfWeek: h.day, openTime: h.open, closeTime: h.close, isClosed: h.closed })
        .onConflictDoNothing();
    }

    console.log(`   ✔ ${biz.name} (${biz.city})`);
  }

  // ── 7. Services & guichets per business ───────────────────────────────────
  console.log("\n📋  Creating services and guichets...");

  const serviceTemplates: Record<string, Array<{ name: string; avgTime: number; maxCap: number; desc: string }>> = {
    "post-offices":       [
      { name: "Parcel Pickup",    avgTime: 8,  maxCap: 150, desc: "Collect registered parcels" },
      { name: "Bill Payments",    avgTime: 5,  maxCap: 200, desc: "Pay utility bills and subscriptions" },
      { name: "CCP Transactions", avgTime: 7,  maxCap: 120, desc: "CCP account deposits and withdrawals" },
    ],
    "banking-services":   [
      { name: "Account Operations", avgTime: 12, maxCap: 100, desc: "Deposits, withdrawals and enquiries" },
      { name: "Loan Services",      avgTime: 20, maxCap: 50,  desc: "Loan applications and credit" },
    ],
    "government-offices": [
      { name: "Document Requests", avgTime: 20, maxCap: 80,  desc: "Birth, marriage and identity documents" },
      { name: "General Enquiries", avgTime: 15, maxCap: 100, desc: "General information and guidance" },
    ],
    "healthcare":         [
      { name: "General Consultation", avgTime: 30, maxCap: 60, desc: "General practitioner appointments" },
      { name: "Specialist Referral",  avgTime: 20, maxCap: 40, desc: "Specialist doctor referrals" },
      { name: "Lab Results",          avgTime: 10, maxCap: 80, desc: "Pick up lab and test results" },
    ],
    "barbers":            [
      { name: "Haircut",    avgTime: 25, maxCap: 30, desc: "Standard haircut service" },
      { name: "Beard Trim", avgTime: 15, maxCap: 30, desc: "Beard shaping and trimming" },
    ],
    "telecoms":           [
      { name: "SIM & Subscriptions", avgTime: 10, maxCap: 80,  desc: "New SIMs and plan upgrades" },
      { name: "Technical Support",   avgTime: 15, maxCap: 50,  desc: "Device and network issues" },
    ],
    "repair-services":    [
      { name: "Device Intake",  avgTime: 15, maxCap: 40, desc: "Drop off device for repair" },
      { name: "Device Pickup",  avgTime: 10, maxCap: 40, desc: "Collect repaired device" },
    ],
  };

  const allServices: typeof schema.queueServices.$inferSelect[] = [];
  const allGuichets: typeof schema.guichets.$inferSelect[] = [];
  let workerIdx = 0;

  for (const biz of createdBusinesses) {
    const cat = Object.entries(createdCategories).find(([, c]) =>
      businessTemplates.find((b) => slug(b.name) === biz.slug)?.cat === Object.keys(createdCategories).find((k) => createdCategories[k].id === c.id)
    );

    // Find the category slug for this business
    const bizTemplate = businessTemplates.find((b) => slug(b.name) === biz.slug);
    const catSlug = bizTemplate?.cat ?? "post-offices";
    const svcTemplates = serviceTemplates[catSlug] ?? serviceTemplates["post-offices"];

    for (const svcTpl of svcTemplates) {
      const [svc] = await db.insert(schema.queueServices)
        .values({ name: svcTpl.name, businessId: biz.id, averageTime: String(svcTpl.avgTime), maxCapacity: svcTpl.maxCap, description: svcTpl.desc })
        .onConflictDoNothing()
        .returning();
      if (!svc) continue;
      allServices.push(svc);

      // 1–2 guichets per service
      const guichetCount = rand(1, 2);
      for (let g = 1; g <= guichetCount; g++) {
        const assignedWorker = workerIds[workerIdx % workerIds.length];
        workerIdx++;
        const [guichet] = await db.insert(schema.guichets)
          .values({ name: `Guichet ${g}`, businessId: biz.id, serviceId: svc.id, status: "open", currentWorkerId: assignedWorker })
          .onConflictDoNothing()
          .returning();
        if (guichet) allGuichets.push(guichet);

        // Assign worker to business
        await db.insert(schema.businessWorkers)
          .values({ userId: assignedWorker, businessId: biz.id, role: "worker", score: 0 })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`   ✔ ${allServices.length} services, ${allGuichets.length} guichets`);

  // Assign manager to all businesses
  const managerId = createdUsers["manager@war9a.com"].id;
  for (const biz of createdBusinesses) {
    await db.insert(schema.businessWorkers)
      .values({ userId: managerId, businessId: biz.id, role: "manager", score: 0 })
      .onConflictDoNothing();
  }

  // ── 8. Seed waiting queue entries ─────────────────────────────────────────
  console.log("\n🎫  Seeding queue entries...");

  let entriesCreated = 0;
  const usedCombos = new Set<string>();

  for (const userId of fakeUserIds) {
    // Each user joins 1–3 random queues
    const numQueues = rand(1, 3);
    const shuffled = [...allServices].sort(() => Math.random() - 0.5);

    for (let q = 0; q < numQueues && q < shuffled.length; q++) {
      const svc = shuffled[q];
      const key = `${userId}:${svc.id}`;
      if (usedCombos.has(key)) continue;
      usedCombos.add(key);

      const [entry] = await db.insert(schema.queueEntries)
        .values({
          serviceId: svc.id,
          userId,
          groupSize: pick([1, 1, 1, 2, 3]),
          priority: pick(["normal", "normal", "normal", "priority"]),
          status: "waiting",
          estimatedWaitMinutes: rand(5, 45),
          present: Math.random() > 0.2,
        })
        .onConflictDoNothing()
        .returning();

      if (entry) {
        await db.insert(schema.queueEvents)
          .values({ entryId: entry.id, eventType: "joined", actorId: userId })
          .onConflictDoNothing();
        entriesCreated++;
      }
    }
  }

  console.log(`   ✔ ${entriesCreated} queue entries created`);

  // ── 9. E2E Queue Lifecycle Test Data ──────────────────────────────────────
  //
  // Fixed accounts and a clean business used exclusively by the Playwright
  // queue-lifecycle test. Queue entries for this business are wiped on every
  // seed run so tests always start from a known empty state.
  //
  console.log("\n🧪  Creating E2E queue lifecycle test data...");

  // 5 customer accounts
  const e2eUserEmails = Array.from({ length: 5 }, (_, i) => `e2e-user${i + 1}@war9a.test`);
  for (let i = 0; i < 5; i++) {
    await db
      .insert(schema.users)
      .values({
        email: e2eUserEmails[i],
        username: `e2e_user_${i + 1}`,
        displayName: `E2E User ${i + 1}`,
        role: "regular",
        emailVerified: true,
        usernameNeedsSetup: false,
        city: "annaba",
      })
      .onConflictDoUpdate({ target: schema.users.email, set: { updatedAt: new Date() } });

    const [u] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, e2eUserEmails[i]));
    await upsertAccount(u.id, hashedPassword);
  }

  // 1 dedicated worker account
  const E2E_WORKER_EMAIL = "e2e-qworker@war9a.test";
  await db
    .insert(schema.users)
    .values({
      email: E2E_WORKER_EMAIL,
      username: "e2e_qworker",
      displayName: "E2E Queue Worker",
      role: "worker",
      emailVerified: true,
      usernameNeedsSetup: false,
      city: "annaba",
    })
    .onConflictDoUpdate({ target: schema.users.email, set: { updatedAt: new Date() } });
  const [e2eWorkerRow] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, E2E_WORKER_EMAIL));
  await upsertAccount(e2eWorkerRow.id, hashedPassword);

  // Business
  const E2E_BIZ_SLUG = "e2e-queue-clinic";
  const [e2eBiz] = await db
    .insert(schema.businesses)
    .values({
      name: "E2E Queue Clinic",
      slug: E2E_BIZ_SLUG,
      ownerId: createdUsers["owner@war9a.com"].id,
      description: "Dedicated business for Playwright queue lifecycle tests.",
      location: "1 Test Street, Annaba",
      city: "annaba",
      status: "active",
      isOpen: true,
      maxQueueCapacity: 300,
    })
    .onConflictDoUpdate({
      target: schema.businesses.slug,
      set: { status: "active", isOpen: true, updatedAt: new Date() },
    })
    .returning();

  // Service
  const [e2eService] = await db
    .insert(schema.queueServices)
    .values({
      name: "Queue Test Service",
      businessId: e2eBiz.id,
      averageTime: "5",
      maxCapacity: 50,
      description: "Service for E2E queue tests",
    })
    .onConflictDoNothing()
    .returning();

  // If service already existed, fetch it
  const resolvedService = e2eService ?? (
    await db
      .select()
      .from(schema.queueServices)
      .where(and(
        eq(schema.queueServices.businessId, e2eBiz.id),
        eq(schema.queueServices.name, "Queue Test Service"),
      ))
  )[0];

  // Assign worker to business
  await db
    .insert(schema.businessWorkers)
    .values({ userId: e2eWorkerRow.id, businessId: e2eBiz.id, role: "worker", score: 0 })
    .onConflictDoNothing();

  // Guichet
  const [e2eGuichet] = await db
    .insert(schema.guichets)
    .values({
      name: "Test Window",
      businessId: e2eBiz.id,
      serviceId: resolvedService.id,
      status: "open",
      currentWorkerId: e2eWorkerRow.id,
    })
    .onConflictDoNothing()
    .returning();

  const resolvedGuichet = e2eGuichet ?? (
    await db
      .select()
      .from(schema.guichets)
      .where(and(
        eq(schema.guichets.businessId, e2eBiz.id),
        eq(schema.guichets.name, "Test Window"),
      ))
  )[0];

  // Wipe any leftover queue entries so tests always start from an empty queue
  await db
    .delete(schema.queueEntries)
    .where(eq(schema.queueEntries.serviceId, resolvedService.id));

  console.log(`   ✔ Business: ${E2E_BIZ_SLUG}`);
  console.log(`   ✔ Service:  ${resolvedService.id}`);
  console.log(`   ✔ Guichet:  ${resolvedGuichet.id}`);
  console.log(`   ✔ Worker:   ${E2E_WORKER_EMAIL}`);
  console.log(`   ✔ Users:    e2e-user1–5@war9a.test`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
✅  Seed complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Core Test Accounts (password: ${PASSWORD})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  user@war9a.com     → regular user
  owner@war9a.com    → business owner
  manager@war9a.com  → manager (all businesses)
  worker@war9a.com   → worker
  admin@war9a.com    → platform admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Extra accounts (password: ${PASSWORD})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  user1–100@war9a.test        → 100 regular users
  owner2–5@war9a.test         → 4 extra owners
  worker2–10@war9a.test       → 9 extra workers
  e2e-user1–5@war9a.test      → E2E queue test users
  e2e-qworker@war9a.test      → E2E queue test worker
  Business slug: e2e-queue-clinic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${createdBusinesses.length} businesses across ${Object.keys(createdCategories).length} categories
  ${allServices.length} queue services
  ${allGuichets.length} guichets
  ${entriesCreated} active queue entries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  process.exit(0);
}

async function upsertAccount(userId: string, hashedPassword: string) {
  await db.delete(schema.accounts).where(
    and(eq(schema.accounts.userId, userId), eq(schema.accounts.providerId, "credential"))
  );
  await db.insert(schema.accounts).values({
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPassword,
  });
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});

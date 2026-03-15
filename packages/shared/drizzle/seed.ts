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

// ─── helpers ───────────────────────────────────────────────────────────────

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱  Starting War9a seed...\n");

  const hashedPassword = await hashPassword(PASSWORD);

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("👤  Creating users...");

  const usersData = [
    {
      email: "user@war9a.com",
      username: "war9a_user",
      displayName: "Regular User",
      role: "regular" as const,
    },
    {
      email: "owner@war9a.com",
      username: "war9a_owner",
      displayName: "Business Owner",
      role: "owner" as const,
    },
    {
      email: "manager@war9a.com",
      username: "war9a_manager",
      displayName: "Queue Manager",
      role: "manager" as const,
    },
    {
      email: "worker@war9a.com",
      username: "war9a_worker",
      displayName: "Front Desk Worker",
      role: "worker" as const,
    },
    {
      email: "admin@war9a.com",
      username: "war9a_admin",
      displayName: "Platform Admin",
      role: "admin" as const,
    },
  ];

  const createdUsers: Record<string, typeof schema.users.$inferSelect> = {};

  for (const u of usersData) {
    const [user] = await db
      .insert(schema.users)
      .values({
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        emailVerified: true,
        usernameNeedsSetup: false,
        city: "annaba",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          displayName: u.displayName,
          role: u.role,
          emailVerified: true,
          usernameNeedsSetup: false,
          updatedAt: new Date(),
        },
      })
      .returning();
    createdUsers[u.email] = user;
    console.log(`   ✔ ${u.email}  (${u.role})`);
  }

  // ── 2. Auth accounts (credential provider) ────────────────────────────────
  console.log("\n🔑  Creating auth accounts...");

  for (const u of usersData) {
    const user = createdUsers[u.email];
    // Remove any existing credential account first, then re-insert
    await db
      .delete(schema.accounts)
      .where(
        and(
          eq(schema.accounts.userId, user.id),
          eq(schema.accounts.providerId, "credential"),
        ),
      );
    await db.insert(schema.accounts).values({
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    });
    console.log(`   ✔ credential account for ${u.email}`);
  }

  // ── 3. Categories ─────────────────────────────────────────────────────────
  console.log("\n🏷️   Creating categories...");

  const categoriesData = [
    {
      name: "Post Offices",
      slug: "post-offices",
      description: "Postal and shipping services",
      iconName: "Mail",
    },
    {
      name: "Government Offices",
      slug: "government-offices",
      description: "Official government services",
      iconName: "Scroll",
    },
    {
      name: "Banking Services",
      slug: "banking-services",
      description: "Banks and financial institutions",
      iconName: "Wallet",
    },
    {
      name: "Healthcare",
      slug: "healthcare",
      description: "Hospitals, clinics and pharmacies",
      iconName: "Cross",
    },
    {
      name: "Barbers",
      slug: "barbers",
      description: "Barbershops and hair salons",
      iconName: "Scissors",
    },
    {
      name: "Repair Services",
      slug: "repair-services",
      description: "Electronics and appliance repair",
      iconName: "Wrench",
    },
  ];

  const createdCategories: Record<string, typeof schema.categories.$inferSelect> = {};

  for (const cat of categoriesData) {
    const [category] = await db
      .insert(schema.categories)
      .values(cat)
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { description: cat.description, updatedAt: new Date() },
      })
      .returning();
    createdCategories[cat.slug] = category;
    console.log(`   ✔ ${cat.name}`);
  }

  // ── 4. Businesses ─────────────────────────────────────────────────────────
  console.log("\n🏢  Creating businesses...");

  const ownerId = createdUsers["owner@war9a.com"].id;

  const businessesData = [
    {
      name: "Annaba Central Post Office",
      slug: "annaba-central-post",
      description:
        "The main post office in central Annaba. Parcel pickup, bill payments, and more.",
      phone: "+213 38 86 00 00",
      location: "Rue Mohamed Khemisti, Annaba",
      city: "annaba",
      latitude: "36.9000",
      longitude: "7.7667",
      categorySlug: "post-offices",
      featured: true,
    },
    {
      name: "CPA Bank Annaba",
      slug: "cpa-bank-annaba",
      description:
        "Crédit Populaire d'Algérie branch. Deposits, withdrawals and account management.",
      phone: "+213 38 86 11 11",
      location: "Boulevard du 1er Novembre, Annaba",
      city: "annaba",
      latitude: "36.9002",
      longitude: "7.7680",
      categorySlug: "banking-services",
      featured: false,
    },
  ];

  const createdBusinesses: Record<string, typeof schema.businesses.$inferSelect> = {};

  for (const biz of businessesData) {
    const [business] = await db
      .insert(schema.businesses)
      .values({
        name: biz.name,
        slug: biz.slug,
        ownerId,
        description: biz.description,
        phone: biz.phone,
        location: biz.location,
        city: biz.city,
        latitude: biz.latitude,
        longitude: biz.longitude,
        status: "active",
        isOpen: true,
        featured: biz.featured,
        maxQueueCapacity: 300,
      })
      .onConflictDoUpdate({
        target: schema.businesses.slug,
        set: {
          status: "active",
          isOpen: true,
          updatedAt: new Date(),
        },
      })
      .returning();
    createdBusinesses[biz.slug] = business;
    console.log(`   ✔ ${biz.name}`);

    // Link category
    const cat = createdCategories[biz.categorySlug];
    if (cat) {
      await db
        .insert(schema.businessCategories)
        .values({ businessId: business.id, categoryId: cat.id })
        .onConflictDoNothing();
    }

    // Business hours (Sun closed, Mon-Sat 08:00-17:00)
    const hours = [
      { day: 0, open: "08:00", close: "17:00", closed: true },
      { day: 1, open: "08:00", close: "17:00", closed: false },
      { day: 2, open: "08:00", close: "17:00", closed: false },
      { day: 3, open: "08:00", close: "17:00", closed: false },
      { day: 4, open: "08:00", close: "17:00", closed: false },
      { day: 5, open: "08:00", close: "12:00", closed: false },
      { day: 6, open: "08:00", close: "17:00", closed: true },
    ];

    for (const h of hours) {
      await db
        .insert(schema.businessHours)
        .values({
          businessId: business.id,
          dayOfWeek: h.day,
          openTime: h.open,
          closeTime: h.close,
          isClosed: h.closed,
        })
        .onConflictDoNothing();
    }
  }

  // ── 5. Queue services ─────────────────────────────────────────────────────
  console.log("\n📋  Creating queue services...");

  const postOffice = createdBusinesses["annaba-central-post"];
  const bank = createdBusinesses["cpa-bank-annaba"];

  const servicesData = [
    {
      name: "Parcel Pickup",
      businessId: postOffice.id,
      averageTime: "8",
      maxCapacity: 150,
      description: "Collect registered parcels and packages",
    },
    {
      name: "Bill Payments",
      businessId: postOffice.id,
      averageTime: "5",
      maxCapacity: 200,
      description: "Pay utility bills, subscriptions and fines",
    },
    {
      name: "Account Operations",
      businessId: bank.id,
      averageTime: "12",
      maxCapacity: 100,
      description: "Deposits, withdrawals and account enquiries",
    },
    {
      name: "Loan Services",
      businessId: bank.id,
      averageTime: "20",
      maxCapacity: 50,
      description: "Loan applications and credit consultations",
    },
  ];

  const createdServices: typeof schema.queueServices.$inferSelect[] = [];

  for (const svc of servicesData) {
    const [service] = await db
      .insert(schema.queueServices)
      .values(svc)
      .onConflictDoNothing()
      .returning();
    if (service) {
      createdServices.push(service);
      console.log(`   ✔ ${svc.name}  (${svc.name})`);
    }
  }

  // ── 6. Guichets ───────────────────────────────────────────────────────────
  console.log("\n🪟  Creating guichets...");

  const guichetsData = [
    { name: "Guichet 1", businessId: postOffice.id, serviceIdx: 0 },
    { name: "Guichet 2", businessId: postOffice.id, serviceIdx: 1 },
    { name: "Guichet 1", businessId: bank.id, serviceIdx: 2 },
    { name: "Guichet 2", businessId: bank.id, serviceIdx: 3 },
  ];

  const createdGuichets: typeof schema.guichets.$inferSelect[] = [];

  for (const g of guichetsData) {
    const service = createdServices[g.serviceIdx];
    const [guichet] = await db
      .insert(schema.guichets)
      .values({
        name: g.name,
        businessId: g.businessId,
        serviceId: service?.id ?? null,
        status: "open",
      })
      .onConflictDoNothing()
      .returning();
    if (guichet) {
      createdGuichets.push(guichet);
      console.log(`   ✔ ${g.name} @ ${g.businessId === postOffice.id ? "Post Office" : "Bank"}`);
    }
  }

  // ── 7. Business workers (manager + worker linked to Post Office) ───────────
  console.log("\n👷  Assigning staff to businesses...");

  const managerId = createdUsers["manager@war9a.com"].id;
  const workerId = createdUsers["worker@war9a.com"].id;

  await db
    .insert(schema.businessWorkers)
    .values([
      {
        userId: managerId,
        businessId: postOffice.id,
        role: "manager",
        score: 0,
      },
      {
        userId: workerId,
        businessId: postOffice.id,
        role: "worker",
        score: 0,
      },
      {
        userId: managerId,
        businessId: bank.id,
        role: "manager",
        score: 0,
      },
    ])
    .onConflictDoNothing();

  console.log("   ✔ manager@war9a.com → Post Office (manager) + Bank (manager)");
  console.log("   ✔ worker@war9a.com  → Post Office (worker)");

  // ── 8. Sample queue entries ───────────────────────────────────────────────
  console.log("\n🎫  Adding sample queue entries...");

  const regularUserId = createdUsers["user@war9a.com"].id;

  if (createdServices.length > 0) {
    // user is currently in the post office parcel queue
    const [entry] = await db
      .insert(schema.queueEntries)
      .values({
        serviceId: createdServices[0].id,
        userId: regularUserId,
        groupSize: 1,
        priority: "normal",
        status: "waiting",
        position: 1,
        estimatedWaitMinutes: 8,
        present: true,
      })
      .onConflictDoNothing()
      .returning();

    if (entry) {
      await db
        .insert(schema.queueEvents)
        .values({
          entryId: entry.id,
          eventType: "joined",
          actorId: regularUserId,
        })
        .onConflictDoNothing();
      console.log("   ✔ user@war9a.com is waiting in Parcel Pickup queue (pos 1)");
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
✅  Seed complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Test Accounts (password: ${PASSWORD})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  user@war9a.com     → regular user
  owner@war9a.com    → business owner (Post Office + Bank)
  manager@war9a.com  → manager (Post Office + Bank)
  worker@war9a.com   → worker (Post Office)
  admin@war9a.com    → platform admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Businesses
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /business/annaba-central-post  → Post Office (featured, open)
  /business/cpa-bank-annaba      → CPA Bank (open)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});

import * as dotenv from "dotenv";
import { db } from ".";
import { eq, sql } from "drizzle-orm";
import {
  users,
  businesses,
  services,
  categories,
  tags,
  business_categories,
  business_services,
  business_guichets,
  guichets,
  guichet_services,
  queue_entries,
  queue_logs,
  business_logs,
  guichet_logs,
  security_event_logs,
  user_feedback,
  user_logs,
  user_businesses,
  business_workers,
  guichet_workers,
  userRole,
  guichetStatus,
  queuedStatus,
} from "./schema";
import { randomUUID, createHash } from "crypto";

// Load env
dotenv.config();

const hashPassword = (plain: string) => {
  // Use a simple hash placeholder; replace with your actual auth layer if needed
  // If you have a users.auth_password column, adapt accordingly.
  // Since schema has no password column, we’ll store it in user_logs as a note for demo (or skip).
  return createHash("sha256").update(plain).digest("hex");
};

const now = new Date();

// Helper: insert if not exists by column = value, else return existing row
async function upsertBy<T extends { [k: string]: any }>(
  table: any,
  where: any,
  data: any,
) {
  const found = await db.select().from(table).where(where).limit(1);
  if (found.length) return found[0];
  const inserted = await db.insert(table).values(data).returning();
  return inserted[0];
}

async function main() {
  const connectionString =
    process.env.DATABASE_CONNECTION_STRING_TX ||
    process.env.DATABASE_CONNECTION_STRING;

  if (!connectionString) {
    console.error(
      "❌ DATABASE_CONNECTION_STRING_TX or DATABASE_CONNECTION_STRING is required",
    );
    process.exit(1);
  }

  console.log("🌱 Seeding...");

  // 0) Truncate all public tables before seeding
  // Keep this list in sync with your schema exports
  const tables = [
    "notifications",
    "security_event_logs",
    "user_feedback",
    "user_logs",
    "queue_logs",
    "business_logs",
    "guichet_logs",
    "guichet_workers",
    "user_businesses",
    "business_categories",
    "business_services",
    "guichet_services",
    "business_guichets",
    "queue_entries",
    "tags",
    "categories",
    "guichets",
    "services",
    "businesses",
    "users",
  ];

  await db.transaction(async (tx) => {
    const stmt = sql.raw(
      `TRUNCATE TABLE ${tables
        .map((t) => `"public"."${t}"`)
        .join(", ")} RESTART IDENTITY CASCADE;`,
    );
    await tx.execute(stmt);
  });
  // 1) Users
  const passwordHash = hashPassword("123123123");
  // Note: schema doesn’t have a password field; store a note in user_logs to document the seed password.
  const uOwner = await upsertBy(users, eq(users.username, "owner_ali"), {
    user_id: "ab5712ad-2a25-4783-b630-801da84f3827",
    username: "owner_ali",
    role: "owner",
    city: "annaba",
    longitude_user: "7.7667",
    latitude_user: "36.9000",
    created_at: now,
    updated_at: now,
  });

  const uManager = await upsertBy(users, eq(users.username, "mgr_sami"), {
    user_id: "4acd5edd-e9e2-4fdd-af40-f03b68dc5c89",
    username: "mgr_sami",
    role: "manager",
    city: "annaba",
    longitude_user: "7.7667",
    latitude_user: "36.9001",
    created_at: now,
    updated_at: now,
  });

  const uWorker1 = await upsertBy(users, eq(users.username, "worker_nadir"), {
    user_id: "4ac6f1bd-a4b3-424c-9ad3-a5e422ef41c0",
    username: "worker_nadir",
    role: "worker",
    city: "annaba",
    longitude_user: "7.7668",
    latitude_user: "36.9002",
    created_at: now,
    updated_at: now,
  });

  const uWorker2 = await upsertBy(users, eq(users.username, "worker_sara"), {
    user_id: randomUUID(),
    username: "worker_sara",
    role: "worker",
    city: "annaba",
    longitude_user: "7.7669",
    latitude_user: "36.9003",
    created_at: now,
    updated_at: now,
  });

  const uCustomer1 = await upsertBy(users, eq(users.username, "cust_ryad"), {
    user_id: randomUUID(),
    username: "cust_ryad",
    role: "regular",
    city: "annaba",
    longitude_user: "7.7670",
    latitude_user: "36.9004",
    created_at: now,
    updated_at: now,
  });

  const uCustomer2 = await upsertBy(users, eq(users.username, "cust_amina"), {
    user_id: "c3f8f107-8f65-4f29-8f67-de44cb0a0586",
    username: "cust_amina",
    role: "regular",
    city: "annaba",
    longitude_user: "7.7671",
    latitude_user: "36.9005",
    created_at: now,
    updated_at: now,
  });

  // Document the seed password (since there’s no password column)
  await db.insert(user_logs).values([
    {
      log_id: randomUUID(),
      user_id: uOwner.user_id,
      activity_description: `Seeded user with password sha256:${passwordHash}`,
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
    {
      log_id: randomUUID(),
      user_id: uManager.user_id,
      activity_description: `Seeded user with password sha256:${passwordHash}`,
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  // 2) Business
  const b1 = await upsertBy(businesses, eq(businesses.slug, "annaba-hub"), {
    business_id: randomUUID(),
    name: "Annaba Hub",
    owner_id: uOwner.user_id,
    slug: "annaba-hub",
    phone: "+213555000111",
    description: "Citizen services and appointments.",
    avgWaitTime: 12,
    location: "Center Ville, Annaba",
    latitude: "36.9008",
    longitude: "7.7675",
    city: "annaba",
    zip_code: "A23000",
    image: null,
    cover_image: null,
    featured: true,
    created_at: now,
    updated_at: now,
  });

  const b2 = await upsertBy(businesses, eq(businesses.slug, "el-bazar-tech"), {
    business_id: randomUUID(),
    name: "El Bazar Tech",
    owner_id: uOwner.user_id,
    slug: "el-bazar-tech",
    phone: "+213555000222",
    description: "Electronics and device service center.",
    avgWaitTime: 8,
    location: "Boulevard Ibn Khaldoun, Annaba",
    latitude: "36.9012",
    longitude: "7.7681",
    city: "annaba",
    zip_code: "A23000",
    image: null,
    cover_image: null,
    featured: false,
    created_at: now,
    updated_at: now,
  });

  // 3) Categories
  const cGov = await upsertBy(categories, eq(categories.name, "Government"), {
    category_id: randomUUID(),
    name: "Government",
    created_at: now,
    updated_at: now,
  });

  const cServices = await upsertBy(
    categories,
    eq(categories.name, "Services"),
    {
      category_id: randomUUID(),
      name: "Services",
      created_at: now,
      updated_at: now,
    },
  );

  // 4) Tags
  const tFast = await upsertBy(tags, eq(tags.name, "fast-track"), {
    tag_id: randomUUID(),
    name: "fast-track",
    created_at: now,
    updated_at: now,
  });

  const tDocs = await upsertBy(tags, eq(tags.name, "documents"), {
    tag_id: randomUUID(),
    name: "documents",
    created_at: now,
    updated_at: now,
  });

  // 5) Services
  const sPassport = await upsertBy(services, eq(services.name, "Passport"), {
    service_id: randomUUID(),
    name: "Passport",
    author: uOwner.user_id,
    average_time: "15.5",
    created_at: now,
    updated_at: now,
  });

  const sIDCard = await upsertBy(services, eq(services.name, "ID Card"), {
    service_id: randomUUID(),
    name: "ID Card",
    author: uOwner.user_id,
    average_time: "10.0",
    created_at: now,
    updated_at: now,
  });

  const sPhoneRepair = await upsertBy(
    services,
    eq(services.name, "Phone Repair"),
    {
      service_id: randomUUID(),
      name: "Phone Repair",
      author: uManager.user_id,
      average_time: "25.0",
      created_at: now,
      updated_at: now,
    },
  );

  // 6) Business <-> Categories
  await db
    .insert(business_categories)
    .values([
      {
        business_id: b1.business_id,
        category_id: cGov.category_id,
        created_at: now,
        updated_at: now,
      },
      {
        business_id: b1.business_id,
        category_id: cServices.category_id,
        created_at: now,
        updated_at: now,
      },
      {
        business_id: b2.business_id,
        category_id: cServices.category_id,
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflictDoNothing();

  // 7) Business <-> Services
  await db
    .insert(business_services)
    .values([
      {
        business_id: b1.business_id,
        service_id: sPassport.service_id,
        created_at: now,
        updated_at: now,
      },
      {
        business_id: b1.business_id,
        service_id: sIDCard.service_id,
        created_at: now,
        updated_at: now,
      },
      {
        business_id: b2.business_id,
        service_id: sPhoneRepair.service_id,
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflictDoNothing();

  // 8) Guichets
  const g1 = await upsertBy(guichets, eq(guichets.name, "Front Desk A"), {
    guichet_id: randomUUID(),
    name: "Front Desk A",
    status: "open",
    created_at: now,
    updated_at: now,
  });

  const g2 = await upsertBy(guichets, eq(guichets.name, "Front Desk B"), {
    guichet_id: randomUUID(),
    name: "Front Desk B",
    status: "paused",
    created_at: now,
    updated_at: now,
  });

  // 9) Business <-> Guichets
  await db
    .insert(business_guichets)
    .values([
      {
        business_guichet_id: randomUUID(),
        business_id: b1.business_id,
        guichet_id: g1.guichet_id,
        assignment_date: now,
        additional_attribute: "Gov paperwork",
        created_at: now,
        updated_at: now,
      },
      {
        business_guichet_id: randomUUID(),
        business_id: b1.business_id,
        guichet_id: g2.guichet_id,
        assignment_date: now,
        additional_attribute: "Overflow",
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflictDoNothing();

  // 10) Guichet <-> Services
  await db
    .insert(guichet_services)
    .values([
      {
        id: randomUUID(),
        guichet_id: g1.guichet_id,
        service_id: sPassport.service_id,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        guichet_id: g2.guichet_id,
        service_id: sIDCard.service_id,
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflictDoNothing();

  // 11) User <-> Businesses (roles inside a business)
  await db
    .insert(user_businesses)
    .values([
      {
        user_id: uOwner.user_id,
        business_id: b1.business_id,
        role: "owner",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: uManager.user_id,
        business_id: b1.business_id,
        role: "manager",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: uWorker1.user_id,
        business_id: b1.business_id,
        role: "worker",
        created_at: now,
        updated_at: now,
      },
      {
        user_id: uWorker2.user_id,
        business_id: b2.business_id,
        role: "worker",
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflictDoNothing();

  // 12) Business workers table
  const bw1 = await upsertBy(
    business_workers,
    eq(business_workers.user_id, uWorker1.user_id),
    {
      worker_id: randomUUID(),
      user_id: uWorker1.user_id,
      role: "worker",
      score: 5,
      business_id: b1.business_id,
      created_at: now,
      updated_at: now,
    },
  );

  const bw2 = await upsertBy(
    business_workers,
    eq(business_workers.user_id, uWorker2.user_id),
    {
      worker_id: randomUUID(),
      user_id: uWorker2.user_id,
      role: "worker",
      score: 3,
      business_id: b2.business_id,
      created_at: now,
      updated_at: now,
    },
  );

  // 13) Guichet workers (current_worker_id must be unique)
  await db
    .insert(guichet_workers)
    .values([
      {
        guichet_id: g1.guichet_id,
        current_worker_id: uWorker1.user_id,
      },
    ])
    .onConflictDoNothing();

  // 14) Queue entries
  await db
    .insert(queue_entries)
    .values([
      {
        entry_id: randomUUID(),
        service_id: sPassport.service_id,
        user_id: uCustomer1.user_id,
        entry_time: now,
        status: "waiting",
        present: true,
        created_at: now,
        updated_at: now,
      },
      {
        entry_id: randomUUID(),
        service_id: sIDCard.service_id,
        user_id: uCustomer2.user_id,
        entry_time: now,
        status: "waiting",
        present: false,
        created_at: now,
        updated_at: now,
      },
      {
        entry_id: randomUUID(),
        service_id: sPhoneRepair.service_id,
        user_id: uCustomer1.user_id,
        entry_time: now,
        status: "left",
        present: false,
        created_at: now,
        updated_at: now,
      },
    ])
    .onConflictDoNothing();

  // 15) Logs
  await db.insert(queue_logs).values([
    {
      log_id: randomUUID(),
      service_id: sPassport.service_id,
      activity_description: "Customer checked in",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
    {
      log_id: randomUUID(),
      service_id: sIDCard.service_id,
      activity_description: "Ticket printed",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  await db.insert(business_logs).values([
    {
      log_id: randomUUID(),
      business_id: b1.business_id,
      activity_description: "Daily open",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  await db.insert(guichet_logs).values([
    {
      log_id: randomUUID(),
      guichet_id: g1.guichet_id,
      activity_description: "Assigned worker",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  await db.insert(security_event_logs).values([
    {
      log_id: randomUUID(),
      event_type: "seed",
      description: "Initial seed completed",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  await db.insert(user_feedback).values([
    {
      feedback_id: randomUUID(),
      user_id: uCustomer1.user_id,
      feedback: "Service was quick and smooth.",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  await db.insert(user_logs).values([
    {
      log_id: randomUUID(),
      user_id: uCustomer2.user_id,
      activity_description: "Joined queue for ID card",
      timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ]);

  console.log("✅ Seed done");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });

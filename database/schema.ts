import {
  integer,
  text,
  timestamp,
  boolean,
  pgTable,
  uuid,
  pgEnum,
  unique,
  decimal,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "regular",
  "owner",
  "manager",
  "worker",
  "super",
  "admin",
  "founder",
]); // Enum for user roles

const guichetStatus = pgEnum("guichet_status", ["open", "closed", "paused"]); // Enum for Guichet Status
const queuedStatus = pgEnum("queued_status", ["waiting", "passed", "left"]); // Enum for Queue Entry Status

export const users = pgTable("users", {
  user_id: uuid("user_id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  role: userRole("role").default("regular"), // Using the role enum
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const businesses = pgTable("businesses", {
  business_id: uuid("business_id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  owner_id: uuid("owner_id")
    .references(() => users.user_id)
    .notNull(),
  slug: text("slug").notNull().unique(),
  phone: text("phone"),
  description: text("description").notNull(),
  avgWaitTime: integer("avgWaitTime").default(0),
  location: text("location").notNull(),
  city: text("city").notNull().default("annaba"),
  zip_code: text("zipcode").notNull().default("A23000"),
  featured: boolean("featured").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// export const queues = pgTable("queues", {
//   queue_id: uuid("queue_id").defaultRandom().primaryKey(),
//   business_id: uuid("business_id")
//     .references(() => businesses.business_id)
//     .notNull(),
//   service_id: uuid("service_id").references(() => services.service_id),
//   name: text("name"),
//   capacity: integer("capacity").default(2000).notNull(),
//   ai_enabled: boolean("ai_enabled").default(false),
//   created_at: timestamp("created_at").defaultNow().notNull(),
//   updated_at: timestamp("updated_at").defaultNow().notNull(),
// });

export const services = pgTable("services", {
  service_id: uuid("service_id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  author: uuid("author").references(() => users.user_id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  average_time: decimal("average_time").default("0"),
});

export const guichets = pgTable("guichets", {
  guichet_id: uuid("guichet_id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: guichetStatus("guichet_status").default("open"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const guichet_services = pgTable("guichet_services", {
  id: uuid("gs_id").defaultRandom().primaryKey(),
  guichet_id: uuid("guichet_id")
    .references(() => guichets.guichet_id)
    .unique(),
  service_id: uuid("service_id").references(() => services.service_id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const business_services = pgTable("business_services", {
  business_id: uuid("business_id").references(() => businesses.business_id),
  service_id: uuid("service_id")
    .references(() => services.service_id)
    .unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const queue_entries = pgTable(
  "queue_entries",
  {
    entry_id: uuid("entry_id").defaultRandom().primaryKey(),
    service_id: uuid("service_id")
      .references(() => services.service_id)
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.user_id, { onDelete: "cascade" })
      .notNull(),
    entry_time: timestamp("entry_time").defaultNow().notNull(),
    status: queuedStatus("status").default("waiting"),
    present: boolean("present").default(false),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueConstraint: unique().on(table.user_id, table.service_id),
    };
  },
);

export const queue_logs = pgTable("queue_logs", {
  log_id: uuid("log_id").defaultRandom().primaryKey(),
  service_id: uuid("service_id").references(() => services.service_id),
  activity_description: text("activity_description"),
  timestamp: timestamp("timestamp").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const business_logs = pgTable("business_logs", {
  log_id: uuid("log_id").defaultRandom().primaryKey(),
  business_id: uuid("business_id").references(() => businesses.business_id),
  activity_description: text("activity_description"),
  timestamp: timestamp("timestamp").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  category_id: uuid("category_id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const business_categories = pgTable("business_categories", {
  business_id: uuid("business_id").references(() => businesses.business_id),
  category_id: uuid("category_id").references(() => categories.category_id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  tag_id: uuid("tag_id").defaultRandom().primaryKey(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const user_businesses = pgTable("user_businesses", {
  user_id: uuid("user_id").references(() => users.user_id),
  business_id: uuid("business_id").references(() => businesses.business_id),
  role: userRole("role").default("worker"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const guichet_workers = pgTable("guichet_workers", {
  guichet_id: uuid("guichet_id").references(() => guichets.guichet_id),
  current_worker_id: uuid("worker_id")
    .references(() => users.user_id)
    .unique(),
});

export const business_workers = pgTable("workers", {
  worker_id: uuid("worker_id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => users.user_id, {
      onDelete: "cascade",
    })
    .unique(),
  role: userRole("role").default("worker"),
  score: integer("score").default(0),
  business_id: uuid("business_id").references(() => businesses.business_id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const guichet_logs = pgTable("guichet_logs", {
  log_id: uuid("log_id").defaultRandom().primaryKey(),
  guichet_id: uuid("guichet_id").references(() => guichets.guichet_id),
  activity_description: text("activity_description"),
  timestamp: timestamp("timestamp").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const security_event_logs = pgTable("security_event_logs", {
  log_id: uuid("log_id").defaultRandom().primaryKey(),
  event_type: text("event_type"),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const user_feedback = pgTable("user_feedback", {
  feedback_id: uuid("feedback_id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
  }),
  feedback: text("feedback"),
  timestamp: timestamp("timestamp").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const user_logs = pgTable("user_logs", {
  log_id: uuid("log_id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
  }),
  activity_description: text("activity_description"),
  timestamp: timestamp("timestamp").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const business_guichets = pgTable("business_guichets", {
  business_guichet_id: uuid("business_guichet_id").defaultRandom().primaryKey(),
  business_id: uuid("business_id").references(() => businesses.business_id),
  guichet_id: uuid("guichet_id").references(() => guichets.guichet_id),
  assignment_date: timestamp("assignment_date").defaultNow(),
  additional_attribute: text("additional_attribute"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// export const business_managers = pgTable("managers", {
//   manager_id: uuid("manager_id").defaultRandom().primaryKey(),
//   user_id: uuid("user_id").references(() => users.user_id, {
//     onDelete: "cascade",
//   }),
//   business_id: uuid("business_id").references(() => businesses.business_id),
//   created_at: timestamp("created_at").defaultNow(),
//   updated_at: timestamp("updated_at").defaultNow(),
// });

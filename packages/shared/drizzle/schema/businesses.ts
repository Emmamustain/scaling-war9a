import {
  integer,
  text,
  timestamp,
  boolean,
  pgTable,
  uuid,
  numeric,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const businessStatus = pgEnum("business_status", [
  "pending",
  "active",
  "suspended",
  "rejected",
]);

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").unique().notNull(),
    ownerId: uuid("owner_id")
      .references(() => users.id)
      .notNull(),
    slug: text("slug").notNull().unique(),
    phone: text("phone"),
    description: text("description").notNull().default(""),
    avgWaitTime: integer("avg_wait_time").default(0),
    location: text("location").notNull().default(""),
    latitude: numeric("latitude").default("0"),
    longitude: numeric("longitude").default("0"),
    city: text("city").notNull().default("annaba"),
    zipCode: text("zip_code").default(""),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    featured: boolean("featured").default(false).notNull(),
    status: businessStatus("status").default("pending").notNull(),
    maxQueueCapacity: integer("max_queue_capacity").default(500),
    isOpen: boolean("is_open").default(false).notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("businesses_owner_idx").on(table.ownerId),
    index("businesses_city_featured_idx").on(table.city, table.featured),
    index("businesses_slug_idx").on(table.slug),
    index("businesses_status_idx").on(table.status),
  ],
);

export const businessBranches = pgTable("business_branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  iconName: text("icon_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessCategories = pgTable("business_categories", {
  businessId: uuid("business_id")
    .references(() => businesses.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessHours = pgTable("business_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  isClosed: boolean("is_closed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessLogs = pgTable("business_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").references(() => businesses.id),
  actorId: uuid("actor_id").references(() => users.id),
  activityDescription: text("activity_description"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

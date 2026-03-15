"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessLogs = exports.businessHours = exports.businessCategories = exports.categories = exports.businessBranches = exports.businesses = exports.businessStatus = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.businessStatus = (0, pg_core_1.pgEnum)("business_status", [
    "pending",
    "active",
    "suspended",
    "rejected",
]);
exports.businesses = (0, pg_core_1.pgTable)("businesses", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").unique().notNull(),
    ownerId: (0, pg_core_1.uuid)("owner_id")
        .references(() => users_1.users.id)
        .notNull(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
    phone: (0, pg_core_1.text)("phone"),
    description: (0, pg_core_1.text)("description").notNull().default(""),
    avgWaitTime: (0, pg_core_1.integer)("avg_wait_time").default(0),
    location: (0, pg_core_1.text)("location").notNull().default(""),
    latitude: (0, pg_core_1.numeric)("latitude").default("0"),
    longitude: (0, pg_core_1.numeric)("longitude").default("0"),
    city: (0, pg_core_1.text)("city").notNull().default("annaba"),
    zipCode: (0, pg_core_1.text)("zip_code").default(""),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    coverUrl: (0, pg_core_1.text)("cover_url"),
    featured: (0, pg_core_1.boolean)("featured").default(false).notNull(),
    status: (0, exports.businessStatus)("status").default("pending").notNull(),
    maxQueueCapacity: (0, pg_core_1.integer)("max_queue_capacity").default(500),
    isOpen: (0, pg_core_1.boolean)("is_open").default(false).notNull(),
    parentId: (0, pg_core_1.uuid)("parent_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("businesses_owner_idx").on(table.ownerId),
    (0, pg_core_1.index)("businesses_city_featured_idx").on(table.city, table.featured),
    (0, pg_core_1.index)("businesses_slug_idx").on(table.slug),
    (0, pg_core_1.index)("businesses_status_idx").on(table.status),
]);
exports.businessBranches = (0, pg_core_1.pgTable)("business_branches", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    parentId: (0, pg_core_1.uuid)("parent_id")
        .notNull()
        .references(() => exports.businesses.id, { onDelete: "cascade" }),
    branchId: (0, pg_core_1.uuid)("branch_id")
        .notNull()
        .references(() => exports.businesses.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    iconName: (0, pg_core_1.text)("icon_name"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.businessCategories = (0, pg_core_1.pgTable)("business_categories", {
    businessId: (0, pg_core_1.uuid)("business_id")
        .references(() => exports.businesses.id, { onDelete: "cascade" })
        .notNull(),
    categoryId: (0, pg_core_1.uuid)("category_id")
        .references(() => exports.categories.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.businessHours = (0, pg_core_1.pgTable)("business_hours", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)("business_id")
        .notNull()
        .references(() => exports.businesses.id, { onDelete: "cascade" }),
    dayOfWeek: (0, pg_core_1.integer)("day_of_week").notNull(),
    openTime: (0, pg_core_1.text)("open_time").notNull(),
    closeTime: (0, pg_core_1.text)("close_time").notNull(),
    isClosed: (0, pg_core_1.boolean)("is_closed").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.businessLogs = (0, pg_core_1.pgTable)("business_logs", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)("business_id").references(() => exports.businesses.id),
    actorId: (0, pg_core_1.uuid)("actor_id").references(() => users_1.users.id),
    activityDescription: (0, pg_core_1.text)("activity_description"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
//# sourceMappingURL=businesses.js.map
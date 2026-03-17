"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.userRole = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userRole = (0, pg_core_1.pgEnum)("user_role", [
    "regular",
    "owner",
    "manager",
    "worker",
    "super",
    "admin",
    "founder",
]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    displayName: (0, pg_core_1.text)("display_name"),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)("email_verified").notNull().default(false),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    role: (0, exports.userRole)("role").default("regular").notNull(),
    city: (0, pg_core_1.text)("city").default("annaba"),
    longitude: (0, pg_core_1.numeric)("longitude").default("0"),
    latitude: (0, pg_core_1.numeric)("latitude").default("0"),
    phone: (0, pg_core_1.text)("phone"),
    isBanned: (0, pg_core_1.boolean)("is_banned").notNull().default(false),
    banReason: (0, pg_core_1.text)("ban_reason"),
    usernameNeedsSetup: (0, pg_core_1.boolean)("username_needs_setup").notNull().default(false),
    preferredLanguage: (0, pg_core_1.text)("preferred_language").default("fr"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("users_email_idx").on(table.email),
    (0, pg_core_1.index)("users_username_idx").on(table.username),
    (0, pg_core_1.index)("users_role_idx").on(table.role),
]);
//# sourceMappingURL=users.js.map
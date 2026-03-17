import {
  text,
  timestamp,
  boolean,
  pgTable,
  uuid,
  pgEnum,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "regular",
  "owner",
  "manager",
  "worker",
  "super",
  "admin",
  "founder",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull().unique(),
    displayName: text("display_name"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    avatarUrl: text("avatar_url"),
    role: userRole("role").default("regular").notNull(),
    city: text("city").default("annaba"),
    longitude: numeric("longitude").default("0"),
    latitude: numeric("latitude").default("0"),
    phone: text("phone"),
    isBanned: boolean("is_banned").notNull().default(false),
    banReason: text("ban_reason"),
    usernameNeedsSetup: boolean("username_needs_setup").notNull().default(false),
    preferredLanguage: text("preferred_language").default("fr"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    index("users_role_idx").on(table.role),
  ],
);

import {
  text,
  timestamp,
  boolean,
  pgTable,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationType = pgEnum("notification_type", [
  "queue_called",
  "queue_position",
  "queue_joined",
  "appointment_reminder",
  "business_announcement",
  "system",
  "admin",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    toUserId: uuid("to_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: notificationType("type").default("system").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    resourceType: text("resource_type"),
    resourceId: uuid("resource_id"),
    consumed: boolean("consumed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(table.toUserId),
    index("notifications_consumed_idx").on(table.consumed),
  ],
);

export const securityEventLogs = pgTable("security_event_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type"),
  userId: uuid("user_id").references(() => users.id),
  description: text("description"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

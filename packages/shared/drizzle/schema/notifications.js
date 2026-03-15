"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityEventLogs = exports.notifications = exports.notificationType = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.notificationType = (0, pg_core_1.pgEnum)("notification_type", [
    "queue_called",
    "queue_position",
    "queue_joined",
    "appointment_reminder",
    "business_announcement",
    "system",
    "admin",
]);
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    toUserId: (0, pg_core_1.uuid)("to_user_id")
        .references(() => users_1.users.id, { onDelete: "cascade" })
        .notNull(),
    type: (0, exports.notificationType)("type").default("system").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    resourceType: (0, pg_core_1.text)("resource_type"),
    resourceId: (0, pg_core_1.uuid)("resource_id"),
    consumed: (0, pg_core_1.boolean)("consumed").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("notifications_user_idx").on(table.toUserId),
    (0, pg_core_1.index)("notifications_consumed_idx").on(table.consumed),
]);
exports.securityEventLogs = (0, pg_core_1.pgTable)("security_event_logs", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    eventType: (0, pg_core_1.text)("event_type"),
    userId: (0, pg_core_1.uuid)("user_id").references(() => users_1.users.id),
    description: (0, pg_core_1.text)("description"),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
//# sourceMappingURL=notifications.js.map
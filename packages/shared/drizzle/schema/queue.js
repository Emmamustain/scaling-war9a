"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerSessions = exports.serviceFeedback = exports.appointments = exports.queueEvents = exports.queueEntries = exports.guichets = exports.queueServices = exports.priorityLevel = exports.queueEventType = exports.appointmentStatus = exports.queuedStatus = exports.guichetStatus = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
const businesses_1 = require("./businesses");
exports.guichetStatus = (0, pg_core_1.pgEnum)("guichet_status", [
    "open",
    "closed",
    "paused",
]);
exports.queuedStatus = (0, pg_core_1.pgEnum)("queued_status", [
    "waiting",
    "called",
    "passed",
    "left",
    "skipped",
    "no_show",
]);
exports.appointmentStatus = (0, pg_core_1.pgEnum)("appointment_status", [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
]);
exports.queueEventType = (0, pg_core_1.pgEnum)("queue_event_type", [
    "joined",
    "called",
    "served",
    "left",
    "skipped",
    "no_show",
    "requeued",
]);
exports.priorityLevel = (0, pg_core_1.pgEnum)("priority_level", [
    "normal",
    "priority",
    "urgent",
]);
exports.queueServices = (0, pg_core_1.pgTable)("queue_services", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    businessId: (0, pg_core_1.uuid)("business_id")
        .references(() => businesses_1.businesses.id, { onDelete: "cascade" })
        .notNull(),
    averageTime: (0, pg_core_1.decimal)("average_time").default("0"),
    maxCapacity: (0, pg_core_1.integer)("max_capacity").default(200),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.guichets = (0, pg_core_1.pgTable)("guichets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    businessId: (0, pg_core_1.uuid)("business_id")
        .references(() => businesses_1.businesses.id, { onDelete: "cascade" })
        .notNull(),
    serviceId: (0, pg_core_1.uuid)("service_id").references(() => exports.queueServices.id),
    status: (0, exports.guichetStatus)("status").default("closed").notNull(),
    currentWorkerId: (0, pg_core_1.uuid)("current_worker_id").references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("guichets_business_idx").on(table.businessId),
    (0, pg_core_1.index)("guichets_status_idx").on(table.status),
]);
exports.queueEntries = (0, pg_core_1.pgTable)("queue_entries", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    serviceId: (0, pg_core_1.uuid)("service_id")
        .references(() => exports.queueServices.id, { onDelete: "cascade" })
        .notNull(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => users_1.users.id, {
        onDelete: "set null",
    }),
    anonymousToken: (0, pg_core_1.text)("anonymous_token").unique(),
    anonymousPhone: (0, pg_core_1.text)("anonymous_phone"),
    groupSize: (0, pg_core_1.integer)("group_size").default(1).notNull(),
    priority: (0, exports.priorityLevel)("priority").default("normal").notNull(),
    status: (0, exports.queuedStatus)("status").default("waiting").notNull(),
    present: (0, pg_core_1.boolean)("present").default(false).notNull(),
    position: (0, pg_core_1.integer)("position"),
    estimatedWaitMinutes: (0, pg_core_1.integer)("estimated_wait_minutes"),
    calledAt: (0, pg_core_1.timestamp)("called_at"),
    servedAt: (0, pg_core_1.timestamp)("served_at"),
    servedByGuichetId: (0, pg_core_1.uuid)("served_by_guichet_id").references(() => exports.guichets.id),
    notes: (0, pg_core_1.text)("notes"),
    entryTime: (0, pg_core_1.timestamp)("entry_time").defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)().on(table.userId, table.serviceId),
    (0, pg_core_1.index)("queue_entries_service_status_idx").on(table.serviceId, table.status),
    (0, pg_core_1.index)("queue_entries_user_idx").on(table.userId),
    (0, pg_core_1.index)("queue_entries_status_idx").on(table.status),
]);
exports.queueEvents = (0, pg_core_1.pgTable)("queue_events", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    entryId: (0, pg_core_1.uuid)("entry_id")
        .notNull()
        .references(() => exports.queueEntries.id, { onDelete: "cascade" }),
    eventType: (0, exports.queueEventType)("event_type").notNull(),
    actorId: (0, pg_core_1.uuid)("actor_id").references(() => users_1.users.id),
    metadata: (0, pg_core_1.text)("metadata"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("queue_events_entry_idx").on(table.entryId),
    (0, pg_core_1.index)("queue_events_timestamp_idx").on(table.timestamp),
]);
exports.appointments = (0, pg_core_1.pgTable)("appointments", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    serviceId: (0, pg_core_1.uuid)("service_id")
        .references(() => exports.queueServices.id, { onDelete: "cascade" })
        .notNull(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => users_1.users.id, { onDelete: "cascade" })
        .notNull(),
    scheduledAt: (0, pg_core_1.timestamp)("scheduled_at").notNull(),
    durationMinutes: (0, pg_core_1.integer)("duration_minutes").default(30),
    status: (0, exports.appointmentStatus)("status").default("scheduled").notNull(),
    queueEntryId: (0, pg_core_1.uuid)("queue_entry_id").references(() => exports.queueEntries.id),
    notes: (0, pg_core_1.text)("notes"),
    reminderSentAt: (0, pg_core_1.timestamp)("reminder_sent_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("appointments_service_idx").on(table.serviceId),
    (0, pg_core_1.index)("appointments_user_idx").on(table.userId),
    (0, pg_core_1.index)("appointments_scheduled_at_idx").on(table.scheduledAt),
]);
exports.serviceFeedback = (0, pg_core_1.pgTable)("service_feedback", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    entryId: (0, pg_core_1.uuid)("entry_id")
        .notNull()
        .unique()
        .references(() => exports.queueEntries.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.uuid)("user_id").references(() => users_1.users.id, {
        onDelete: "set null",
    }),
    businessId: (0, pg_core_1.uuid)("business_id")
        .notNull()
        .references(() => businesses_1.businesses.id, { onDelete: "cascade" }),
    rating: (0, pg_core_1.integer)("rating").notNull(),
    comment: (0, pg_core_1.text)("comment"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("service_feedback_business_idx").on(table.businessId),
    (0, pg_core_1.index)("service_feedback_rating_idx").on(table.rating),
]);
exports.workerSessions = (0, pg_core_1.pgTable)("worker_sessions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    workerId: (0, pg_core_1.uuid)("worker_id")
        .notNull()
        .references(() => users_1.users.id, { onDelete: "cascade" }),
    guichetId: (0, pg_core_1.uuid)("guichet_id")
        .notNull()
        .references(() => exports.guichets.id, { onDelete: "cascade" }),
    businessId: (0, pg_core_1.uuid)("business_id")
        .notNull()
        .references(() => businesses_1.businesses.id, { onDelete: "cascade" }),
    shiftStart: (0, pg_core_1.timestamp)("shift_start").defaultNow().notNull(),
    shiftEnd: (0, pg_core_1.timestamp)("shift_end"),
    customersServed: (0, pg_core_1.integer)("customers_served").default(0).notNull(),
    avgServiceTime: (0, pg_core_1.decimal)("avg_service_time").default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("worker_sessions_worker_idx").on(table.workerId),
    (0, pg_core_1.index)("worker_sessions_business_idx").on(table.businessId),
]);
//# sourceMappingURL=queue.js.map
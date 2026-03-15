import {
  integer,
  text,
  timestamp,
  boolean,
  pgTable,
  uuid,
  decimal,
  index,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { businesses } from "./businesses";

export const guichetStatus = pgEnum("guichet_status", [
  "open",
  "closed",
  "paused",
]);
export const queuedStatus = pgEnum("queued_status", [
  "waiting",
  "called",
  "passed",
  "left",
  "skipped",
  "no_show",
]);
export const appointmentStatus = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);
export const queueEventType = pgEnum("queue_event_type", [
  "joined",
  "called",
  "served",
  "left",
  "skipped",
  "no_show",
  "requeued",
]);
export const priorityLevel = pgEnum("priority_level", [
  "normal",
  "priority",
  "urgent",
]);

export const queueServices = pgTable("queue_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  businessId: uuid("business_id")
    .references(() => businesses.id, { onDelete: "cascade" })
    .notNull(),
  averageTime: decimal("average_time").default("0"),
  maxCapacity: integer("max_capacity").default(200),
  isActive: boolean("is_active").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const guichets = pgTable(
  "guichets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    businessId: uuid("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: uuid("service_id").references(() => queueServices.id),
    status: guichetStatus("status").default("closed").notNull(),
    currentWorkerId: uuid("current_worker_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("guichets_business_idx").on(table.businessId),
    index("guichets_status_idx").on(table.status),
  ],
);

export const queueEntries = pgTable(
  "queue_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceId: uuid("service_id")
      .references(() => queueServices.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    anonymousToken: text("anonymous_token").unique(),
    anonymousPhone: text("anonymous_phone"),
    groupSize: integer("group_size").default(1).notNull(),
    priority: priorityLevel("priority").default("normal").notNull(),
    status: queuedStatus("status").default("waiting").notNull(),
    present: boolean("present").default(false).notNull(),
    position: integer("position"),
    estimatedWaitMinutes: integer("estimated_wait_minutes"),
    calledAt: timestamp("called_at"),
    servedAt: timestamp("served_at"),
    servedByGuichetId: uuid("served_by_guichet_id").references(
      () => guichets.id,
    ),
    notes: text("notes"),
    entryTime: timestamp("entry_time").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.userId, table.serviceId),
    index("queue_entries_service_status_idx").on(table.serviceId, table.status),
    index("queue_entries_user_idx").on(table.userId),
    index("queue_entries_status_idx").on(table.status),
  ],
);

export const queueEvents = pgTable(
  "queue_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => queueEntries.id, { onDelete: "cascade" }),
    eventType: queueEventType("event_type").notNull(),
    actorId: uuid("actor_id").references(() => users.id),
    metadata: text("metadata"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("queue_events_entry_idx").on(table.entryId),
    index("queue_events_timestamp_idx").on(table.timestamp),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceId: uuid("service_id")
      .references(() => queueServices.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    scheduledAt: timestamp("scheduled_at").notNull(),
    durationMinutes: integer("duration_minutes").default(30),
    status: appointmentStatus("status").default("scheduled").notNull(),
    queueEntryId: uuid("queue_entry_id").references(() => queueEntries.id),
    notes: text("notes"),
    reminderSentAt: timestamp("reminder_sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("appointments_service_idx").on(table.serviceId),
    index("appointments_user_idx").on(table.userId),
    index("appointments_scheduled_at_idx").on(table.scheduledAt),
  ],
);

export const serviceFeedback = pgTable(
  "service_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryId: uuid("entry_id")
      .notNull()
      .unique()
      .references(() => queueEntries.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("service_feedback_business_idx").on(table.businessId),
    index("service_feedback_rating_idx").on(table.rating),
  ],
);

export const workerSessions = pgTable(
  "worker_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workerId: uuid("worker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    guichetId: uuid("guichet_id")
      .notNull()
      .references(() => guichets.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    shiftStart: timestamp("shift_start").defaultNow().notNull(),
    shiftEnd: timestamp("shift_end"),
    customersServed: integer("customers_served").default(0).notNull(),
    avgServiceTime: decimal("avg_service_time").default("0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("worker_sessions_worker_idx").on(table.workerId),
    index("worker_sessions_business_idx").on(table.businessId),
  ],
);

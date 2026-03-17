import { relations } from "drizzle-orm";
import { users } from "./users";
import { sessions, accounts, pushSubscriptions } from "./auth";
import {
  businesses,
  businessCategories,
  categories,
  businessHours,
  businessBranches,
  businessLogs,
} from "./businesses";
import {
  queueServices,
  guichets,
  queueEntries,
  queueEvents,
  appointments,
  serviceFeedback,
  workerSessions,
} from "./queue";
import { businessWorkers } from "./workers";
import { notifications } from "./notifications";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  pushSubscriptions: many(pushSubscriptions),
  ownedBusinesses: many(businesses, { relationName: "businessOwner" }),
  businessWorkerProfiles: many(businessWorkers),
  queueEntries: many(queueEntries),
  notifications: many(notifications),
  appointments: many(appointments),
  feedback: many(serviceFeedback),
  workerSessions: many(workerSessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
    relationName: "businessOwner",
  }),
  categories: many(businessCategories),
  workers: many(businessWorkers),
  services: many(queueServices),
  guichets: many(guichets),
  hours: many(businessHours),
  logs: many(businessLogs),
  branches: many(businessBranches, { relationName: "parentBusiness" }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  businesses: many(businessCategories),
}));

export const businessCategoriesRelations = relations(
  businessCategories,
  ({ one }) => ({
    business: one(businesses, {
      fields: [businessCategories.businessId],
      references: [businesses.id],
    }),
    category: one(categories, {
      fields: [businessCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const queueServicesRelations = relations(
  queueServices,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [queueServices.businessId],
      references: [businesses.id],
    }),
    guichets: many(guichets),
    entries: many(queueEntries),
    appointments: many(appointments),
  }),
);

export const guichetsRelations = relations(guichets, ({ one, many }) => ({
  business: one(businesses, {
    fields: [guichets.businessId],
    references: [businesses.id],
  }),
  service: one(queueServices, {
    fields: [guichets.serviceId],
    references: [queueServices.id],
  }),
  currentWorker: one(users, {
    fields: [guichets.currentWorkerId],
    references: [users.id],
  }),
  workerSessions: many(workerSessions),
}));

export const queueEntriesRelations = relations(
  queueEntries,
  ({ one, many }) => ({
    service: one(queueServices, {
      fields: [queueEntries.serviceId],
      references: [queueServices.id],
    }),
    user: one(users, {
      fields: [queueEntries.userId],
      references: [users.id],
    }),
    servedByGuichet: one(guichets, {
      fields: [queueEntries.servedByGuichetId],
      references: [guichets.id],
    }),
    events: many(queueEvents),
    feedback: one(serviceFeedback, {
      fields: [queueEntries.id],
      references: [serviceFeedback.entryId],
    }),
  }),
);

export const queueEventsRelations = relations(queueEvents, ({ one }) => ({
  entry: one(queueEntries, {
    fields: [queueEvents.entryId],
    references: [queueEntries.id],
  }),
  actor: one(users, {
    fields: [queueEvents.actorId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  service: one(queueServices, {
    fields: [appointments.serviceId],
    references: [queueServices.id],
  }),
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  queueEntry: one(queueEntries, {
    fields: [appointments.queueEntryId],
    references: [queueEntries.id],
  }),
}));

export const serviceFeedbackRelations = relations(
  serviceFeedback,
  ({ one }) => ({
    entry: one(queueEntries, {
      fields: [serviceFeedback.entryId],
      references: [queueEntries.id],
    }),
    user: one(users, {
      fields: [serviceFeedback.userId],
      references: [users.id],
    }),
    business: one(businesses, {
      fields: [serviceFeedback.businessId],
      references: [businesses.id],
    }),
  }),
);

export const businessWorkersRelations = relations(
  businessWorkers,
  ({ one }) => ({
    user: one(users, {
      fields: [businessWorkers.userId],
      references: [users.id],
    }),
    business: one(businesses, {
      fields: [businessWorkers.businessId],
      references: [businesses.id],
    }),
  }),
);

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  business: one(businesses, {
    fields: [businessHours.businessId],
    references: [businesses.id],
  }),
}));

export const businessLogsRelations = relations(businessLogs, ({ one }) => ({
  business: one(businesses, {
    fields: [businessLogs.businessId],
    references: [businesses.id],
  }),
  actor: one(users, {
    fields: [businessLogs.actorId],
    references: [users.id],
  }),
}));

export const businessBranchesRelations = relations(
  businessBranches,
  ({ one }) => ({
    parent: one(businesses, {
      fields: [businessBranches.parentId],
      references: [businesses.id],
      relationName: "parentBusiness",
    }),
    branch: one(businesses, {
      fields: [businessBranches.branchId],
      references: [businesses.id],
      relationName: "branchBusiness",
    }),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  toUser: one(users, {
    fields: [notifications.toUserId],
    references: [users.id],
  }),
}));

export const workerSessionsRelations = relations(workerSessions, ({ one }) => ({
  worker: one(users, {
    fields: [workerSessions.workerId],
    references: [users.id],
  }),
  guichet: one(guichets, {
    fields: [workerSessions.guichetId],
    references: [guichets.id],
  }),
  business: one(businesses, {
    fields: [workerSessions.businessId],
    references: [businesses.id],
  }),
}));

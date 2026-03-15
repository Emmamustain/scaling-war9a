"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerSessionsRelations = exports.notificationsRelations = exports.businessWorkersRelations = exports.serviceFeedbackRelations = exports.appointmentsRelations = exports.queueEventsRelations = exports.queueEntriesRelations = exports.guichetsRelations = exports.queueServicesRelations = exports.businessCategoriesRelations = exports.categoriesRelations = exports.businessesRelations = exports.pushSubscriptionsRelations = exports.accountsRelations = exports.sessionsRelations = exports.usersRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const auth_1 = require("./auth");
const businesses_1 = require("./businesses");
const queue_1 = require("./queue");
const workers_1 = require("./workers");
const notifications_1 = require("./notifications");
exports.usersRelations = (0, drizzle_orm_1.relations)(users_1.users, ({ many }) => ({
    sessions: many(auth_1.sessions),
    accounts: many(auth_1.accounts),
    pushSubscriptions: many(auth_1.pushSubscriptions),
    ownedBusinesses: many(businesses_1.businesses, { relationName: "businessOwner" }),
    businessWorkerProfiles: many(workers_1.businessWorkers),
    queueEntries: many(queue_1.queueEntries),
    notifications: many(notifications_1.notifications),
    appointments: many(queue_1.appointments),
    feedback: many(queue_1.serviceFeedback),
    workerSessions: many(queue_1.workerSessions),
}));
exports.sessionsRelations = (0, drizzle_orm_1.relations)(auth_1.sessions, ({ one }) => ({
    user: one(users_1.users, { fields: [auth_1.sessions.userId], references: [users_1.users.id] }),
}));
exports.accountsRelations = (0, drizzle_orm_1.relations)(auth_1.accounts, ({ one }) => ({
    user: one(users_1.users, { fields: [auth_1.accounts.userId], references: [users_1.users.id] }),
}));
exports.pushSubscriptionsRelations = (0, drizzle_orm_1.relations)(auth_1.pushSubscriptions, ({ one }) => ({
    user: one(users_1.users, {
        fields: [auth_1.pushSubscriptions.userId],
        references: [users_1.users.id],
    }),
}));
exports.businessesRelations = (0, drizzle_orm_1.relations)(businesses_1.businesses, ({ one, many }) => ({
    owner: one(users_1.users, {
        fields: [businesses_1.businesses.ownerId],
        references: [users_1.users.id],
        relationName: "businessOwner",
    }),
    categories: many(businesses_1.businessCategories),
    workers: many(workers_1.businessWorkers),
    services: many(queue_1.queueServices),
    guichets: many(queue_1.guichets),
    hours: many(businesses_1.businessHours),
    logs: many(businesses_1.businessLogs),
    branches: many(businesses_1.businessBranches, { relationName: "parentBusiness" }),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(businesses_1.categories, ({ many }) => ({
    businesses: many(businesses_1.businessCategories),
}));
exports.businessCategoriesRelations = (0, drizzle_orm_1.relations)(businesses_1.businessCategories, ({ one }) => ({
    business: one(businesses_1.businesses, {
        fields: [businesses_1.businessCategories.businessId],
        references: [businesses_1.businesses.id],
    }),
    category: one(businesses_1.categories, {
        fields: [businesses_1.businessCategories.categoryId],
        references: [businesses_1.categories.id],
    }),
}));
exports.queueServicesRelations = (0, drizzle_orm_1.relations)(queue_1.queueServices, ({ one, many }) => ({
    business: one(businesses_1.businesses, {
        fields: [queue_1.queueServices.businessId],
        references: [businesses_1.businesses.id],
    }),
    guichets: many(queue_1.guichets),
    entries: many(queue_1.queueEntries),
    appointments: many(queue_1.appointments),
}));
exports.guichetsRelations = (0, drizzle_orm_1.relations)(queue_1.guichets, ({ one, many }) => ({
    business: one(businesses_1.businesses, {
        fields: [queue_1.guichets.businessId],
        references: [businesses_1.businesses.id],
    }),
    service: one(queue_1.queueServices, {
        fields: [queue_1.guichets.serviceId],
        references: [queue_1.queueServices.id],
    }),
    currentWorker: one(users_1.users, {
        fields: [queue_1.guichets.currentWorkerId],
        references: [users_1.users.id],
    }),
    workerSessions: many(queue_1.workerSessions),
}));
exports.queueEntriesRelations = (0, drizzle_orm_1.relations)(queue_1.queueEntries, ({ one, many }) => ({
    service: one(queue_1.queueServices, {
        fields: [queue_1.queueEntries.serviceId],
        references: [queue_1.queueServices.id],
    }),
    user: one(users_1.users, {
        fields: [queue_1.queueEntries.userId],
        references: [users_1.users.id],
    }),
    servedByGuichet: one(queue_1.guichets, {
        fields: [queue_1.queueEntries.servedByGuichetId],
        references: [queue_1.guichets.id],
    }),
    events: many(queue_1.queueEvents),
    feedback: one(queue_1.serviceFeedback, {
        fields: [queue_1.queueEntries.id],
        references: [queue_1.serviceFeedback.entryId],
    }),
}));
exports.queueEventsRelations = (0, drizzle_orm_1.relations)(queue_1.queueEvents, ({ one }) => ({
    entry: one(queue_1.queueEntries, {
        fields: [queue_1.queueEvents.entryId],
        references: [queue_1.queueEntries.id],
    }),
    actor: one(users_1.users, {
        fields: [queue_1.queueEvents.actorId],
        references: [users_1.users.id],
    }),
}));
exports.appointmentsRelations = (0, drizzle_orm_1.relations)(queue_1.appointments, ({ one }) => ({
    service: one(queue_1.queueServices, {
        fields: [queue_1.appointments.serviceId],
        references: [queue_1.queueServices.id],
    }),
    user: one(users_1.users, {
        fields: [queue_1.appointments.userId],
        references: [users_1.users.id],
    }),
    queueEntry: one(queue_1.queueEntries, {
        fields: [queue_1.appointments.queueEntryId],
        references: [queue_1.queueEntries.id],
    }),
}));
exports.serviceFeedbackRelations = (0, drizzle_orm_1.relations)(queue_1.serviceFeedback, ({ one }) => ({
    entry: one(queue_1.queueEntries, {
        fields: [queue_1.serviceFeedback.entryId],
        references: [queue_1.queueEntries.id],
    }),
    user: one(users_1.users, {
        fields: [queue_1.serviceFeedback.userId],
        references: [users_1.users.id],
    }),
    business: one(businesses_1.businesses, {
        fields: [queue_1.serviceFeedback.businessId],
        references: [businesses_1.businesses.id],
    }),
}));
exports.businessWorkersRelations = (0, drizzle_orm_1.relations)(workers_1.businessWorkers, ({ one }) => ({
    user: one(users_1.users, {
        fields: [workers_1.businessWorkers.userId],
        references: [users_1.users.id],
    }),
    business: one(businesses_1.businesses, {
        fields: [workers_1.businessWorkers.businessId],
        references: [businesses_1.businesses.id],
    }),
}));
exports.notificationsRelations = (0, drizzle_orm_1.relations)(notifications_1.notifications, ({ one }) => ({
    toUser: one(users_1.users, {
        fields: [notifications_1.notifications.toUserId],
        references: [users_1.users.id],
    }),
}));
exports.workerSessionsRelations = (0, drizzle_orm_1.relations)(queue_1.workerSessions, ({ one }) => ({
    worker: one(users_1.users, {
        fields: [queue_1.workerSessions.workerId],
        references: [users_1.users.id],
    }),
    guichet: one(queue_1.guichets, {
        fields: [queue_1.workerSessions.guichetId],
        references: [queue_1.guichets.id],
    }),
    business: one(businesses_1.businesses, {
        fields: [queue_1.workerSessions.businessId],
        references: [businesses_1.businesses.id],
    }),
}));
//# sourceMappingURL=relations.js.map
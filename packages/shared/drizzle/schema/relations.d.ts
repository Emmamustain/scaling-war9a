export declare const usersRelations: import("drizzle-orm").Relations<"users", {
    sessions: import("drizzle-orm").Many<"sessions">;
    accounts: import("drizzle-orm").Many<"accounts">;
    pushSubscriptions: import("drizzle-orm").Many<"push_subscriptions">;
    ownedBusinesses: import("drizzle-orm").Many<"businesses">;
    businessWorkerProfiles: import("drizzle-orm").Many<"business_workers">;
    queueEntries: import("drizzle-orm").Many<"queue_entries">;
    notifications: import("drizzle-orm").Many<"notifications">;
    appointments: import("drizzle-orm").Many<"appointments">;
    feedback: import("drizzle-orm").Many<"service_feedback">;
    workerSessions: import("drizzle-orm").Many<"worker_sessions">;
}>;
export declare const sessionsRelations: import("drizzle-orm").Relations<"sessions", {
    user: import("drizzle-orm").One<"users", true>;
}>;
export declare const accountsRelations: import("drizzle-orm").Relations<"accounts", {
    user: import("drizzle-orm").One<"users", true>;
}>;
export declare const pushSubscriptionsRelations: import("drizzle-orm").Relations<"push_subscriptions", {
    user: import("drizzle-orm").One<"users", true>;
}>;
export declare const businessesRelations: import("drizzle-orm").Relations<"businesses", {
    owner: import("drizzle-orm").One<"users", true>;
    categories: import("drizzle-orm").Many<"business_categories">;
    workers: import("drizzle-orm").Many<"business_workers">;
    services: import("drizzle-orm").Many<"queue_services">;
    guichets: import("drizzle-orm").Many<"guichets">;
    hours: import("drizzle-orm").Many<"business_hours">;
    logs: import("drizzle-orm").Many<"business_logs">;
    branches: import("drizzle-orm").Many<"business_branches">;
}>;
export declare const categoriesRelations: import("drizzle-orm").Relations<"categories", {
    businesses: import("drizzle-orm").Many<"business_categories">;
}>;
export declare const businessCategoriesRelations: import("drizzle-orm").Relations<"business_categories", {
    business: import("drizzle-orm").One<"businesses", true>;
    category: import("drizzle-orm").One<"categories", true>;
}>;
export declare const queueServicesRelations: import("drizzle-orm").Relations<"queue_services", {
    business: import("drizzle-orm").One<"businesses", true>;
    guichets: import("drizzle-orm").Many<"guichets">;
    entries: import("drizzle-orm").Many<"queue_entries">;
    appointments: import("drizzle-orm").Many<"appointments">;
}>;
export declare const guichetsRelations: import("drizzle-orm").Relations<"guichets", {
    business: import("drizzle-orm").One<"businesses", true>;
    service: import("drizzle-orm").One<"queue_services", false>;
    currentWorker: import("drizzle-orm").One<"users", false>;
    workerSessions: import("drizzle-orm").Many<"worker_sessions">;
}>;
export declare const queueEntriesRelations: import("drizzle-orm").Relations<"queue_entries", {
    service: import("drizzle-orm").One<"queue_services", true>;
    user: import("drizzle-orm").One<"users", false>;
    servedByGuichet: import("drizzle-orm").One<"guichets", false>;
    events: import("drizzle-orm").Many<"queue_events">;
    feedback: import("drizzle-orm").One<"service_feedback", true>;
}>;
export declare const queueEventsRelations: import("drizzle-orm").Relations<"queue_events", {
    entry: import("drizzle-orm").One<"queue_entries", true>;
    actor: import("drizzle-orm").One<"users", false>;
}>;
export declare const appointmentsRelations: import("drizzle-orm").Relations<"appointments", {
    service: import("drizzle-orm").One<"queue_services", true>;
    user: import("drizzle-orm").One<"users", true>;
    queueEntry: import("drizzle-orm").One<"queue_entries", false>;
}>;
export declare const serviceFeedbackRelations: import("drizzle-orm").Relations<"service_feedback", {
    entry: import("drizzle-orm").One<"queue_entries", true>;
    user: import("drizzle-orm").One<"users", false>;
    business: import("drizzle-orm").One<"businesses", true>;
}>;
export declare const businessWorkersRelations: import("drizzle-orm").Relations<"business_workers", {
    user: import("drizzle-orm").One<"users", true>;
    business: import("drizzle-orm").One<"businesses", true>;
}>;
export declare const notificationsRelations: import("drizzle-orm").Relations<"notifications", {
    toUser: import("drizzle-orm").One<"users", true>;
}>;
export declare const workerSessionsRelations: import("drizzle-orm").Relations<"worker_sessions", {
    worker: import("drizzle-orm").One<"users", true>;
    guichet: import("drizzle-orm").One<"guichets", true>;
    business: import("drizzle-orm").One<"businesses", true>;
}>;

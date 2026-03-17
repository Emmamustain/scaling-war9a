"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessWorkers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
const businesses_1 = require("./businesses");
const users_2 = require("./users");
exports.businessWorkers = (0, pg_core_1.pgTable)("business_workers", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => users_1.users.id, { onDelete: "cascade" })
        .notNull(),
    businessId: (0, pg_core_1.uuid)("business_id")
        .references(() => businesses_1.businesses.id, { onDelete: "cascade" })
        .notNull(),
    role: (0, users_2.userRole)("role").default("worker").notNull(),
    score: (0, pg_core_1.integer)("score").default(0).notNull(),
    inviteToken: (0, pg_core_1.text)("invite_token").unique(),
    inviteAcceptedAt: (0, pg_core_1.timestamp)("invite_accepted_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("biz_workers_user_idx").on(table.userId),
    (0, pg_core_1.index)("biz_workers_business_idx").on(table.businessId),
]);
//# sourceMappingURL=workers.js.map
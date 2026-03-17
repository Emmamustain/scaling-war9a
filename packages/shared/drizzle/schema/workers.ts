import {
  integer,
  text,
  timestamp,
  pgTable,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { businesses } from "./businesses";
import { userRole } from "./users";

export const businessWorkers = pgTable(
  "business_workers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    businessId: uuid("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    role: userRole("role").default("worker").notNull(),
    score: integer("score").default(0).notNull(),
    inviteToken: text("invite_token").unique(),
    inviteAcceptedAt: timestamp("invite_accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("biz_workers_user_idx").on(table.userId),
    index("biz_workers_business_idx").on(table.businessId),
  ],
);

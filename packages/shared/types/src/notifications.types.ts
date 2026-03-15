import { schema } from "@shared/drizzle";

export type TNotification = typeof schema.notifications.$inferSelect;

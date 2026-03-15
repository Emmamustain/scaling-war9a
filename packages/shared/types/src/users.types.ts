import { schema } from "@shared/drizzle";

export type TUser = typeof schema.users.$inferSelect;
export type TUserPublic = Omit<TUser, "isBanned" | "banReason">;
export type TReqUser = { userId: string; email: string; role: string };

export type TUserWithBusiness = TUser & {
  workerProfile?: TBusinessWorker | null;
};

export type TBusinessWorker = typeof schema.businessWorkers.$inferSelect & {
  user?: TUser;
};

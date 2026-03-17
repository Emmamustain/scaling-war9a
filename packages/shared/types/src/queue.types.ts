import { schema } from "@shared/drizzle";
import { TUser } from "./users.types";

export type TQueueService = typeof schema.queueServices.$inferSelect;
export type TGuichet = typeof schema.guichets.$inferSelect;
export type TQueueEntry = typeof schema.queueEntries.$inferSelect;
export type TQueueEvent = typeof schema.queueEvents.$inferSelect;
export type TAppointment = typeof schema.appointments.$inferSelect;
export type TServiceFeedback = typeof schema.serviceFeedback.$inferSelect;
export type TWorkerSession = typeof schema.workerSessions.$inferSelect;

export type TQueueEntryWithDetails = TQueueEntry & {
  service?: TQueueService;
  user?: TUser | null;
  position?: number;
  estimatedWaitMinutes?: number;
};

export type TGuichetWithDetails = TGuichet & {
  service?: TQueueService | null;
  currentWorker?: TUser | null;
  queueLength?: number;
};

export type TQueueStatus = {
  serviceId: string;
  serviceName: string;
  businessId: string;
  businessName: string;
  waitingCount: number;
  estimatedWaitMinutes: number;
  openGuichets: number;
  status: "open" | "closed" | "paused";
};

export type TQueuePositionUpdate = {
  entryId: string;
  position: number;
  estimatedWaitMinutes: number;
  status: string;
};

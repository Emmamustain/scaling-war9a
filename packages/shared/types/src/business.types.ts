import { schema } from "@shared/drizzle";

export type TBusiness = typeof schema.businesses.$inferSelect;
export type TCategory = typeof schema.categories.$inferSelect;
export type TBusinessHours = typeof schema.businessHours.$inferSelect;
export type TBusinessWorkerProfile = typeof schema.businessWorkers.$inferSelect;

export type TBusinessWithDetails = TBusiness & {
  categories?: TCategory[];
  hours?: TBusinessHours[];
  avgRating?: number;
  totalReviews?: number;
  currentQueueLength?: number;
};

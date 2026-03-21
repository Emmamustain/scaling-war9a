-- Drop the unique constraint that prevented a user from re-joining a service
-- (now we allow multiple historical entries per user+service)
ALTER TABLE "queue_entries" DROP CONSTRAINT "queue_entries_user_id_service_id_unique";--> statement-breakpoint

-- Drop the position column (computed dynamically from row order, never stored)
ALTER TABLE "queue_entries" DROP COLUMN "position";

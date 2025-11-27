DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('regular', 'owner', 'manager', 'worker', 'super', 'admin', 'founder');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "guichet_status" AS ENUM('open', 'closed', 'paused');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "queued_status" AS ENUM('waiting', 'passed', 'left');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_categories" (
	"business_id" uuid,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_guichets" (
	"business_guichet_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"guichet_id" uuid,
	"assignment_date" timestamp DEFAULT now(),
	"additional_attribute" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"activity_description" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_services" (
	"business_id" uuid,
	"service_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_services_service_id_unique" UNIQUE("service_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers" (
	"worker_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"role" "user_role" DEFAULT 'worker',
	"score" integer DEFAULT 0,
	"business_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "businesses" (
	"business_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"phone" text,
	"description" text NOT NULL,
	"avgWaitTime" integer DEFAULT 0,
	"location" text NOT NULL,
	"latitude" numeric DEFAULT '0',
	"longitude" numeric DEFAULT '0',
	"city" text DEFAULT 'annaba' NOT NULL,
	"zipcode" text DEFAULT 'A23000' NOT NULL,
	"image" text,
	"cover_image" text,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_name_unique" UNIQUE("name"),
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guichet_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guichet_id" uuid,
	"activity_description" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guichet_services" (
	"gs_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guichet_id" uuid,
	"service_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guichet_services_guichet_id_unique" UNIQUE("guichet_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guichet_workers" (
	"guichet_id" uuid,
	"worker_id" uuid,
	CONSTRAINT "guichet_workers_worker_id_unique" UNIQUE("worker_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guichets" (
	"guichet_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"guichet_status" "guichet_status" DEFAULT 'open',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"notifications_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to_user_id" uuid,
	"message" text NOT NULL,
	"consumed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queue_entries" (
	"entry_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_time" timestamp DEFAULT now() NOT NULL,
	"status" "queued_status" DEFAULT 'waiting',
	"present" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "queue_entries_user_id_service_id_unique" UNIQUE("user_id","service_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queue_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid,
	"activity_description" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "security_event_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text,
	"description" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"service_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"author" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"average_time" numeric DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"tag_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_businesses" (
	"user_id" uuid,
	"business_id" uuid,
	"role" "user_role" DEFAULT 'worker',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_feedback" (
	"feedback_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"feedback" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"activity_description" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"role" "user_role" DEFAULT 'regular',
	"city" text DEFAULT 'annaba' NOT NULL,
	"longitude_user" numeric DEFAULT '0',
	"latitude_user" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("business_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_guichets" ADD CONSTRAINT "business_guichets_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("business_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_guichets" ADD CONSTRAINT "business_guichets_guichet_id_guichets_guichet_id_fk" FOREIGN KEY ("guichet_id") REFERENCES "guichets"("guichet_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_logs" ADD CONSTRAINT "business_logs_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("business_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_services" ADD CONSTRAINT "business_services_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("business_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_services" ADD CONSTRAINT "business_services_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workers" ADD CONSTRAINT "workers_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("business_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_users_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guichet_logs" ADD CONSTRAINT "guichet_logs_guichet_id_guichets_guichet_id_fk" FOREIGN KEY ("guichet_id") REFERENCES "guichets"("guichet_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guichet_services" ADD CONSTRAINT "guichet_services_guichet_id_guichets_guichet_id_fk" FOREIGN KEY ("guichet_id") REFERENCES "guichets"("guichet_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guichet_services" ADD CONSTRAINT "guichet_services_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guichet_workers" ADD CONSTRAINT "guichet_workers_guichet_id_guichets_guichet_id_fk" FOREIGN KEY ("guichet_id") REFERENCES "guichets"("guichet_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guichet_workers" ADD CONSTRAINT "guichet_workers_worker_id_users_user_id_fk" FOREIGN KEY ("worker_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queue_logs" ADD CONSTRAINT "queue_logs_service_id_services_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_author_users_user_id_fk" FOREIGN KEY ("author") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_businesses" ADD CONSTRAINT "user_businesses_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_businesses" ADD CONSTRAINT "user_businesses_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "businesses"("business_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

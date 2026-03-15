CREATE TYPE "public"."user_role" AS ENUM('regular', 'owner', 'manager', 'worker', 'super', 'admin', 'founder');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."guichet_status" AS ENUM('open', 'closed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('normal', 'priority', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."queue_event_type" AS ENUM('joined', 'called', 'served', 'left', 'skipped', 'no_show', 'requeued');--> statement-breakpoint
CREATE TYPE "public"."queued_status" AS ENUM('waiting', 'called', 'passed', 'left', 'skipped', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('queue_called', 'queue_position', 'queue_joined', 'appointment_reminder', 'business_announcement', 'system', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'regular' NOT NULL,
	"city" text DEFAULT 'annaba',
	"longitude" numeric DEFAULT '0',
	"latitude" numeric DEFAULT '0',
	"phone" text,
	"is_banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"username_needs_setup" boolean DEFAULT false NOT NULL,
	"preferred_language" text DEFAULT 'fr',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh_key" text NOT NULL,
	"auth_key" text NOT NULL,
	"user_agent" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_categories" (
	"business_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text NOT NULL,
	"close_time" text NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"actor_id" uuid,
	"activity_description" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"phone" text,
	"description" text DEFAULT '' NOT NULL,
	"avg_wait_time" integer DEFAULT 0,
	"location" text DEFAULT '' NOT NULL,
	"latitude" numeric DEFAULT '0',
	"longitude" numeric DEFAULT '0',
	"city" text DEFAULT 'annaba' NOT NULL,
	"zip_code" text DEFAULT '',
	"logo_url" text,
	"cover_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "business_status" DEFAULT 'pending' NOT NULL,
	"max_queue_capacity" integer DEFAULT 500,
	"is_open" boolean DEFAULT false NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_name_unique" UNIQUE("name"),
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 30,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"queue_entry_id" uuid,
	"notes" text,
	"reminder_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guichets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"business_id" uuid NOT NULL,
	"service_id" uuid,
	"status" "guichet_status" DEFAULT 'closed' NOT NULL,
	"current_worker_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"user_id" uuid,
	"anonymous_token" text,
	"anonymous_phone" text,
	"group_size" integer DEFAULT 1 NOT NULL,
	"priority" "priority_level" DEFAULT 'normal' NOT NULL,
	"status" "queued_status" DEFAULT 'waiting' NOT NULL,
	"present" boolean DEFAULT false NOT NULL,
	"position" integer,
	"estimated_wait_minutes" integer,
	"called_at" timestamp,
	"served_at" timestamp,
	"served_by_guichet_id" uuid,
	"notes" text,
	"entry_time" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "queue_entries_anonymous_token_unique" UNIQUE("anonymous_token"),
	CONSTRAINT "queue_entries_user_id_service_id_unique" UNIQUE("user_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "queue_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"event_type" "queue_event_type" NOT NULL,
	"actor_id" uuid,
	"metadata" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"business_id" uuid NOT NULL,
	"average_time" numeric DEFAULT '0',
	"max_capacity" integer DEFAULT 200,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"user_id" uuid,
	"business_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_feedback_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "worker_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"guichet_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"shift_start" timestamp DEFAULT now() NOT NULL,
	"shift_end" timestamp,
	"customers_served" integer DEFAULT 0 NOT NULL,
	"avg_service_time" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'worker' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"invite_token" text,
	"invite_accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_workers_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to_user_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"resource_type" text,
	"resource_id" uuid,
	"consumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_event_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text,
	"user_id" uuid,
	"description" text,
	"ip_address" text,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_branches" ADD CONSTRAINT "business_branches_parent_id_businesses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_branches" ADD CONSTRAINT "business_branches_branch_id_businesses_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_logs" ADD CONSTRAINT "business_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_logs" ADD CONSTRAINT "business_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_queue_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."queue_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_queue_entry_id_queue_entries_id_fk" FOREIGN KEY ("queue_entry_id") REFERENCES "public"."queue_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guichets" ADD CONSTRAINT "guichets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guichets" ADD CONSTRAINT "guichets_service_id_queue_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."queue_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guichets" ADD CONSTRAINT "guichets_current_worker_id_users_id_fk" FOREIGN KEY ("current_worker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_service_id_queue_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."queue_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_served_by_guichet_id_guichets_id_fk" FOREIGN KEY ("served_by_guichet_id") REFERENCES "public"."guichets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_entry_id_queue_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."queue_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_services" ADD CONSTRAINT "queue_services_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_entry_id_queue_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."queue_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_sessions" ADD CONSTRAINT "worker_sessions_worker_id_users_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_sessions" ADD CONSTRAINT "worker_sessions_guichet_id_guichets_id_fk" FOREIGN KEY ("guichet_id") REFERENCES "public"."guichets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_sessions" ADD CONSTRAINT "worker_sessions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_workers" ADD CONSTRAINT "business_workers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_workers" ADD CONSTRAINT "business_workers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_event_logs" ADD CONSTRAINT "security_event_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "businesses_owner_idx" ON "businesses" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "businesses_city_featured_idx" ON "businesses" USING btree ("city","featured");--> statement-breakpoint
CREATE INDEX "businesses_slug_idx" ON "businesses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "businesses_status_idx" ON "businesses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_service_idx" ON "appointments" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "appointments_user_idx" ON "appointments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "appointments_scheduled_at_idx" ON "appointments" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "guichets_business_idx" ON "guichets" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "guichets_status_idx" ON "guichets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "queue_entries_service_status_idx" ON "queue_entries" USING btree ("service_id","status");--> statement-breakpoint
CREATE INDEX "queue_entries_user_idx" ON "queue_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "queue_entries_status_idx" ON "queue_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "queue_events_entry_idx" ON "queue_events" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "queue_events_timestamp_idx" ON "queue_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "service_feedback_business_idx" ON "service_feedback" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "service_feedback_rating_idx" ON "service_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "worker_sessions_worker_idx" ON "worker_sessions" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "worker_sessions_business_idx" ON "worker_sessions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "biz_workers_user_idx" ON "business_workers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "biz_workers_business_idx" ON "business_workers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "notifications_consumed_idx" ON "notifications" USING btree ("consumed");
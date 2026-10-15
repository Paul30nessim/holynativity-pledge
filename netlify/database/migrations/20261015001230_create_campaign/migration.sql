CREATE TABLE "pledges" (
	"id" serial PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"project" text NOT NULL,
	"window_number" integer,
	"amount" integer NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'reserved' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	CONSTRAINT "positive_amount" CHECK ("amount" > 0),
	CONSTRAINT "valid_window" CHECK ("window_number" IS NULL OR ("window_number" BETWEEN 1 AND 36 AND "project" = 'windows')),
	CONSTRAINT "valid_status" CHECK ("status" IN ('pending','reserved','paid','cancelled'))
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY,
	"content" jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_pledge_per_window" ON "pledges" ("window_number") WHERE "status" <> 'cancelled';
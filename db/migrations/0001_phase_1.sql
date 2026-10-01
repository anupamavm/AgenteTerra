CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "property_listings" ADD COLUMN IF NOT EXISTS "owner_id" bigint;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_listings" ADD CONSTRAINT "property_listings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
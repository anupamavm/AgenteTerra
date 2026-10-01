CREATE TABLE IF NOT EXISTS "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_images_listing_idx" ON "property_images" ("listing_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_images" ADD CONSTRAINT "property_images_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "property_listings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TABLE "property_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"state_region" text NOT NULL,
	"locality" text NOT NULL,
	"land_size_area" double precision NOT NULL,
	"area_unit" text DEFAULT 'sqft',
	"road_width_meters" double precision,
	"price_units" bigint NOT NULL,
	"currency" text DEFAULT 'USD',
	"location" geometry(point,4326) NOT NULL,
	"is_enriched" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "spatial_location_idx" ON "property_listings" USING gist ("location");
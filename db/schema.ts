import {
	boolean,
	doublePrecision,
	foreignKey,
	geometry,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	bigint,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const propertyListings = pgTable(
	"property_listings",
	{
		id: serial("id").primaryKey(),
		ownerId: bigint("owner_id", { mode: "number" }),
		title: text("title").notNull(),
		stateRegion: text("state_region").notNull(),
		locality: text("locality").notNull(),
		landSizeArea: doublePrecision("land_size_area").notNull(),
		areaUnit: text("area_unit").default("sqft"),
		roadWidthMeters: doublePrecision("road_width_meters"),
		priceUnits: bigint("price_units", { mode: "number" }).notNull(),
		currency: text("currency").default("USD"),
		location: geometry("location", {
			type: "point",
			mode: "xy",
			srid: 4326,
		}).notNull(),
		isEnriched: boolean("is_enriched").default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [
		index("spatial_location_idx").using("gist", table.location),
		foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "property_listings_owner_id_users_id_fk",
		}),
	],
);

export const propertyImages = pgTable(
	"property_images",
	{
		id: serial("id").primaryKey(),
		listingId: integer("listing_id").notNull(),
		objectKey: text("object_key").notNull(),
		contentType: text("content_type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [
		index("property_images_listing_idx").on(table.listingId),
		foreignKey({
			columns: [table.listingId],
			foreignColumns: [propertyListings.id],
			name: "property_images_listing_id_property_listings_id_fk",
		}),
	],
);

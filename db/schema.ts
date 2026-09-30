import {
  boolean,
  doublePrecision,
  geometry,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

export const propertyListings = pgTable(
  "property_listings",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    stateRegion: text("state_region").notNull(),
    locality: text("locality").notNull(),
    landSizeArea: doublePrecision("land_size_area").notNull(),
    areaUnit: text("area_unit").default("sqft"),
    roadWidthMeters: doublePrecision("road_width_meters"),
    priceUnits: bigint("price_units", { mode: "number" }).notNull(),
    currency: text("currency").default("USD"),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }).notNull(),
    isEnriched: boolean("is_enriched").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("spatial_location_idx").using("gist", table.location)],
);

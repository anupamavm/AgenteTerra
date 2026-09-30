"use server";

import { sql } from "drizzle-orm";
import { db } from "../../db";

export async function getNearby(
  userLat: number,
  userLng: number,
  radiusMeters: number,
) {
  const results = await db.execute(sql`
    SELECT
      id,
      title,
      state_region AS "stateRegion",
      locality,
      land_size_area AS "landSizeArea",
      area_unit AS "areaUnit",
      road_width_meters AS "roadWidthMeters",
      price_units AS "priceUnits",
      currency,
      ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography
      ) AS "distanceMeters"
    FROM property_listings
    WHERE ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
      ${radiusMeters}
    )
    ORDER BY "distanceMeters" ASC
  `);

  return results.rows;
}

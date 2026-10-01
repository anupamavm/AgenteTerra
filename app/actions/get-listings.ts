"use server";

import { sql } from "drizzle-orm";
import { db } from "../../db";
import { getPropertyImageUrl } from "../../lib/storage";

export type ListingFilters = {
	minPerches?: number;
	maxSqFt?: number;
	minRoadWidth?: number;
};

export type ListingRow = {
	id: number;
	title: string;
	stateRegion: string;
	locality: string;
	landSizeArea: number;
	areaUnit: string | null;
	roadWidthMeters: number | null;
	priceUnits: number;
	currency: string | null;
	isEnriched: boolean | null;
};

export type ListingDetail = ListingRow & {
	latitude: number;
	longitude: number;
	createdAt: Date | null;
};

export async function getListings(filters: ListingFilters = {}) {
	const conditions = [sql`1 = 1`];
	if (filters.minPerches !== undefined) {
		conditions.push(
			sql`((area_unit = 'perches' AND land_size_area >= ${filters.minPerches}) OR (area_unit = 'sqft' AND land_size_area >= ${filters.minPerches * 272.25}))`,
		);
	}
	if (filters.maxSqFt !== undefined) {
		conditions.push(
			sql`((area_unit = 'sqft' AND land_size_area <= ${filters.maxSqFt}) OR (area_unit = 'perches' AND land_size_area * 272.25 <= ${filters.maxSqFt}))`,
		);
	}
	if (filters.minRoadWidth !== undefined) {
		conditions.push(sql`road_width_meters >= ${filters.minRoadWidth}`);
	}

	const result = await db.execute(sql`
    SELECT id, title, state_region AS "stateRegion", locality,
      land_size_area AS "landSizeArea", area_unit AS "areaUnit",
      road_width_meters AS "roadWidthMeters", price_units AS "priceUnits",
      currency, is_enriched AS "isEnriched"
    FROM property_listings
    WHERE ${sql.join(conditions, sql` AND `)}
    ORDER BY created_at DESC, id DESC
  `);
	return result.rows as unknown as ListingRow[];
}

export async function getListingById(id: number) {
	const result = await db.execute(sql`
		SELECT id, title, state_region AS "stateRegion", locality,
			land_size_area AS "landSizeArea", area_unit AS "areaUnit",
			road_width_meters AS "roadWidthMeters", price_units AS "priceUnits",
			currency, is_enriched AS "isEnriched",
			ST_Y(location::geometry) AS latitude,
			ST_X(location::geometry) AS longitude,
			created_at AS "createdAt"
		FROM property_listings
		WHERE id = ${id}
		LIMIT 1
	`);
	return (result.rows[0] as unknown as ListingDetail | undefined) ?? null;
}

export async function getListingImages(listingId: number) {
	const result = await db.execute(sql`
		SELECT id, object_key AS "objectKey"
		FROM property_images
		WHERE listing_id = ${listingId}
		ORDER BY id ASC
	`);
	return Promise.all(
		(result.rows as unknown as Array<{ id: number; objectKey: string }>).map(
			async (image) => ({
				id: image.id,
				url: await getPropertyImageUrl(image.objectKey),
			}),
		),
	);
}

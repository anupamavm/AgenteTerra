"use server";

import { sql } from "drizzle-orm";
import Redis from "ioredis";
import { db } from "../../db";
import { propertyListings } from "../../db/schema";

export type CreateListingInput = {
  title: string;
  stateRegion: string;
  locality: string;
  landSizeArea: number;
  areaUnit?: string;
  roadWidthMeters?: number;
  priceUnits: number;
  currency?: string;
  latitude: number;
  longitude: number;
};

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

export async function createListing(input: CreateListingInput) {
  const [listing] = await db
    .insert(propertyListings)
    .values({
      title: input.title,
      stateRegion: input.stateRegion,
      locality: input.locality,
      landSizeArea: input.landSizeArea,
      areaUnit: input.areaUnit,
      roadWidthMeters: input.roadWidthMeters,
      priceUnits: input.priceUnits,
      currency: input.currency,
      location: sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)`,
    })
    .returning({ id: propertyListings.id });

  if (!listing) {
    throw new Error("Failed to create listing");
  }

  await redis.rpush(
    "enrichment_queue",
    JSON.stringify({
      listing_id: listing.id,
      latitude: input.latitude,
      longitude: input.longitude,
    }),
  );

  return listing;
}

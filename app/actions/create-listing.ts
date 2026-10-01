"use server";

import { sql } from "drizzle-orm";
import Redis from "ioredis";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { db } from "../../db";
import { propertyImages, propertyListings } from "../../db/schema";
import { requireUser } from "../../lib/auth";
import { config } from "../../lib/config";
import { uploadPropertyImage } from "../../lib/storage";

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

export async function createListing(formData: FormData) {
	if (!config.features.listingPosting) {
		redirect("/sell?listingError=Listing posting is currently unavailable.");
	}
	const user = await requireUser();

	const input: CreateListingInput = {
		title: String(formData.get("title") ?? "").trim(),
		stateRegion: String(formData.get("stateRegion") ?? "").trim(),
		locality: String(formData.get("locality") ?? "").trim(),
		landSizeArea: Number(formData.get("landSizeArea")),
		areaUnit: String(formData.get("areaUnit") ?? "sqft"),
		roadWidthMeters: Number(formData.get("roadWidthMeters")) || undefined,
		priceUnits: Number(formData.get("priceUnits")),
		currency: String(formData.get("currency") ?? "USD")
			.trim()
			.toUpperCase(),
		latitude: Number(formData.get("latitude")),
		longitude: Number(formData.get("longitude")),
	};
	if (
		!input.title ||
		!input.stateRegion ||
		!input.locality ||
		!Number.isFinite(input.landSizeArea) ||
		!Number.isFinite(input.priceUnits) ||
		!Number.isFinite(input.latitude) ||
		!Number.isFinite(input.longitude) ||
		input.latitude < -90 ||
		input.latitude > 90 ||
		input.longitude < -180 ||
		input.longitude > 180
	) {
		redirect(
			"/sell?listingError=Complete all fields and provide valid map coordinates.",
		);
	}

	const images = config.features.propertyImages
		? formData
				.getAll("images")
				.filter(
					(value): value is File => value instanceof File && value.size > 0,
				)
		: [];
	if (
		images.length > 6 ||
		images.some(
			(image) =>
				image.size > 8 * 1024 * 1024 || !image.type.startsWith("image/"),
		)
	) {
		redirect("/sell?listingError=Add up to 6 images, each smaller than 8 MB.");
	}

	const [listing] = await db
		.insert(propertyListings)
		.values({
			ownerId: user.id,
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

	for (const image of images) {
		const objectKey = `properties/${listing.id}/${randomUUID()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
		await uploadPropertyImage(
			objectKey,
			new Uint8Array(await image.arrayBuffer()),
			image.type,
		);
		await db.insert(propertyImages).values({
			listingId: listing.id,
			objectKey,
			contentType: image.type,
		});
	}

	if (config.features.redisEnrichment) {
		const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
		await redis.rpush(
			"enrichment_queue",
			JSON.stringify({
				listing_id: listing.id,
				latitude: input.latitude,
				longitude: input.longitude,
			}),
		);
		redis.disconnect();
	}

	redirect("/?listing=created");
}

"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "../../db";
import { propertyImages, propertyListings } from "../../db/schema";
import { requireUser } from "../../lib/auth";
import { deletePropertyImage } from "../../lib/storage";

type ListingInput = {
	title: string;
	stateRegion: string;
	locality: string;
	landSizeArea: number;
	areaUnit: string;
	roadWidthMeters: number | null;
	priceUnits: number;
	currency: string;
	latitude: number;
	longitude: number;
};

function getText(formData: FormData, name: string, fallback = "") {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : fallback;
}

function getListingId(formData: FormData) {
	const rawId = getText(formData, "listingId");
	const id = Number(rawId);
	return Number.isInteger(id) && id > 0 ? id : null;
}

function readListingInput(formData: FormData): ListingInput {
	const roadWidth = getText(formData, "roadWidthMeters");
	return {
		title: getText(formData, "title"),
		stateRegion: getText(formData, "stateRegion"),
		locality: getText(formData, "locality"),
		landSizeArea: Number(getText(formData, "landSizeArea")),
		areaUnit: getText(formData, "areaUnit"),
		roadWidthMeters: roadWidth === "" ? null : Number(roadWidth),
		priceUnits: Number(getText(formData, "priceUnits")),
		currency: getText(formData, "currency").toUpperCase(),
		latitude: Number(getText(formData, "latitude")),
		longitude: Number(getText(formData, "longitude")),
	};
}

function validListingInput(input: ListingInput) {
	return (
		input.title.length > 0 &&
		input.stateRegion.length > 0 &&
		input.locality.length > 0 &&
		Number.isFinite(input.landSizeArea) &&
		input.landSizeArea > 0 &&
		["sqft", "perches", "sqm", "acre"].includes(input.areaUnit) &&
		(input.roadWidthMeters === null ||
			(Number.isFinite(input.roadWidthMeters) && input.roadWidthMeters >= 0)) &&
		Number.isSafeInteger(input.priceUnits) &&
		input.priceUnits >= 0 &&
		/^[A-Z]{3}$/.test(input.currency) &&
		Number.isFinite(input.latitude) &&
		input.latitude >= -90 &&
		input.latitude <= 90 &&
		Number.isFinite(input.longitude) &&
		input.longitude >= -180 &&
		input.longitude <= 180
	);
}

export async function updateListing(formData: FormData) {
	const user = await requireUser();
	const id = getListingId(formData);
	const input = readListingInput(formData);
	if (!id || !validListingInput(input)) {
		throw new Error("Provide valid listing details before saving.");
	}

	const accessCondition =
		user.role === "admin"
			? eq(propertyListings.id, id)
			: and(eq(propertyListings.id, id), eq(propertyListings.ownerId, user.id));
	const [updated] = await db
		.update(propertyListings)
		.set({
			title: input.title,
			stateRegion: input.stateRegion,
			locality: input.locality,
			landSizeArea: input.landSizeArea,
			areaUnit: input.areaUnit,
			roadWidthMeters: input.roadWidthMeters,
			priceUnits: input.priceUnits,
			currency: input.currency,
			location: {
				x: input.longitude,
				y: input.latitude,
			},
		})
		.where(accessCondition)
		.returning({ id: propertyListings.id });
	if (!updated)
		redirect("/account?listingError=Listing+not+found+or+not+editable.");
	redirect(`/properties/${updated.id}`);
}

export async function deleteListing(formData: FormData) {
	const user = await requireUser();
	const id = getListingId(formData);
	if (!id) throw new Error("A valid listing is required.");

	const imageRows = await db
		.select({ objectKey: propertyImages.objectKey })
		.from(propertyImages)
		.where(eq(propertyImages.listingId, id));
	const accessCondition =
		user.role === "admin"
			? eq(propertyListings.id, id)
			: and(eq(propertyListings.id, id), eq(propertyListings.ownerId, user.id));
	const [deleted] = await db
		.delete(propertyListings)
		.where(accessCondition)
		.returning({ id: propertyListings.id });
	if (!deleted)
		redirect("/account?listingError=Listing+not+found+or+not+deletable.");

	await Promise.allSettled(
		imageRows.map((image) => deletePropertyImage(image.objectKey)),
	);
	redirect(user.role === "admin" ? "/admin" : "/account/listings");
}

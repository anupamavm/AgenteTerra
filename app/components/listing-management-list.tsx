import Link from "next/link";
import type { ListingRow } from "../actions/get-listings";
import { DeleteListingForm } from "./delete-listing-form";

export function ListingManagementList({
	listings,
	showOwner = false,
}: Readonly<{ listings: ListingRow[]; showOwner?: boolean }>) {
	if (listings.length === 0) {
		return <div className="empty">No listings to manage yet.</div>;
	}

	return (
		<div className="listing-management-list">
			{listings.map((listing) => (
				<article
					className="listing-management-row"
					key={listing.id}>
					<Link
						className="listing-management-main"
						href={`/properties/${listing.id}`}>
						<div className="listing-management-image">
							{listing.imageUrl ? (
								<img
									src={listing.imageUrl}
									alt=""
								/>
							) : (
								<span>{String(listing.id).padStart(2, "0")}</span>
							)}
						</div>
						<div className="listing-management-copy">
							<span className="eyebrow">
								{listing.locality}, {listing.stateRegion}
							</span>
							<strong>{listing.title}</strong>
							<small>
								{showOwner ? `Owner #${listing.ownerId ?? "unknown"} · ` : ""}
								{listing.landSizeArea.toLocaleString()}{" "}
								{listing.areaUnit ?? "sqft"}
								{" · "}
								{listing.currency ?? "USD"}{" "}
								{listing.priceUnits.toLocaleString()}
							</small>
						</div>
					</Link>
					<div className="listing-management-actions">
						<Link
							className="text-link"
							href={`/properties/${listing.id}/edit`}>
							Edit
						</Link>
						<DeleteListingForm
							listingId={listing.id}
							title={listing.title}
						/>
					</div>
				</article>
			))}
		</div>
	);
}

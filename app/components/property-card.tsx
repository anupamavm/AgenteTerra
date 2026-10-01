import Link from "next/link";
import type { ListingRow } from "../actions/get-listings";

export function PropertyCard({
	listing,
	featured = false,
}: {
	listing: ListingRow;
	featured?: boolean;
}) {
	return (
		<Link
			className={`property-card${featured ? " property-card-featured" : ""}`}
			href={`/properties/${listing.id}`}>
			<div className="property-card-top">
				<span className="property-type">
					LAND / {listing.areaUnit ?? "SQFT"}
				</span>
				<span className="property-arrow">↗</span>
			</div>
			<div className="property-card-image">
				<span>{String(listing.id).padStart(2, "0")}</span>
				<i />
			</div>
			<div className="property-card-body">
				<p className="property-location">
					{listing.locality}, {listing.stateRegion}
				</p>
				<h2>{listing.title}</h2>
				<div className="property-card-meta">
					<span>
						{listing.landSizeArea.toLocaleString()} {listing.areaUnit ?? "sqft"}
					</span>
					<span>{listing.roadWidthMeters ?? "—"}m road</span>
					<strong>
						{listing.currency ?? "USD"} {listing.priceUnits.toLocaleString()}
					</strong>
				</div>
			</div>
		</Link>
	);
}

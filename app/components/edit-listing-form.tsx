import type { ListingDetail } from "../actions/get-listings";
import { updateListing } from "../actions/manage-listings";

export function EditListingForm({
	listing,
}: Readonly<{ listing: ListingDetail }>) {
	return (
		<form
			className="listing-form"
			action={updateListing}>
			<input
				type="hidden"
				name="listingId"
				value={listing.id}
			/>
			<div className="form-section">
				<p className="eyebrow">01 / The property</p>
				<label>
					Listing title
					<input
						name="title"
						defaultValue={listing.title}
						required
					/>
				</label>
				<div className="two-up">
					<label>
						Region
						<input
							name="stateRegion"
							defaultValue={listing.stateRegion}
							required
						/>
					</label>
					<label>
						Locality
						<input
							name="locality"
							defaultValue={listing.locality}
							required
						/>
					</label>
				</div>
			</div>
			<div className="form-section">
				<p className="eyebrow">02 / The numbers</p>
				<div className="two-up">
					<label>
						Size
						<input
							name="landSizeArea"
							defaultValue={listing.landSizeArea}
							required
							type="number"
							min="0"
							step="0.01"
						/>
					</label>
					<label>
						Unit
						<select
							name="areaUnit"
							defaultValue={listing.areaUnit ?? "sqft"}>
							<option value="sqft">Square feet</option>
							<option value="perches">Perches</option>
							<option value="sqm">Square metres</option>
							<option value="acre">Acres</option>
						</select>
					</label>
				</div>
				<div className="two-up">
					<label>
						Road width (m)
						<input
							name="roadWidthMeters"
							defaultValue={listing.roadWidthMeters ?? ""}
							type="number"
							min="0"
							step="0.1"
						/>
					</label>
					<label>
						Currency
						<input
							name="currency"
							defaultValue={listing.currency ?? "USD"}
							maxLength={3}
							required
						/>
					</label>
				</div>
				<label>
					Price
					<input
						name="priceUnits"
						defaultValue={listing.priceUnits}
						required
						type="number"
						min="0"
					/>
				</label>
			</div>
			<div className="form-section">
				<p className="eyebrow">03 / Location</p>
				<div className="two-up">
					<label>
						Latitude
						<input
							name="latitude"
							defaultValue={listing.latitude}
							required
							type="number"
							min="-90"
							max="90"
							step="any"
						/>
					</label>
					<label>
						Longitude
						<input
							name="longitude"
							defaultValue={listing.longitude}
							required
							type="number"
							min="-180"
							max="180"
							step="any"
						/>
					</label>
				</div>
			</div>
			<div className="form-section form-submit-section">
				<button
					className="button button-dark"
					type="submit">
					Save changes <span>↗</span>
				</button>
			</div>
		</form>
	);
}

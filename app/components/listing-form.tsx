import { createListing } from "../actions/create-listing";
import { LocationPicker } from "./location-picker";

export function ListingForm() {
	return (
		<form
			className="listing-form"
			action={createListing}>
			<div className="form-section">
				<p className="eyebrow">01 / The property</p>
				<h2>Tell buyers what makes this land useful.</h2>
				<label>
					Listing title
					<input
						name="title"
						required
						placeholder="Quiet corner near the city"
					/>
				</label>
				<div className="two-up">
					<label>
						Region
						<input
							name="stateRegion"
							required
						/>
					</label>
					<label>
						Locality
						<input
							name="locality"
							required
						/>
					</label>
				</div>
			</div>
			<div className="form-section">
				<p className="eyebrow">02 / The numbers</p>
				<h2>Give the land a clear measure.</h2>
				<div className="two-up">
					<label>
						Size
						<input
							name="landSizeArea"
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
							defaultValue="sqft">
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
							type="number"
							min="0"
							step="0.1"
						/>
					</label>
					<label>
						Currency
						<input
							name="currency"
							defaultValue="USD"
							maxLength={3}
						/>
					</label>
				</div>
				<label>
					Price
					<input
						name="priceUnits"
						required
						type="number"
						min="0"
					/>
				</label>
			</div>
			<div className="form-section">
				<p className="eyebrow">03 / Show the place</p>
				<h2>Help buyers understand the ground.</h2>
				<label className="upload-field">
					Property images
					<input
						name="images"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						required
					/>
				</label>
				<p className="form-hint">
					Add up to six JPG, PNG, or WebP images. Maximum 8 MB each.
				</p>
				<LocationPicker />
			</div>
			<div className="form-section form-submit-section">
				<button
					className="button button-dark"
					type="submit">
					Publish property <span>↗</span>
				</button>
			</div>
		</form>
	);
}

"use client";

import { deleteListing } from "../actions/manage-listings";

export function DeleteListingForm({
	listingId,
	title,
}: Readonly<{ listingId: number; title: string }>) {
	return (
		<form
			action={deleteListing}
			onSubmit={(event) => {
				if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
					event.preventDefault();
				}
			}}>
			<input
				type="hidden"
				name="listingId"
				value={listingId}
			/>
			<button
				className="text-button danger-button"
				type="submit">
				Delete
			</button>
		</form>
	);
}

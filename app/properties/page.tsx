import Link from "next/link";
import { getListings } from "../actions/get-listings";
import { PropertyCard } from "../components/property-card";
import { SiteHeader } from "../components/site-header";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function numberParam(value: string | string[] | undefined) {
	const parsed = Number(Array.isArray(value) ? value[0] : value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function Properties({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;
	const minPerches = numberParam(params.minPerches);
	const maxSqFt = numberParam(params.maxSqFt);
	const minRoadWidth = numberParam(params.minRoadWidth);
	const listings = await getListings({ minPerches, maxSqFt, minRoadWidth });
	return (
		<main className="site-shell">
			<SiteHeader />
			<section className="page-heading">
				<div>
					<p className="eyebrow">The property index</p>
					<h1>
						Find your
						<br />
						<em>next place.</em>
					</h1>
				</div>
				<p>Search land by the practical details that shape its potential.</p>
			</section>
			<section className="search-workspace">
				<form
					className="search-bar"
					method="get">
					<label>
						Minimum perches
						<input
							name="minPerches"
							type="number"
							min="0"
							step="0.1"
							defaultValue={minPerches}
							placeholder="Any"
						/>
					</label>
					<label>
						Maximum square feet
						<input
							name="maxSqFt"
							type="number"
							min="0"
							step="1"
							defaultValue={maxSqFt}
							placeholder="Any"
						/>
					</label>
					<label>
						Minimum road width
						<input
							name="minRoadWidth"
							type="number"
							min="0"
							step="0.1"
							defaultValue={minRoadWidth}
							placeholder="Any"
						/>
					</label>
					<button
						className="button button-dark"
						type="submit">
						Search <span>↗</span>
					</button>
				</form>
				<div className="results-bar">
					<span>
						<strong>{listings.length}</strong> properties found
					</span>
					<Link href="/properties">Clear filters</Link>
				</div>
				<div className="property-grid property-grid-index">
					{listings.map((listing) => (
						<PropertyCard
							key={listing.id}
							listing={listing}
						/>
					))}
				</div>
				{listings.length === 0 && (
					<div className="empty">
						No properties match those filters. Try widening your search.
					</div>
				)}
			</section>
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

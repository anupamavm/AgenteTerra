import Link from "next/link";
import { notFound } from "next/navigation";
import {
	getListingById,
	getListingImages,
	getListings,
} from "../../actions/get-listings";
import { PhotoGallery } from "../../components/photo-gallery";
import { SiteHeader } from "../../components/site-header";

export default async function PropertyDetail({
	params,
}: Readonly<{
	params: Promise<{ id: string }>;
}>) {
	const { id } = await params;
	const listing = await getListingById(Number(id));
	if (!listing) notFound();
	const [images, allListings] = await Promise.all([
		getListingImages(listing.id),
		getListings(),
	]);
	const related = allListings
		.filter((item) => item.id !== listing.id)
		.slice(0, 3);
	return (
		<main className="site-shell">
			<SiteHeader />
			<Link
				className="back-link"
				href="/properties">
				← Back to properties
			</Link>
			<section className="detail-hero">
				<div className="detail-visual">
					{images.length > 0 && (
						<PhotoGallery
							images={images}
							alt={listing.title}
						/>
					)}
					<span>PROPERTY / {String(listing.id).padStart(2, "0")}</span>
					<strong>{listing.locality}</strong>
					<i />
				</div>
				<div className="detail-summary">
					<p className="eyebrow">
						{listing.stateRegion} / {listing.locality}
					</p>
					<h1>{listing.title}</h1>
					<p className="detail-lede">
						A considered parcel with the scale and access to support your next
						move.
					</p>
					<div className="detail-price">
						<span>Guide price</span>
						<strong>
							{listing.currency ?? "USD"} {listing.priceUnits.toLocaleString()}
						</strong>
					</div>
					<Link
						className="button button-dark"
						href="/account">
						Enquire about this property <span>↗</span>
					</Link>
				</div>
			</section>
			<section className="detail-content">
				<div>
					<p className="eyebrow">Property details</p>
					<h2>
						The useful facts,
						<br />
						at a glance.
					</h2>
				</div>
				<div className="detail-facts">
					<div>
						<span>Land size</span>
						<strong>
							{listing.landSizeArea.toLocaleString()}{" "}
							{listing.areaUnit ?? "sqft"}
						</strong>
					</div>
					<div>
						<span>Road width</span>
						<strong>
							{listing.roadWidthMeters ?? "Not listed"}
							{listing.roadWidthMeters ? " m" : ""}
						</strong>
					</div>
					<div>
						<span>Location</span>
						<strong>
							{listing.locality}, {listing.stateRegion}
						</strong>
					</div>
					<div>
						<span>Coordinates</span>
						<strong>
							{listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
						</strong>
					</div>
				</div>
			</section>
			<section className="related-section">
				<div className="section-heading">
					<div>
						<p className="eyebrow">Keep exploring</p>
						<h2>More like this</h2>
					</div>
					<Link
						className="text-link"
						href="/properties">
						View all <span>↗</span>
					</Link>
				</div>
				<div className="property-grid">
					{related.map((item) => (
						<Link
							key={item.id}
							href={`/properties/${item.id}`}>
							<div className="related-mini">
								<span>{item.locality}</span>
								<strong>{item.title}</strong>
								<small>
									{item.landSizeArea.toLocaleString()} {item.areaUnit ?? "sqft"}
								</small>
							</div>
						</Link>
					))}
				</div>
			</section>
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

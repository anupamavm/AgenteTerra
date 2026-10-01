import Link from "next/link";
import { getListings } from "./actions/get-listings";
import { PropertyCard } from "./components/property-card";
import { SiteHeader } from "./components/site-header";

export default async function Home() {
	const listings = await getListings();
	return (
		<main className="site-shell">
			<SiteHeader />
			<section className="home-hero">
				<div className="hero-copy">
					<p className="eyebrow">A better way to find ground</p>
					<h1>
						Land that makes
						<br />
						<em>sense.</em>
					</h1>
					<p>
						Explore real properties with the details that matter: access, scale,
						location, and a clear price.
					</p>
					<div className="hero-actions">
						<Link
							className="button button-dark"
							href="/properties">
							Explore properties <span>↗</span>
						</Link>
						<Link
							className="button button-link"
							href="/sell">
							List your land
						</Link>
					</div>
				</div>
				<div className="hero-art">
					<div className="hero-art-label">
						AGENTETERRA
						<br />
						<span>FIELD NOTES / 001</span>
					</div>
					<div className="hero-art-grid" />
					<div className="hero-coordinate">
						06° 55′ 42″ N<br />
						79° 51′ 40″ E
					</div>
				</div>
			</section>
			<section className="home-intro">
				<p className="eyebrow">The marketplace for better decisions</p>
				<h2>
					Not just a pin on a map.
					<br />
					<span>A place to begin.</span>
				</h2>
				<Link
					className="text-link"
					href="/properties">
					See all properties <span>↗</span>
				</Link>
			</section>
			<section className="featured-section">
				<div className="section-heading">
					<div>
						<p className="eyebrow">Fresh from the field</p>
						<h2>Featured properties</h2>
					</div>
					<Link
						className="button button-outline button-small"
						href="/properties">
						View all
					</Link>
				</div>
				<div className="property-grid">
					{listings.slice(0, 3).map((listing, index) => (
						<PropertyCard
							key={listing.id}
							listing={listing}
							featured={index === 0}
						/>
					))}
				</div>
			</section>
			<section className="home-cta">
				<p className="eyebrow">Have land to sell?</p>
				<h2>
					Put the right details
					<br />
					in the right hands.
				</h2>
				<Link
					className="button button-accent"
					href="/sell">
					Start a listing <span>↗</span>
				</Link>
			</section>
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

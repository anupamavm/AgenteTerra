import Link from "next/link";
import { getListings } from "../actions/get-listings";
import { ListingManagementList } from "../components/listing-management-list";
import { SiteHeader } from "../components/site-header";
import { requireAdmin } from "../../lib/auth";

export default async function Admin() {
	await requireAdmin();
	const listings = await getListings();
	return (
		<main className="site-shell">
			<SiteHeader />
			<section className="management-heading">
				<div>
					<p className="eyebrow">Administration</p>
					<h1>All listings</h1>
				</div>
				<div className="account-actions">
					<span className="management-count">{listings.length} total</span>
					<Link
						className="button button-dark"
						href="/sell">
						Add listing <span>↗</span>
					</Link>
				</div>
			</section>
			<ListingManagementList
				listings={listings}
				showOwner
			/>
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

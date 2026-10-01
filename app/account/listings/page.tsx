import Link from "next/link";
import { getListings } from "../../actions/get-listings";
import { ListingManagementList } from "../../components/listing-management-list";
import { SiteHeader } from "../../components/site-header";
import { requireUser } from "../../../lib/auth";

export default async function AccountListings() {
	const user = await requireUser();
	const listings = await getListings({ ownerId: user.id });
	return (
		<main className="site-shell">
			<SiteHeader />
			<section className="management-heading">
				<div>
					<p className="eyebrow">Your account</p>
					<h1>Your listings</h1>
				</div>
				<Link
					className="button button-dark"
					href="/sell">
					Add a listing <span>↗</span>
				</Link>
			</section>
			<ListingManagementList listings={listings} />
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

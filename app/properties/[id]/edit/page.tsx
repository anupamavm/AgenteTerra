import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "../../../actions/get-listings";
import { EditListingForm } from "../../../components/edit-listing-form";
import { SiteHeader } from "../../../components/site-header";
import { requireUser } from "../../../../lib/auth";

export default async function EditProperty({
	params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
	const user = await requireUser();
	const { id: rawId } = await params;
	const id = Number(rawId);
	if (!Number.isSafeInteger(id) || id < 1) notFound();
	const listing = await getListingById(id);
	if (!listing || (user.role !== "admin" && listing.ownerId !== user.id)) {
		notFound();
	}

	return (
		<main className="site-shell">
			<SiteHeader />
			<Link
				className="back-link"
				href={`/properties/${listing.id}`}>
				← Back to property
			</Link>
			<section className="management-heading edit-heading">
				<div>
					<p className="eyebrow">
						Listing / {String(listing.id).padStart(2, "0")}
					</p>
					<h1>Edit property</h1>
				</div>
			</section>
			<EditListingForm listing={listing} />
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

import Link from "next/link";
import { getCurrentUser } from "../actions/auth";
import { ListingForm } from "../components/listing-form";
import { SiteHeader } from "../components/site-header";

export default async function Sell() {
	const user = await getCurrentUser();
	return (
		<main className="site-shell">
			<SiteHeader />
			<section className="page-heading sell-heading">
				<div>
					<p className="eyebrow">For landowners</p>
					<h1>
						Make your
						<br />
						<em>next move.</em>
					</h1>
				</div>
				<p>
					Give your property the context it deserves. A clear, useful listing
					attracts more considered enquiries.
				</p>
			</section>
			{user ? (
				<ListingForm />
			) : (
				<section className="sell-gate">
					<p className="eyebrow">One small step first</p>
					<h2>
						Sign in to publish
						<br />
						your property.
					</h2>
					<Link
						className="button button-dark"
						href="/account">
						Go to account <span>↗</span>
					</Link>
				</section>
			)}
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

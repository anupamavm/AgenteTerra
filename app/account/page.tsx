import Link from "next/link";
import { getCurrentUser } from "../actions/auth";
import { AuthForms } from "../components/auth-forms";
import { SiteHeader } from "../components/site-header";

export default async function Account() {
	const user = await getCurrentUser();
	return (
		<main className="site-shell">
			<SiteHeader />
			{user ? (
				<section className="account-welcome">
					<p className="eyebrow">Your account</p>
					<h1>
						Welcome back,
						<br />
						<em>{user.name}.</em>
					</h1>
					<p>Ready to put another property in front of the right people?</p>
					<Link
						className="button button-dark"
						href="/sell">
						List a property <span>↗</span>
					</Link>
				</section>
			) : (
				<>
					<section className="page-heading account-heading">
						<div>
							<p className="eyebrow">Your place in the market</p>
							<h1>
								Good ground
								<br />
								<em>starts here.</em>
							</h1>
						</div>
					</section>
					<AuthForms />
				</>
			)}
			<footer>
				<span>AGENTETERRA / 2026</span>
				<span>Built for better ground decisions</span>
			</footer>
		</main>
	);
}

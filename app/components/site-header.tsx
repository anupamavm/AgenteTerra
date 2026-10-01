import Link from "next/link";
import { getCurrentUser, logout } from "../actions/auth";

export async function SiteHeader() {
	const user = await getCurrentUser();
	return (
		<header className="site-header">
			<Link
				className="brand"
				href="/">
				AgenteTerra <span>PROPERTY MARKET</span>
			</Link>
			<nav
				className="main-nav"
				aria-label="Main navigation">
				<Link href="/properties">Explore</Link>
				<Link href="/properties?sort=newest">New listings</Link>
				<Link href="/sell">Sell land</Link>
			</nav>
			<div className="header-account">
				{user ? (
					<>
						<Link
							className="user-chip"
							href="/account">
							Hi, {user.name}
						</Link>
						{user.role === "admin" && (
							<Link
								className="text-link admin-nav-link"
								href="/admin">
								Admin
							</Link>
						)}
						<form action={logout}>
							<button
								className="text-button"
								type="submit">
								Log out
							</button>
						</form>
					</>
				) : (
					<Link
						className="button button-dark button-small"
						href="/account">
						Sign in
					</Link>
				)}
			</div>
		</header>
	);
}

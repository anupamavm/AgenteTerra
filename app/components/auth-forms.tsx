import { login, register } from "../actions/auth";

export function AuthForms() {
	return (
		<div className="auth-grid">
			<section className="auth-panel auth-panel-dark">
				<p className="eyebrow">New to AgenteTerra</p>
				<h2>
					Own a plot?
					<br />
					Make it visible.
				</h2>
				<p>
					Create a free account to publish land and keep your listings in one
					place.
				</p>
				<form
					className="stack-form"
					action={register}>
					<label>
						Your name
						<input
							name="name"
							required
						/>
					</label>
					<label>
						Email
						<input
							name="email"
							required
							type="email"
						/>
					</label>
					<label>
						Password
						<input
							name="password"
							required
							type="password"
							minLength={8}
							placeholder="At least 8 characters"
						/>
					</label>
					<button
						className="button button-accent"
						type="submit">
						Create account <span>↗</span>
					</button>
				</form>
			</section>
			<section className="auth-panel">
				<p className="eyebrow">Welcome back</p>
				<h2>
					Pick up
					<br />
					where you left off.
				</h2>
				<form
					className="stack-form"
					action={login}>
					<label>
						Email
						<input
							name="email"
							required
							type="email"
						/>
					</label>
					<label>
						Password
						<input
							name="password"
							required
							type="password"
						/>
					</label>
					<input
						type="hidden"
						name="redirect"
						value="/account"
					/>
					<button
						className="button button-dark"
						type="submit">
						Log in <span>↗</span>
					</button>
				</form>
			</section>
		</div>
	);
}

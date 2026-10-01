import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { config } from "./config";

export const sessionCookieName = "agenteterra_user";

export function createSessionValue(userId: number) {
	const payload = String(userId);
	const signature = createHmac("sha256", config.authSecret)
		.update(payload)
		.digest("hex");
	return `${payload}.${signature}`;
}

function sessionUserId(value: string | undefined) {
	if (!value) return null;
	const [payload, signature, extra] = value.split(".");
	if (!payload || !signature || extra !== undefined) return null;
	const expected = createHmac("sha256", config.authSecret)
		.update(payload)
		.digest("hex");
	if (
		signature.length !== expected.length ||
		!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
	)
		return null;
	const userId = Number(payload);
	return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function getAuthenticatedUser() {
	if (!config.features.userAccounts) return null;
	const userId = sessionUserId((await cookies()).get(sessionCookieName)?.value);
	if (!userId) return null;
	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return user ?? null;
}

export async function requireUser() {
	const user = await getAuthenticatedUser();
	if (!user) {
		redirect("/account?authError=Please+log+in+to+continue.");
	}
	return user;
}

export async function requireAdmin() {
	const user = await requireUser();
	if (user.role !== "admin") redirect("/");
	return user;
}

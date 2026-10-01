"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import {
	createSessionValue,
	getAuthenticatedUser,
	sessionCookieName,
} from "../../lib/auth";
import { config } from "../../lib/config";

function hashPassword(password: string) {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password: string, storedHash: string) {
	const [salt, hash] = storedHash.split(":");
	if (!salt || !hash) return false;
	const expected = Buffer.from(hash, "hex");
	const actual = scryptSync(password, salt, 64);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function safeRedirect(value: FormDataEntryValue | null) {
	return typeof value === "string" && value.startsWith("/") ? value : "/";
}

export async function register(formData: FormData) {
	if (!config.features.userAccounts) {
		redirect("/?authError=Accounts are currently unavailable.");
	}
	const name = String(formData.get("name") ?? "").trim();
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase();
	const password = String(formData.get("password") ?? "");
	if (!name || !email.includes("@") || password.length < 8) {
		redirect(
			"/?authError=Use a name, a valid email, and a password of at least 8 characters.",
		);
	}

	try {
		const [user] = await db
			.insert(users)
			.values({
				name,
				email,
				passwordHash: hashPassword(password),
			})
			.returning({ id: users.id });
		if (user) {
			const cookieStore = await cookies();
			cookieStore.set(sessionCookieName, createSessionValue(user.id), {
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				maxAge: 60 * 60 * 24 * 30,
				path: "/",
			});
		}
	} catch {
		redirect("/?authError=That email is already registered.");
	}
	redirect("/?auth=registered");
}

export async function login(formData: FormData) {
	if (!config.features.userAccounts) {
		redirect("/?authError=Accounts are currently unavailable.");
	}
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase();
	const password = String(formData.get("password") ?? "");
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	if (!user || !verifyPassword(password, user.passwordHash)) {
		redirect("/?authError=Email or password is incorrect.");
	}
	const cookieStore = await cookies();
	cookieStore.set(sessionCookieName, createSessionValue(user.id), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 30,
		path: "/",
	});
	redirect(safeRedirect(formData.get("redirect")));
}

export async function logout() {
	(await cookies()).delete(sessionCookieName);
	redirect("/");
}

export async function getCurrentUser() {
	return getAuthenticatedUser();
}

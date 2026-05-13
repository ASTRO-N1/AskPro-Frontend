/**
 * Token / session helpers for AskPro.
 *
 * The backend stores the JWT in an httpOnly cookie ("auth_token") — so the
 * browser handles it automatically. We keep a lightweight user object in
 * sessionStorage so UI components can access display info (name, role, email)
 * without decoding the JWT on the client.
 */

import type { User } from "@/types/auth";

const USER_KEY = "askpro_user";

export function saveUser(user: User): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(USER_KEY);
  }
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

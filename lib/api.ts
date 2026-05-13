/**
 * Axios instance + typed API calls for AskPro.
 *
 * BACKEND CONTRACT (source: backend/src/modules/auth)
 * ─────────────────────────────────────────────────────
 * Base URL  : process.env.NEXT_PUBLIC_API_URL  (default http://localhost:3000)
 * Auth      : httpOnly cookie "auth_token" — sent automatically via withCredentials
 * CORS      : backend sets credentials:true, origin from ALLOWED_ORIGINS env
 *
 * LOGIN
 *   POST /api/auth/login
 *   Body    : { email: string, password: string }
 *   200     : { token: string, user: { name, email, role } }
 *             + sets httpOnly cookie auth_token (72h, sameSite=lax)
 *   401     : { message: "Invalid credentials" }
 *
 * CREATE USER  (admin-only — requires SUPER role cookie)
 *   POST /api/auth/users
 *   Body    : { name, email, mobile, password, role? }
 *   201     : { id, name, email, mobile, role, isActive, createdAt }
 *   409     : { message: "User with this email or mobile already exists" }
 *
 * LOGOUT
 *   POST /api/auth/logout  (requires auth cookie)
 *   200     : { message: "Logged out successfully" }
 *
 * NOTE: There is NO public self-registration endpoint.
 * User creation is an admin (SUPER) operation only.
 */

import axios, { AxiosError } from "axios";
import type { LoginRequest, LoginResponse, CreateUserRequest, CreateUserResponse, User } from "@/types/auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  withCredentials: true, // required: sends httpOnly auth_token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Response interceptor — global 401 handler ─────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Cookie may have expired; redirect to login on client
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Validates the auth_token cookie and returns the current user.
 * Returns 401 if the cookie is missing or expired.
 */
export async function getMe(): Promise<{ user: User }> {
  const { data } = await apiClient.get<{ user: User }>("/api/auth/me");
  return data;
}

/**
 * POST /api/auth/login
 * Authenticates the user. Backend sets httpOnly auth_token cookie on success.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const body: LoginRequest = { email, password };
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", body);
  return data;
}

/**
 * POST /api/auth/users   (SUPER admin only)
 * Creates a new user. Requires an active SUPER session cookie.
 */
export async function createUser(
  payload: CreateUserRequest
): Promise<CreateUserResponse> {
  const { data } = await apiClient.post<CreateUserResponse>("/api/auth/users", payload);
  return data;
}

/**
 * POST /api/auth/logout
 * Clears the auth_token cookie on the server side.
 */
export async function logoutUser(): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/api/auth/logout");
  return data;
}

export default apiClient;

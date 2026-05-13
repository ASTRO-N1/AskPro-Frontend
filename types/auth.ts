/**
 * TypeScript types for AskPro auth — derived directly from the backend.
 *
 * BACKEND ANALYSIS (AskPro-backend / src/modules/auth)
 * =====================================================
 * Framework   : Express + TypeScript + Prisma (PostgreSQL)
 * Base path   : /api/auth
 * Port        : 3000 (PORT env var)
 *
 * ── LOGIN ──────────────────────────────────────────────────────────────────
 *  Method  : POST
 *  Path    : /api/auth/login
 *  Body    : { email: string, password: string }
 *  Success : 200 { token: string, user: { name, email, role } }
 *            → Also sets httpOnly cookie "auth_token" (maxAge 72h, sameSite=lax)
 *  Errors  : 401 { message: "Invalid credentials" }
 *            400 { message: string }  (zod validation)
 *
 * ── CREATE USER (admin-only, NOT public signup) ─────────────────────────
 *  Method  : POST
 *  Path    : /api/auth/users
 *  Auth    : Requires auth_token cookie + role SUPER
 *  Body    : { name, email, mobile, password, role? }
 *  Success : 201 { id, name, email, mobile, role, isActive, createdAt }
 *  Errors  : 409 { message: "User with this email or mobile already exists" }
 *
 * ── LOGOUT ──────────────────────────────────────────────────────────────
 *  Method  : POST  /api/auth/logout  (requires cookie auth)
 *  Success : 200 { message: "Logged out successfully" }
 *
 * ── AUTH MECHANISM ──────────────────────────────────────────────────────
 *  Type            : JWT — single token (no refresh token)
 *  Expiry          : 7d
 *  Storage         : httpOnly cookie "auth_token" (set by backend)
 *  Protected routes: Read token from cookie (not Authorization header)
 *  CORS            : credentials: true  (withCredentials required in Axios)
 *
 * ── VALIDATION RULES ────────────────────────────────────────────────────
 *  email    : valid email format
 *  password : min 8 characters (create), min 1 (login)
 *  name     : min 2 characters
 *  mobile   : /^\+?[0-9]{10,15}$/
 *  role     : SUPER | ENGR | OPER | MNGR  (default: OPER)
 *
 * ── CORS ────────────────────────────────────────────────────────────────
 *  Allowed origins : ALLOWED_ORIGINS env var (comma-separated)
 *  credentials     : true
 */

export type UserRole = "SUPER" | "ENGR" | "OPER" | "MNGR";

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/** Admin-only — only a SUPER user can call POST /api/auth/users */
export interface CreateUserRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role?: UserRole;
}

export interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthError {
  /** errorHandler.ts returns { error: "..." } for AppError and 500s */
  error?: string;
  /** zod validation middleware returns { message: "..." } in some paths */
  message?: string;
}

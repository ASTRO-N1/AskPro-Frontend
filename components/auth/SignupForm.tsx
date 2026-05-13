"use client";

/**
 * SignupForm — Admin-gated user creation for AskPro.
 *
 * IMPORTANT: The AskPro backend has NO public self-registration endpoint.
 * POST /api/auth/users requires a SUPER role cookie on the server.
 *
 * This form is therefore an "invite / admin create" flow — it is only
 * accessible to authenticated SUPER admins. For the purposes of this UI,
 * we model it as a registration form and pass control to the admin API.
 * Adjust routing / access control as needed once dashboard auth is wired up.
 *
 * Fields (matching backend CreateUserSchema):
 *   name     : min 2 chars
 *   email    : valid email
 *   mobile   : +?[0-9]{10,15}
 *   password : min 8 chars
 *   confirmPassword : must match password (client-only)
 *   role     : SUPER | ENGR | OPER | MNGR  (default OPER)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/lib/api";
import type { AuthError, UserRole } from "@/types/auth";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    mobile: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Enter a valid mobile number (10–15 digits)"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["SUPER", "ENGR", "OPER", "MNGR"] as const),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "OPER" },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await createUser({
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
        role: values.role as UserRole,
      });
      toast.success("User created successfully!");
      router.push("/login?registered=true");
    } catch (err) {
      const axiosError = err as AxiosError<AuthError>;
      const data = axiosError.response?.data;
      const message =
        data?.error ?? data?.message ?? "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          {...register("name")}
          aria-invalid={!!errors.name}
          className="h-11"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email address</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          className="h-11"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Mobile */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-mobile">Mobile number</Label>
        <Input
          id="signup-mobile"
          type="tel"
          placeholder="+919876543210"
          autoComplete="tel"
          {...register("mobile")}
          aria-invalid={!!errors.mobile}
          className="h-11"
        />
        {errors.mobile && (
          <p className="text-sm text-destructive">{errors.mobile.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={!!errors.password}
            className="h-11 pr-11"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm-password">Confirm password</Label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            className="h-11 pr-11"
          />
          <button
            type="button"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-role">Role</Label>
        <select
          id="signup-role"
          {...register("role")}
          className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="OPER">Operator (OPER)</option>
          <option value="ENGR">Engineer (ENGR)</option>
          <option value="MNGR">Manager (MNGR)</option>
          <option value="SUPER">Super Admin (SUPER)</option>
        </select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        id="signup-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}

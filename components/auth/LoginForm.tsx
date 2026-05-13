"use client";

import { useState, useEffect } from "react";
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
import { loginUser, getMe } from "@/lib/api";
import { saveUser } from "@/lib/auth";
import type { AuthError } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true); // checking existing session

  // ── On mount: call /me — redirect to dashboard if cookie is still valid ──
  useEffect(() => {
    getMe()
      .then(({ user }) => {
        saveUser(user);
        router.replace("/dashboard");
      })
      .catch(() => {
        // 401 = no valid cookie, stay on login page
        setChecking(false);
      });
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await loginUser(values.email, values.password);
      saveUser(result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
      router.push("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<AuthError>;
      const data = axiosError.response?.data;
      const message =
        data?.error ?? data?.message ?? "Login failed. Please try again.";
      toast.error(message);
    }
  };

  // Show a full-screen spinner while checking the existing session
  if (checking) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
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

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
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

      {/* Submit */}
      <Button
        id="login-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

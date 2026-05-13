import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <AuthCard
        title="Create account"
        subtitle="Join AskPro — IoT management made simple"
      >
        <div className="space-y-6">
          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}

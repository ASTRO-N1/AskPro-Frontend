import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { SuccessBanner } from "@/components/auth/SuccessBanner";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Success banner shown after account creation by an admin */}
      <Suspense>
        <SuccessBanner />
      </Suspense>

      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your AskPro account"
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}

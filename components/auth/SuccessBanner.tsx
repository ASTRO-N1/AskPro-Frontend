"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function SuccessBanner() {
  const params = useSearchParams();
  const registered = params.get("registered");

  if (registered !== "true") return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
      style={{
        borderColor: "var(--accent)",
        background: "var(--secondary)",
        color: "var(--secondary-foreground)",
      }}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
      <span>
        <strong>Account created!</strong> Please sign in with your credentials.
      </span>
    </div>
  );
}

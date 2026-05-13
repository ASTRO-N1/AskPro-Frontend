"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { getUser, clearUser } from "@/lib/auth";
import { logoutUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/auth";

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUser();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out properly. Local session cleared.");
      clearUser();
      router.push("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserIcon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium hidden sm:inline-block">
          {user.name}
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {user.role}
              </span>
            </div>
            <div className="p-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

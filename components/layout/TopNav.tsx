import Link from "next/link";
import { Bell } from "lucide-react";
import { UserNav } from "./UserNav";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background px-5 sm:px-8">
      {/* Left — mobile logo */}
      <div className="flex items-center gap-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 border border-primary/30">
            <span className="text-primary font-bold text-xs">AP</span>
          </div>
          <span className="text-sm font-bold text-foreground">AskPro</span>
        </Link>
      </div>

      {/* Spacer on desktop */}
      <div className="hidden lg:flex" />

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <ThemeToggle />
        <div className="h-5 w-px bg-border mx-1" />
        <UserNav />
      </div>
    </header>
  );
}

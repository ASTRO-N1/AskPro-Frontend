"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Setup", href: "/setup", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col lg:flex h-screen sticky top-0 bg-sidebar border-r border-sidebar-border/50 text-sidebar-foreground">
      {/* Header / Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-foreground/20">
            <span className="text-[10px] font-bold">AP</span>
          </div>
          <span className="text-sm font-semibold tracking-wide">AskPro Inc.</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-150 h-10",
                isActive
                  ? "rounded-full bg-primary text-primary-foreground shadow-sm"
                  : "rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & User Profile Footer */}
      <div className="p-4 mt-auto border-t border-sidebar-border/50">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-xs font-medium text-sidebar-foreground/50">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 rounded-xl hover:bg-sidebar-accent/50 p-2 cursor-pointer transition-colors">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center border border-sidebar-border shrink-0">
            <span className="text-xs font-medium text-sidebar-foreground/80">AU</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">admin@askpro.com</p>
          </div>
          <MoreHorizontal className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
        </div>
      </div>
    </aside>
  );
}

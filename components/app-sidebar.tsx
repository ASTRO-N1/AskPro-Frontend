"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  MonitorSmartphoneIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
import { getUser, clearUser } from "@/lib/auth"
import { logoutUser } from "@/lib/api"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<{ name: string; email: string; role?: string } | null>(null)

  React.useEffect(() => {
    const u = getUser()
    if (u) {
      setUser({ name: u.name, email: u.email, role: u.role })
    }
  }, [])

  const handleLogout = React.useCallback(async () => {
    try {
      await logoutUser()
      clearUser()
      router.push("/login")
      toast.success("Logged out successfully")
    } catch {
      clearUser()
      router.push("/login")
      toast.error("Session cleared.")
    }
  }, [router])

  const isSuperAdmin = user?.role === "SUPER"

  const navMain = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: pathname === "/dashboard",
    },
    ...(isSuperAdmin
      ? [
          {
            title: "Devices",
            url: "/dashboard/devices",
            icon: <MonitorSmartphoneIcon />,
            isActive: pathname.startsWith("/dashboard/devices"),
          },
          {
            title: "Users",
            url: "/dashboard/users",
            icon: <UsersIcon />,
            isActive: pathname.startsWith("/dashboard/users"),
          },
        ]
      : []),
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Edge-anchored wave decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

        {/* ── LIGHT MODE waves ─────────────────────────────── */}
        <svg
          className="absolute bottom-0 left-0 w-full dark:hidden"
          viewBox="0 0 272 400" fill="none" preserveAspectRatio="none"
          style={{ height: "400px" }}
        >
          <defs>
            <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="40" />
            </filter>
            <radialGradient id="mesh-l1" cx="10%" cy="100%" r="80%">
              <stop offset="0%"   stopColor="#99dcc8" stopOpacity="0.35" />
              <stop offset="40%"  stopColor="#b7ead7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f3fbf8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mesh-l2" cx="40%" cy="90%" r="60%">
              <stop offset="0%"   stopColor="#b7ead7" stopOpacity="0.3" />
              <stop offset="60%"  stopColor="#dff7ef" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f3fbf8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mesh-l3" cx="0%" cy="70%" r="50%">
              <stop offset="0%"   stopColor="#dff7ef" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f3fbf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="272" height="400" fill="url(#mesh-l1)" filter="url(#glow-light)" />
          <rect x="0" y="0" width="272" height="400" fill="url(#mesh-l2)" filter="url(#glow-light)" />
          <rect x="0" y="0" width="272" height="400" fill="url(#mesh-l3)" filter="url(#glow-light)" />
          <path d="M 0,0 C 60,100 140,-10 272,0 L 272,400 L 0,400 Z"   fill="#dff7ef" opacity="1" />
          <path d="M 0,90 C 60,140 140,30 272,10 L 272,400 L 0,400 Z"  fill="#b7ead7" opacity="0.35" />
          <path d="M 0,180 C 60,180 140,70 272,55 L 272,400 L 0,400 Z" fill="#99dcc8" opacity="0.25" />
          <path d="M 0,30 C 60,90 140,-20 272,0"  stroke="#b7ead7" strokeWidth="1" opacity="1"   fill="none" />
          <path d="M 0,170 C 70,170 130,60 272,55" stroke="#99dcc8" strokeWidth="1" opacity="1"   fill="none" />
        </svg>

        {/* ── DARK MODE waves ──────────────────────────────── */}
        <svg
          className="absolute bottom-0 left-0 w-full hidden dark:block"
          viewBox="0 0 272 500" fill="none" preserveAspectRatio="none"
          style={{ height: "500px" }}
        >
          <defs>
            {/* Glow filter for luminous wave edges */}
            <filter id="glow-dark" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Soft ambient glow behind the waves */}
            <filter id="ambient-dark" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="30" />
            </filter>
            {/* Gradient for the topmost crisp wave edge glow */}
            <linearGradient id="wave-edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00A884" stopOpacity="0.9" />
              <stop offset="50%"  stopColor="#00c49a" stopOpacity="1" />
              <stop offset="100%" stopColor="#00A884" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="wave-edge-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00A884" stopOpacity="0.6" />
              <stop offset="60%"  stopColor="#009b7a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#007a5e" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Ambient glow blob — very diffuse background glow */}
          <ellipse cx="116" cy="170" rx="180" ry="120"
            fill="#00A884" opacity="0.04" filter="url(#ambient-dark)" />

          {/* Top crisp glowing edge — wave 1 (back) */}
          <path
            d="M 0,205 C 70,175 140 255 272,45"
            stroke="url(#wave-edge-grad2)" strokeWidth="1.2"
            opacity="0.55" fill="none" filter="url(#glow-dark)"
          />

          {/* Top crisp glowing edge — wave 2 (front, brightest) */}
          <path
            d="M 0,265 C 180,45 190,285 272,25"
            stroke="url(#wave-edge-grad)" strokeWidth="1.5"
            opacity="0.5" fill="none" filter="url(#glow-dark)"
          />
        </svg>
      </div>

      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent"
              render={<Link href="/dashboard" />}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <span className="text-xs font-bold tracking-tight">AP</span>
              </div>
              <span className="text-base font-semibold tracking-tight">AskPro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="relative z-10">
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="relative z-10">
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "",
            avatar: "",
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

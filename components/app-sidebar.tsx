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
} from "lucide-react"
import { getUser, clearUser } from "@/lib/auth"
import { logoutUser } from "@/lib/api"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null)

  React.useEffect(() => {
    const u = getUser()
    if (u) {
      setUser({ name: u.name, email: u.email })
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

  const navMain = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Devices",
      url: "/dashboard/devices",
      icon: <MonitorSmartphoneIcon />,
      isActive: pathname.startsWith("/dashboard/devices"),
    },
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

        {/* Soft abstract wave texture — Bottom-left anchored */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 272 400" fill="none" preserveAspectRatio="none" style={{ height: '400px' }}>
          <defs>
            <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="40" />
            </filter>
            
            {/* Mesh gradient base */}
            <radialGradient id="mesh-1" cx="10%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#99dcc8" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#b7ead7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f3fbf8" stopOpacity="0" />
            </radialGradient>
            
            <radialGradient id="mesh-2" cx="40%" cy="90%" r="60%">
              <stop offset="0%" stopColor="#b7ead7" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#dff7ef" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f3fbf8" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mesh-3" cx="0%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#dff7ef" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f3fbf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Blurred mesh layers for soft glow */}
          <rect x="0" y="0" width="272" height="400" fill="url(#mesh-1)" filter="url(#soft-glow)" />
          <rect x="0" y="0" width="272" height="400" fill="url(#mesh-2)" filter="url(#soft-glow)" />
          <rect x="0" y="0" width="272" height="400" fill="url(#mesh-3)" filter="url(#soft-glow)" />

          {/* Layered translucent curves */}
          <path 
            d="M 0,0 C 60,100 140,-10 272,0 L 272,400 L 0,400 Z" 
            fill="#dff7ef" 
            opacity="1" 
          />
          <path 
            d="M 0,90 C 60,140 140,30 272,10 L 272,400 L 0,400 Z" 
            fill="#b7ead7" 
            opacity="0.35" 
          />
          <path 
            d="M 0,180 C 60,180 140,70 272,55 L 272,400 L 0,400 Z" 
            fill="#99dcc8" 
            opacity="0.25" 
          />
          
          {/* Subtle thin lines for extra texture */}
          <path 
            d="M 0,30 C 60,90 140,-20 272,0" 
            stroke="#b7ead7" 
            strokeWidth="1" 
            opacity="1"
            fill="none"
          />
          <path 
            d="M 0,170 C 70,170 130,60 272,55"
            stroke="#99dcc8" 
            strokeWidth="1" 
            opacity="1"
            fill="none"
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

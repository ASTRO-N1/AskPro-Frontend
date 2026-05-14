"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import {
  LayoutDashboardIcon,
  MonitorSmartphoneIcon,
  SettingsIcon,
  InfoIcon,
} from "lucide-react"

function getPageMeta(pathname: string): { title: string; icon: React.ReactNode } {
  if (pathname === "/dashboard")
    return { title: "Overview", icon: <LayoutDashboardIcon className="size-4" /> }
  if (pathname === "/dashboard/devices")
    return { title: "Devices", icon: <MonitorSmartphoneIcon className="size-4" /> }
  if (pathname.includes("/setup"))
    return { title: "Device Setup", icon: <SettingsIcon className="size-4" /> }
  if (pathname.startsWith("/dashboard/devices/"))
    return { title: "Device Details", icon: <InfoIcon className="size-4" /> }
  return { title: "Dashboard", icon: <LayoutDashboardIcon className="size-4" /> }
}

export function SiteHeader() {
  const pathname = usePathname()
  const { title, icon } = getPageMeta(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1.5 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex items-center gap-2 text-foreground/80">
          {icon}
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

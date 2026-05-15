"use client"

import * as React from "react"
import Link from "next/link"
import { getDevices } from "@/lib/api"
import type { Device, DeviceType } from "@/types/device"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MonitorSmartphoneIcon,
} from "lucide-react"

const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  BATCH_CONTROLLER: "Batch Controller",
  TELEMETRY: "Telemetry",
  WATER_ATM: "Water ATM",
}

const DEVICE_TYPE_STYLES: Record<DeviceType, string> = {
  BATCH_CONTROLLER:
    "bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50",
  TELEMETRY:
    "bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/50",
  WATER_ATM:
    "bg-violet-50 text-violet-700 border border-violet-200/60 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50",
}

const FILTER_OPTIONS: { label: string; value: DeviceType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Batch Controller", value: "BATCH_CONTROLLER" },
  { label: "Telemetry", value: "TELEMETRY" },
]

export default function DevicesPage() {
  const [devices, setDevices] = React.useState<Device[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<DeviceType | "ALL">("ALL")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const fetchDevices = React.useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, limit: 20 }
      if (typeFilter !== "ALL") {
        params.deviceType = typeFilter
      }
      const res = await getDevices(params as Parameters<typeof getDevices>[0])
      setDevices(res.data)
      setTotalPages(res.meta.totalPages)
      setTotal(res.meta.total)
    } catch {
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  React.useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const filteredDevices = React.useMemo(() => {
    if (!search.trim()) return devices
    const q = search.toLowerCase()
    return devices.filter(
      (d) =>
        d.deviceId.toLowerCase().includes(q) ||
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.client?.name && d.client.name.toLowerCase().includes(q)) ||
        (d.client?.location && d.client.location.toLowerCase().includes(q))
    )
  }, [devices, search])

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white/80 dark:bg-white/5 border-black/[0.07] dark:border-white/10 shadow-none text-sm rounded-lg placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-teal-500/30 focus-visible:border-teal-400/60"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07]">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTypeFilter(opt.value)
                setPage(1)
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                typeFilter === opt.value
                  ? "bg-white dark:bg-white/10 text-teal-700 dark:text-teal-300 shadow-sm border border-black/[0.06] dark:border-white/[0.08]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/[0.06]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="px-4 lg:px-6">
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-card shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/[0.05] dark:border-white/[0.06] bg-[#f8faf9] dark:bg-white/[0.03] hover:bg-[#f8faf9] dark:hover:bg-white/[0.03]">
                <TableHead className="pl-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 w-[60px]">
                  Status
                </TableHead>
                <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Device
                </TableHead>
                <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Serial No.
                </TableHead>
                <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Type
                </TableHead>
                <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Client
                </TableHead>
                <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Location
                </TableHead>
                <TableHead className="py-2 pr-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 text-right">
                  Updated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-black/[0.04] dark:border-white/[0.05]">
                    <TableCell className="pl-5 py-2.5">
                      <Skeleton className="size-2.5 rounded-full" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-3.5 w-32 rounded" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-3 w-24 rounded" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-3.5 w-24 rounded" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-3.5 w-20 rounded" />
                    </TableCell>
                    <TableCell className="py-2.5 pr-5">
                      <Skeleton className="h-3 w-16 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <MonitorSmartphoneIcon className="size-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground/60">No devices found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device, idx) => (
                  <TableRow
                    key={device.id}
                    className={`group border-b border-black/[0.04] dark:border-white/[0.05] cursor-pointer transition-colors duration-100 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 last:border-0 ${
                      idx % 2 === 1
                        ? "bg-black/[0.008] dark:bg-white/[0.015]"
                        : "bg-white dark:bg-transparent"
                    }`}
                  >
                    {/* Status dot */}
                    <TableCell className="pl-5 py-2.5 w-[60px]">
                      <Link href={`/dashboard/devices/${device.deviceId}`} className="flex items-center">
                        <span className="relative flex size-2.5">
                          {device.isActive && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                          )}
                          <span
                            className={`relative inline-flex rounded-full size-2.5 ${
                              device.isActive
                                ? "bg-emerald-500 shadow-[0_0_7px_2px_rgba(16,185,129,0.35)]"
                                : "bg-red-400 shadow-[0_0_7px_2px_rgba(248,113,113,0.35)]"
                            }`}
                          />
                        </span>
                      </Link>
                    </TableCell>

                    {/* Device name */}
                    <TableCell className="py-2.5">
                      <Link href={`/dashboard/devices/${device.deviceId}`} className="block">
                        <p className="text-sm font-semibold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {device.name || "Unnamed Device"}
                        </p>
                      </Link>
                    </TableCell>

                    {/* Serial number */}
                    <TableCell className="py-2.5">
                      <Link href={`/dashboard/devices/${device.deviceId}`}>
                        <code className="text-[11px] font-mono text-muted-foreground/60 bg-black/[0.03] dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                          {device.deviceId}
                        </code>
                      </Link>
                    </TableCell>

                    {/* Type badge */}
                    <TableCell className="py-2.5">
                      <Link href={`/dashboard/devices/${device.deviceId}`}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-tight ${
                            DEVICE_TYPE_STYLES[device.deviceType] ??
                            "bg-gray-50 text-gray-600 border border-gray-200/60 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50"
                          }`}
                        >
                          {DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}
                        </span>
                      </Link>
                    </TableCell>

                    {/* Client */}
                    <TableCell className="py-2.5">
                      <Link href={`/dashboard/devices/${device.deviceId}`}>
                        <span className="text-sm text-muted-foreground/80">
                          {device.client?.name || <span className="text-muted-foreground/35">—</span>}
                        </span>
                      </Link>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-2.5">
                      <Link href={`/dashboard/devices/${device.deviceId}`}>
                        <span className="text-sm text-muted-foreground/80">
                          {device.client?.location || <span className="text-muted-foreground/35">—</span>}
                        </span>
                      </Link>
                    </TableCell>

                    {/* Updated */}
                    <TableCell className="py-2.5 pr-5 text-right">
                      <Link href={`/dashboard/devices/${device.deviceId}`}>
                        <span className="text-xs text-muted-foreground/55 tabular-nums">
                          {new Date(device.updatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground/60">
              <span className="font-medium text-foreground/80">{total}</span>{" "}
              device{total !== 1 ? "s" : ""} total
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-md border-black/[0.08] dark:border-white/[0.10] bg-white dark:bg-white/[0.04] shadow-none hover:bg-black/[0.03] dark:hover:bg-white/[0.08]"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeftIcon className="size-3.5" />
              </Button>
              <span className="text-xs font-medium text-muted-foreground tabular-nums px-1">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-md border-black/[0.08] dark:border-white/[0.10] bg-white dark:bg-white/[0.04] shadow-none hover:bg-black/[0.03] dark:hover:bg-white/[0.08]"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

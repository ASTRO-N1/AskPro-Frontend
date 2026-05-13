"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Activity, MapPin, Tag, Hash, TrendingUp, Zap } from "lucide-react";
import { DeviceGraphs } from "@/components/dashboard/DeviceGraphs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const infoCards = [
  { label: "Device Type", value: "BATCH CONTROL", icon: Tag, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "Serial Number", value: "LNG123456", icon: Hash, color: "text-teal-400", bg: "bg-teal-500/10" },
  { label: "Dispenser ID", value: "DSP001", icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { label: "Location", value: "Pune Station 01", icon: MapPin, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const summaryStats = [
  { label: "Total Deliveries", value: "1,024", trend: "+12%", icon: TrendingUp },
  { label: "Avg Efficiency", value: "97.8%", trend: "+2.3%", icon: Zap },
];

export default function DeviceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-9 w-9 rounded-lg shrink-0")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Device Details</h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">ID: {id}</p>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {infoCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
            <div className={cn("p-2.5 rounded-lg shrink-0", card.bg)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <p className="text-sm font-bold text-foreground truncate mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {summaryStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-bold tabular-nums text-foreground mt-1">{s.value}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
                <s.icon className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">{s.trend}</span>
              </div>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Transaction History</h2>
        <DeviceGraphs />
      </div>
    </div>
  );
}

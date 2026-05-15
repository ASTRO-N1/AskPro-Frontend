"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUpIcon,
  MonitorSmartphoneIcon,
  ActivityIcon,
  ArrowRightLeftIcon,
  RadioIcon,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  getDevices,
  getBatchTransactions,
  getTelemetryTransactions,
} from "@/lib/api"
import { getUser } from "@/lib/auth"

interface Metrics {
  totalDevices: number
  activeDevices: number
  inactiveDevices: number
  batchTxCount: number
  telemetryCount: number
}

interface TimelinePoint {
  date: string
  batch: number
  telemetry: number
  total: number
}

export default function OverviewPage() {
  const [metrics, setMetrics] = React.useState<Metrics | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [timeline, setTimeline] = React.useState<TimelinePoint[]>([])
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null)

  React.useEffect(() => {
    const u = getUser()
    if (u) {
      setUser({ name: u.name, role: u.role })
    }

    async function fetchMetrics() {
      // If user is not super, we don't need to fetch these metrics
      if (u && u.role !== "SUPER") {
        setLoading(false)
        return
      }

      try {
        const [allDevices, activeDevices, batchTx, telemetryTx, batchRecent, telemetryRecent] =
          await Promise.allSettled([
            getDevices({ limit: 1 }),
            getDevices({ isActive: "true", limit: 1 }),
            getBatchTransactions({ limit: 1 }),
            getTelemetryTransactions({ limit: 1 }),
            getBatchTransactions({ limit: 100 }),
            getTelemetryTransactions({ limit: 100 }),
          ])

        const total =
          allDevices.status === "fulfilled"
            ? (allDevices.value.meta?.total ?? (Array.isArray(allDevices.value) ? allDevices.value.length : 0))
            : 0
        const active =
          activeDevices.status === "fulfilled"
            ? (activeDevices.value.meta?.total ?? (Array.isArray(activeDevices.value) ? activeDevices.value.length : 0))
            : 0
        const batch =
          batchTx.status === "fulfilled"
            ? (batchTx.value.meta?.total ?? (Array.isArray(batchTx.value) ? batchTx.value.length : 0))
            : 0
        const telemetry =
          telemetryTx.status === "fulfilled"
            ? (telemetryTx.value.meta?.total ?? (Array.isArray(telemetryTx.value) ? telemetryTx.value.length : 0))
            : 0


        setMetrics({
          totalDevices: total,
          activeDevices: active,
          inactiveDevices: total - active,
          batchTxCount: batch,
          telemetryCount: telemetry,
        })

        // Mock timeline data for showcase (replace with real data later)
        const mockTimeline: TimelinePoint[] = []
        const seed = (n: number) => Math.abs(Math.sin(n * 9301 + 4927) * 100) % 1
        for (let i = 29; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10)
          const dayOfWeek = d.getDay()
          // Weekdays get more traffic, weekends dip
          const weekdayBoost = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.4 : 0.6
          // Create a natural wave pattern with some randomness
          const wave = Math.sin((29 - i) * 0.22) * 0.4 + 0.6
          const batchVal = Math.round((8 + seed(i * 3) * 18) * weekdayBoost * wave)
          const telemetryVal = Math.round((12 + seed(i * 7 + 5) * 24) * weekdayBoost * wave)
          mockTimeline.push({
            date: key,
            batch: batchVal,
            telemetry: telemetryVal,
            total: batchVal + telemetryVal,
          })
        }
        setTimeline(mockTimeline)
      } catch {
        setMetrics({
          totalDevices: 0,
          activeDevices: 0,
          inactiveDevices: 0,
          batchTxCount: 0,
          telemetryCount: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Skeleton metric cards */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="@container/card">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 mt-2" />
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <Skeleton className="h-4 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (user && user.role !== "SUPER") {
    const roleName = user.role === "MNGR" ? "Manager" : user.role === "OPER" ? "Operator" : user.role === "ENGR" ? "Engineer" : "User"
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-8 px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {roleName}</h1>
        <p className="text-lg text-muted-foreground max-w-[500px]">
          Your personalized dashboard is coming soon.
        </p>
      </div>
    )
  }

  const m = metrics!

  const metricCards = [
    {
      title: "Total Devices",
      value: m.totalDevices,
      icon: MonitorSmartphoneIcon,
      description: "All registered IoT devices",
      trend: null,
      trendLabel: "Across all device types",
    },
    {
      title: "Active Devices",
      value: m.activeDevices,
      icon: ActivityIcon,
      description: "Currently online and operational",
      trend: m.totalDevices > 0
        ? `+${Math.round((m.activeDevices / m.totalDevices) * 100)}%`
        : "0%",
      trendLabel: "Strong uptime ↗",
    },
    {
      title: "Batch Transactions",
      value: m.batchTxCount,
      icon: ArrowRightLeftIcon,
      description: "Total batch controller transactions",
      trend: null,
      trendLabel: "Cumulative total",
    },
    {
      title: "Telemetry Events",
      value: m.telemetryCount,
      icon: RadioIcon,
      description: "Total telemetry data points",
      trend: null,
      trendLabel: "Cumulative total",
    },
  ]

  // Pie chart data
  const deviceStatusData = [
    { name: "Active", value: m.activeDevices, fill: "var(--chart-1)" },
    { name: "Inactive", value: m.inactiveDevices, fill: "var(--chart-4)" },
  ]

  // Bar chart data
  const transactionData = [
    { name: "Batch", count: m.batchTxCount, fill: "var(--chart-2)" },
    { name: "Telemetry", count: m.telemetryCount, fill: "var(--chart-3)" },
  ]

  const pieConfig: ChartConfig = {
    active: { label: "Active", color: "var(--chart-1)" },
    inactive: { label: "Inactive", color: "var(--chart-4)" },
  }

  const barConfig: ChartConfig = {
    batch: { label: "Batch", color: "var(--chart-2)" },
    telemetry: { label: "Telemetry", color: "var(--chart-3)" },
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.title} className="bg-card text-card-foreground rounded-2xl shadow-lg shadow-[rgba(69,163,153,0.15)] border-1 ring-1 ring-foreground/5 p-6 flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start w-full">
              <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
              {card.trend && (
                <div className="text-xs bg-muted px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  {card.trend}
                </div>
              )}
            </div>
            <div>
              <div className="text-3xl font-bold">
                {card.value.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                {card.trendLabel}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {card.description}
              </div>
            </div>
          </div>
        ))}


      </div>

      {/* Full-Width Transaction Activity Chart */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Activity</CardTitle>
            <CardDescription>Overall transaction volume over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradTelemetry" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                    tickFormatter={(val: string) => {
                      const d = new Date(val)
                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }}
                    interval={"equidistantPreserveStart"}
                    minTickGap={40}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    labelFormatter={(val: unknown) => {
                      if (typeof val !== "string" && typeof val !== "number") return ""
                      const d = new Date(val)
                      return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="batch"
                    stackId="1"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#gradBatch)"
                    name="Batch"
                  />
                  <Area
                    type="monotone"
                    dataKey="telemetry"
                    stackId="1"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#gradTelemetry)"
                    name="Telemetry"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full" style={{ background: "var(--chart-2)" }} />
                <span className="text-muted-foreground font-medium">Batch</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full" style={{ background: "var(--chart-1)" }} />
                <span className="text-muted-foreground font-medium">Telemetry</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
        {/* Device Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Device Status</CardTitle>
            <CardDescription>Active vs inactive devices</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieConfig} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={deviceStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={3}
                  stroke="var(--card)"
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-8 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full shadow-sm" style={{ background: "var(--chart-1)" }} />
                <span className="text-muted-foreground font-medium">Active ({m.activeDevices})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full shadow-sm" style={{ background: "var(--chart-4)" }} />
                <span className="text-muted-foreground font-medium">Inactive ({m.inactiveDevices})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Volume Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Volume</CardTitle>
            <CardDescription>Total transactions by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionData} barSize={56}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={13}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                  >
                    {transactionData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  getDevice,
  getDeviceBatchTransactions,
  getDeviceTelemetryTransactions,
} from "@/lib/api"
import type {
  DeviceDetailResponse,
  BatchTransaction,
  TelemetryTransaction,
} from "@/types/device"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeftIcon,
  SettingsIcon,
  MonitorSmartphoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  RadioIcon,
  ActivityIcon,
  MailIcon,
  PhoneIcon,
  WebhookIcon,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

function DeviceCharts({
  device,
  batchTx,
  telemetryTx,
}: {
  device: DeviceDetailResponse
  batchTx: BatchTransaction[]
  telemetryTx: TelemetryTransaction[]
}) {
  if (device.deviceType === "BATCH_CONTROLLER") {
    let activeTx = batchTx
    if (!activeTx.length) {
      activeTx = Array.from({ length: 15 }).map((_, i) => ({
        transactionId: 1000 + i,
        presetQuantity: 100,
        deliveredQuantity: 100 - (Math.random() * 2),
        status: Math.random() > 0.85 ? "FAILED" : "COMPLETED",
      } as unknown as BatchTransaction))
    }

    // Prepare data for Delivery Accuracy (Area Chart)
    const sortedTx = [...activeTx].reverse()

    const accuracyData = sortedTx.map((tx) => ({
      name: `#${tx.transactionId}`,
      preset: tx.presetQuantity,
      delivered: tx.deliveredQuantity,
    }))

    const accuracyConfig: ChartConfig = {
      preset: { label: "Preset", color: "var(--chart-1)" },
      delivered: { label: "Delivered", color: "var(--chart-2)" },
    }

    // Prepare data for Status Distribution (Donut Chart)
    const statusCounts = batchTx.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusData = Object.entries(statusCounts).map(([status, count], i) => ({
      name: status,
      value: count,
      fill: `var(--chart-${(i % 5) + 1})`,
    }))

    const statusConfig: ChartConfig = {
      COMPLETED: { label: "Completed", color: "var(--chart-1)" },
      FAILED: { label: "Failed", color: "var(--chart-2)" },
      ABORTED: { label: "Aborted", color: "var(--chart-3)" },
      CANCELLED: { label: "Cancelled", color: "var(--chart-4)" },
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Delivery Accuracy */}
        <Card className="md:col-span-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none border-black/[0.06] dark:border-white/[0.07]">
          <CardHeader>
            <CardTitle>Delivery Accuracy</CardTitle>
            <CardDescription>Preset vs Delivered Quantity (Recent Transactions)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={accuracyConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="preset" stroke="var(--color-preset)" fill="var(--color-preset)" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="delivered" stroke="var(--color-delivered)" fill="var(--color-delivered)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none border-black/[0.06] dark:border-white/[0.07]">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Recent transaction outcomes</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={statusConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (device.deviceType === "TELEMETRY") {
    let activeTx = telemetryTx
    if (!activeTx.length) {
      activeTx = Array.from({ length: 20 }).map((_, i) => {
        const d = new Date()
        d.setMinutes(d.getMinutes() - (20 - i) * 5)
        return {
          currentTranDateTime: d.toISOString(),
          analogInputs: {
            Temperature: 40 + Math.sin(i * 0.5) * 5 + Math.random() * 2,
            Pressure: 100 + Math.cos(i * 0.3) * 10 + Math.random() * 5,
          },
          alarmsGeneratedStatus: Math.random() > 0.9 ? 1 : 0,
        } as unknown as TelemetryTransaction
      })
    }

    const sortedTx = [...activeTx].reverse()

    // Dynamically find analog keys
    const analogKeys = new Set<string>()
    sortedTx.forEach((tx) => {
      if (tx.analogInputs) {
        Object.keys(tx.analogInputs).forEach((k) => analogKeys.add(k))
      }
    })

    const analogData = sortedTx.map((tx) => {
      const point: any = { name: new Date(tx.currentTranDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      if (tx.analogInputs) {
        Object.entries(tx.analogInputs).forEach(([k, v]) => {
          point[k] = v
        })
      }
      return point
    })

    const analogConfig: ChartConfig = {}
    Array.from(analogKeys).forEach((key, i) => {
      analogConfig[key] = { label: key, color: `var(--chart-${(i % 5) + 1})` }
    })

    // Alarm Data
    const alarmData = sortedTx.map((tx) => ({
      name: new Date(tx.currentTranDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      alarm: tx.alarmsGeneratedStatus === 1 ? 1 : 0,
      normal: tx.alarmsGeneratedStatus === 0 ? 1 : 0,
    }))

    const alarmConfig: ChartConfig = {
      alarm: { label: "Alarm", color: "var(--chart-4)" }, // usually red/orange
      normal: { label: "Normal", color: "var(--chart-2)" }, // usually teal/green
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Analog Sensors */}
        <Card className="md:col-span-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none border-black/[0.06] dark:border-white/[0.07]">
          <CardHeader>
            <CardTitle>Analog Sensors</CardTitle>
            <CardDescription>Sensor readings over recent events</CardDescription>
          </CardHeader>
          <CardContent>
            {analogKeys.size === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No analog data available</div>
            ) : (
              <ChartContainer config={analogConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analogData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {Array.from(analogKeys).map((key) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Alarm History */}
        <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none border-black/[0.06] dark:border-white/[0.07]">
          <CardHeader>
            <CardTitle>Alarm History</CardTitle>
            <CardDescription>Normal vs Alarm state</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={alarmConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alarmData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} domain={[0, 1]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="alarm" stackId="a" fill="var(--color-alarm)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="normal" stackId="a" fill="var(--color-normal)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default function DeviceDetailPage() {
  const params = useParams<{ deviceId: string }>()
  const router = useRouter()
  const deviceId = params.deviceId

  const [device, setDevice] = React.useState<DeviceDetailResponse | null>(null)
  const [batchTx, setBatchTx] = React.useState<BatchTransaction[]>([])
  const [telemetryTx, setTelemetryTx] = React.useState<TelemetryTransaction[]>(
    []
  )
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const deviceData = await getDevice(deviceId)
        setDevice(deviceData)

        // Fetch transactions based on device type
        if (deviceData.deviceType === "BATCH_CONTROLLER") {
          try {
            const txRes = await getDeviceBatchTransactions(deviceId, {
              limit: 10,
            })
            setBatchTx(txRes.data)
          } catch {
            // no transactions yet
          }
        } else if (deviceData.deviceType === "TELEMETRY") {
          try {
            const txRes = await getDeviceTelemetryTransactions(deviceId, {
              limit: 10,
            })
            setTelemetryTx(txRes.data)
          } catch {
            // no transactions yet
          }
        }
      } catch {
        setError("Failed to load device. It may not exist or the server is unreachable.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [deviceId])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 px-4 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (error || !device) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-4">
        <p className="text-lg text-muted-foreground">{error || "Device not found."}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/devices")}>
          <ArrowLeftIcon className="mr-2 size-4" />
          Back to Devices
        </Button>
      </div>
    )
  }

  const config = device.config

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/devices")}
          >
            <ArrowLeftIcon />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{device.name || device.deviceId}</h2>
              <Badge
                variant={device.isActive ? "default" : "secondary"}
                className={device.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : ""}
              >
                {device.isActive ? "● Online" : "● Offline"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              <code className="font-mono">{device.deviceId}</code> · {device.deviceType.replace("_", " ")}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/devices/${device.deviceId}/setup`}>
          <Button>
            <SettingsIcon className="mr-2 size-4" />
            Setup
          </Button>
        </Link>
      </div>

      {/* Info Cards — row 1 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <InfoCard
          icon={MonitorSmartphoneIcon}
          label="Device Type"
          value={device.deviceType.replace("_", " ")}
        />
        <InfoCard
          icon={UserIcon}
          label="Client"
          value={device.client?.name || "Unassigned"}
        />
        <InfoCard
          icon={MapPinIcon}
          label="Location"
          value={device.client?.location || "N/A"}
        />
        <InfoCard
          icon={ClockIcon}
          label="Telemetry Interval"
          value={config ? `${(config as { telemetryInterval?: number }).telemetryInterval ?? "—"} sec` : "—"}
        />
      </div>

      {/* Info Cards — row 2 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <InfoCard
          icon={ActivityIcon}
          label="Active"
          value={device.isActive ? "Yes" : "No"}
        />
        <InfoCard
          icon={CalendarIcon}
          label="Created"
          value={new Date(device.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />
        <InfoCard
          icon={CalendarIcon}
          label="Last Updated"
          value={new Date(device.updatedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />
        <InfoCard
          icon={RadioIcon}
          label="Pending Config Update"
          value={config ? ((config as { pendingUpdate?: boolean }).pendingUpdate ? "Yes" : "No") : "—"}
        />
      </div>

      {/* Config Section */}
      {config && (
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Alert channels and device parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <MailIcon className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alert Emails</p>
                    <p className="text-sm mt-0.5">
                      {(config as { alertEmails?: string[] }).alertEmails?.length
                        ? (config as { alertEmails: string[] }).alertEmails.join(", ")
                        : "None configured"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PhoneIcon className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alert SMS</p>
                    <p className="text-sm mt-0.5">
                      {(config as { alertSms?: string[] }).alertSms?.length
                        ? (config as { alertSms: string[] }).alertSms.join(", ")
                        : "None configured"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <WebhookIcon className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Webhook URL</p>
                    <p className="text-sm mt-0.5 break-all">
                      {(config as { webhookUrl?: string | null }).webhookUrl || "None configured"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Device-specific Parameters */}
              {(config as { parameters?: Record<string, unknown> }).parameters &&
                Object.keys((config as { parameters: Record<string, unknown> }).parameters).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Device Parameters
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(
                          (config as { parameters: Record<string, unknown> }).parameters
                        ).map(([key, value]) => (
                          <div key={key} className="rounded-md bg-muted/50 px-3 py-2">
                            <p className="text-xs text-muted-foreground">{key}</p>
                            <p className="text-sm font-mono mt-0.5">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="px-4 lg:px-6">
        <DeviceCharts device={device} batchTx={batchTx} telemetryTx={telemetryTx} />
      </div>

      {/* Transaction History */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent {device.deviceType === "BATCH_CONTROLLER" ? "batch" : "telemetry"}{" "}
              transactions for this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {device.deviceType === "BATCH_CONTROLLER" ? (
              <BatchTransactionTable transactions={batchTx} />
            ) : device.deviceType === "TELEMETRY" ? (
              <TelemetryTransactionTable transactions={telemetryTx} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Transaction history not available for this device type.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Helper Components ─────────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <Card className="py-4 gap-0">
      <CardContent className="flex items-center gap-3 px-4 py-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BatchTransactionTable({
  transactions,
}: {
  transactions: BatchTransaction[]
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No batch transactions recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Tx ID</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Truck #</TableHead>
            <TableHead className="text-right">Qty (L)</TableHead>
            <TableHead className="text-right">Amount (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-mono text-xs">{tx.transactionId}</TableCell>
              <TableCell className="text-sm">
                {new Date(tx.transactionDateTime).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    tx.status === "COMPLETED"
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                      : tx.status === "FAILED"
                      ? "border-red-500/30 text-red-600 bg-red-500/10"
                      : "border-amber-500/30 text-amber-600 bg-amber-500/10"
                  }
                >
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{tx.truckNumber || "—"}</TableCell>
              <TableCell className="text-right font-mono text-sm">
                {(tx.deliveredQuantity ?? 0).toFixed(1)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                ₹{(tx.deliveredAmount ?? 0).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TelemetryTransactionTable({
  transactions,
}: {
  transactions: TelemetryTransaction[]
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No telemetry events recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Event #</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead>Alarm</TableHead>
            <TableHead>Alarm Code</TableHead>
            <TableHead>Config Type</TableHead>
            <TableHead className="text-right">Frequency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-mono text-xs">{tx.eventNo}</TableCell>
              <TableCell className="text-sm">
                {new Date(tx.currentTranDateTime).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    tx.alarmsGeneratedStatus === 1
                      ? "border-red-500/30 text-red-600 bg-red-500/10"
                      : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                  }
                >
                  {tx.alarmsGeneratedStatus === 1 ? "ACTIVE" : "CLEAR"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{tx.alarmsCode || "—"}</TableCell>
              <TableCell className="text-sm">
                {tx.eventConfigType === 0 ? "Standard" : "Custom"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {tx.eventFreq}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

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

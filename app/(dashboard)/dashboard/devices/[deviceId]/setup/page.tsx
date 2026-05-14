"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { getDevice, getDeviceConfig, updateDevice } from "@/lib/api"
import type { DeviceDetailResponse, DeviceConfig } from "@/types/device"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

import {
  ArrowLeftIcon,
  SaveIcon,
  Loader2Icon,
  SlidersHorizontalIcon,
  MailIcon,
  BellIcon,
  TrashIcon,
  PlusIcon,
} from "lucide-react"

// ── Schema ───────────────────────────────────────────────────────────────

const setupSchema = z.object({
  telemetryInterval: z.number()
    .min(10, "Minimum interval is 10 seconds"),
  alertEmails: z.string(),
  alertSms: z.string(),
  webhookUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  // Batch Controller parameters
  deliveryDeviationThreshold: z.number().min(0).optional(),
  forcedFillingAlertEnabled: z.boolean().optional(),
  // Telemetry parameters — dynamic analog thresholds
  analogThresholds: z
    .array(
      z.object({
        key: z.string().min(1, "Sensor name required"),
        min: z.number(),
        max: z.number(),
      })
    )
    .optional(),
  // Telemetry parameters — dynamic digital expected
  digitalExpected: z
    .array(
      z.object({
        key: z.string().min(1, "Channel name required"),
        value: z.number().min(0).max(1),
      })
    )
    .optional(),
})

type SetupValues = z.infer<typeof setupSchema>

export default function DeviceSetupPage() {
  const params = useParams<{ deviceId: string }>()
  const router = useRouter()
  const deviceId = params.deviceId

  const [device, setDevice] = React.useState<DeviceDetailResponse | null>(null)
  const [config, setConfig] = React.useState<DeviceConfig | null>(null)
  const [loading, setLoading] = React.useState(true)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      telemetryInterval: 60,
      alertEmails: "",
      alertSms: "",
      webhookUrl: "",
      deliveryDeviationThreshold: 5,
      forcedFillingAlertEnabled: false,
      analogThresholds: [],
      digitalExpected: [],
    },
  })


  const {
    fields: analogFields,
    append: addAnalog,
    remove: removeAnalog,
  } = useFieldArray({ control, name: "analogThresholds" })

  const {
    fields: digitalFields,
    append: addDigital,
    remove: removeDigital,
  } = useFieldArray({ control, name: "digitalExpected" })

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [deviceData, configData] = await Promise.all([
          getDevice(deviceId),
          getDeviceConfig(deviceId).catch(() => null),
        ])
        setDevice(deviceData)
        setConfig(configData)

        // Populate form with existing config
        if (configData) {
          const params = configData.parameters as Record<string, unknown> || {}
          const analogThresholds: { key: string; min: number; max: number }[] = []
          const digitalExpected: { key: string; value: number }[] = []

          // Parse analog thresholds
          if (params.analogThresholds && typeof params.analogThresholds === "object") {
            Object.entries(params.analogThresholds as Record<string, { min?: number; max?: number }>).forEach(
              ([key, val]) => {
                analogThresholds.push({
                  key,
                  min: val?.min ?? 0,
                  max: val?.max ?? 100,
                })
              }
            )
          }

          // Parse digital expected states
          if (params.digitalExpected && typeof params.digitalExpected === "object") {
            Object.entries(params.digitalExpected as Record<string, number>).forEach(([key, val]) => {
              digitalExpected.push({ key, value: val })
            })
          }

          reset({
            telemetryInterval: configData.telemetryInterval,
            alertEmails: configData.alertEmails?.join(", ") || "",
            alertSms: configData.alertSms?.join(", ") || "",
            webhookUrl: configData.webhookUrl || "",
            deliveryDeviationThreshold: (params.deliveryDeviationThreshold as number) ?? 5,
            forcedFillingAlertEnabled: (params.forcedFillingAlertEnabled as boolean) ?? false,
            analogThresholds,
            digitalExpected,
          })
        }
      } catch {
        toast.error("Failed to load device configuration")
        router.push(`/dashboard/devices/${deviceId}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [deviceId, reset, router])

  const onSubmit = async (values: SetupValues) => {
    try {
      // Build parameters based on device type
      const parameters: Record<string, unknown> = {}

      if (device?.deviceType === "BATCH_CONTROLLER") {
        parameters.deliveryDeviationThreshold = values.deliveryDeviationThreshold
        parameters.forcedFillingAlertEnabled = values.forcedFillingAlertEnabled
      } else if (device?.deviceType === "TELEMETRY") {
        // Build analog thresholds object
        const analogThresholds: Record<string, { min: number; max: number }> = {}
        values.analogThresholds?.forEach((t) => {
          if (t.key) analogThresholds[t.key] = { min: t.min, max: t.max }
        })
        parameters.analogThresholds = analogThresholds

        // Build digital expected object
        const digitalExpected: Record<string, number> = {}
        values.digitalExpected?.forEach((d) => {
          if (d.key) digitalExpected[d.key] = d.value
        })
        parameters.digitalExpected = digitalExpected
      }

      await updateDevice(deviceId, {
        config: {
          telemetryInterval: values.telemetryInterval,
          alertEmails: values.alertEmails
            ? values.alertEmails.split(",").map((e) => e.trim()).filter(Boolean)
            : [],
          alertSms: values.alertSms
            ? values.alertSms.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          webhookUrl: values.webhookUrl || undefined,
          parameters,
        },
      })

      toast.success("Configuration updated successfully")
      router.push(`/dashboard/devices/${deviceId}`)
    } catch {
      toast.error("Failed to update configuration")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 px-4 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!device) return null

  const isBatch = device.deviceType === "BATCH_CONTROLLER"
  const isTelemetry = device.deviceType === "TELEMETRY"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/devices/${deviceId}`)}
          >
            <ArrowLeftIcon />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">
              Configure {device.name || device.deviceId}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {device.deviceType.replace("_", " ")} · <code className="font-mono">{device.deviceId}</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/dashboard/devices/${deviceId}`)}
          >
            Discard
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 size-4" />
                Save Config
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Core Settings Card */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontalIcon className="size-4" />
              </div>
              <div>
                <CardTitle>Core Settings</CardTitle>
                <CardDescription>
                  Base telemetry and notification configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telemetryInterval" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Telemetry Interval (seconds)
                </Label>
                <Input
                  id="telemetryInterval"
                  type="number"
                  min={10}
                  {...register("telemetryInterval", { valueAsNumber: true })}
                />
                {errors.telemetryInterval && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.telemetryInterval.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Webhook URL
                </Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://..."
                  {...register("webhookUrl")}
                />
                {errors.webhookUrl && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.webhookUrl.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Channels Card */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BellIcon className="size-4" />
              </div>
              <div>
                <CardTitle>Alert Channels</CardTitle>
                <CardDescription>
                  Configure where alerts are sent (comma-separated)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alertEmails" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MailIcon className="inline size-3 mr-1" />
                  Alert Emails
                </Label>
                <Input
                  id="alertEmails"
                  placeholder="admin@example.com, ops@example.com"
                  {...register("alertEmails")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertSms" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alert SMS Numbers
                </Label>
                <Input
                  id="alertSms"
                  placeholder="+919876543210, +919876543211"
                  {...register("alertSms")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device-specific Parameters */}
      {isBatch && (
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                  <SlidersHorizontalIcon className="size-4" />
                </div>
                <div>
                  <CardTitle>Batch Controller Parameters</CardTitle>
                  <CardDescription>
                    Settings specific to batch controller devices
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDeviationThreshold" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Delivery Deviation Threshold
                  </Label>
                  <Input
                    id="deliveryDeviationThreshold"
                    type="number"
                    step="0.1"
                    {...register("deliveryDeviationThreshold", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Forced Filling Alert
                  </Label>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="forcedFillingAlertEnabled"
                      {...register("forcedFillingAlertEnabled")}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <Label htmlFor="forcedFillingAlertEnabled" className="text-sm cursor-pointer">
                      Enable forced filling alerts
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isTelemetry && (
        <>
          {/* Analog Thresholds */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                      <SlidersHorizontalIcon className="size-4" />
                    </div>
                    <div>
                      <CardTitle>Analog Thresholds</CardTitle>
                      <CardDescription>
                        Min/max bounds for analog sensor readings
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAnalog({ key: "", min: 0, max: 100 })}
                  >
                    <PlusIcon className="mr-1 size-3" />
                    Add Sensor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {analogFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No analog thresholds configured. Click &quot;Add Sensor&quot; to add one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analogFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-end gap-3 rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground">Sensor Name</Label>
                          <Input {...register(`analogThresholds.${index}.key`)} placeholder="e.g. temperature" />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs text-muted-foreground">Min</Label>
                          <Input type="number" {...register(`analogThresholds.${index}.min`, { valueAsNumber: true })} />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs text-muted-foreground">Max</Label>
                          <Input type="number" {...register(`analogThresholds.${index}.max`, { valueAsNumber: true })} />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeAnalog(index)}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Digital Expected States */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                      <SlidersHorizontalIcon className="size-4" />
                    </div>
                    <div>
                      <CardTitle>Digital Expected States</CardTitle>
                      <CardDescription>
                        Expected binary states for digital channels
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDigital({ key: "", value: 0 })}
                  >
                    <PlusIcon className="mr-1 size-3" />
                    Add Channel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {digitalFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No digital states configured. Click &quot;Add Channel&quot; to add one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {digitalFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-end gap-3 rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground">Channel Name</Label>
                          <Input {...register(`digitalExpected.${index}.key`)} placeholder="e.g. relay_1" />
                        </div>
                        <div className="w-32 space-y-1">
                          <Label className="text-xs text-muted-foreground">Expected (0 or 1)</Label>
                          <Input type="number" min={0} max={1} {...register(`digitalExpected.${index}.value`, { valueAsNumber: true })} />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeDigital(index)}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </form>
  )
}

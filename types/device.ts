/**
 * TypeScript types for device and transaction data — derived from API_DOCUMENTATION.md
 */

export type DeviceType = "BATCH_CONTROLLER" | "TELEMETRY" | "WATER_ATM";

// ── Device ────────────────────────────────────────────────────────────────

export interface DeviceConfig {
  id: string;
  deviceId: string;
  deviceType: DeviceType;
  telemetryInterval: number;
  parameters: Record<string, unknown>;
  alertEmails: string[];
  alertSms: string[];
  webhookUrl: string | null;
  pendingUpdate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceClient {
  id: string;
  name: string;
  location?: string;
}

export interface Device {
  id: string;
  deviceId: string; // serial number
  deviceType: DeviceType;
  name: string;
  clientId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  config?: DeviceConfig | {
    telemetryInterval: number;
    pendingUpdate: boolean;
    alertEmails: string[];
    alertSms: string[];
    webhookUrl: string | null;
    updatedAt: string;
  };
  client?: DeviceClient;
}

export interface DeviceListResponse {
  data: Device[];
  meta: PaginationMeta;
}

export interface DeviceDetailResponse extends Device {
  config: DeviceConfig;
  client?: DeviceClient;
  transactions: Array<{
    id: string;
    deviceType: DeviceType;
    receivedAt: string;
  }>;
}

// ── Pagination ────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Batch Transaction ─────────────────────────────────────────────────────

export interface BatchTransaction {
  id: string;
  deviceSerialNumber: string;
  dispenserId: string;
  location: string;
  transactionId: number;
  transactionDateTime: string;
  startTime: string;
  endTime: string;
  status: "COMPLETED" | "FAILED" | "CANCELLED" | "ABORTED";
  userId: string;
  accessLevel: string;
  rfId: number;
  truckNumber: string;
  presetMode: "FULL" | "WEIGHT" | "QUANTITY";
  presetQuantity: number;
  presetAmount: number;
  deliveredQuantity: number;
  deliveredAmount: number;
  unitRate: number;
  forcedFilling: boolean;
  forcedFillingCode: string;
  currency: string;
  checksum: string;
  receivedAt: string;
  device_registered: boolean;
}

export interface BatchTransactionListResponse {
  data: BatchTransaction[];
  meta: PaginationMeta;
}

// ── Telemetry Transaction ─────────────────────────────────────────────────

export interface TelemetryTransaction {
  id: string;
  deviceSerialNumber: string;
  telemetryId: string;
  telemetryLocation: string;
  userId: string;
  userAccessLevel: string;
  eventNo: number;
  eventFreq: number;
  eventConfigType: 0 | 1;
  previousTranDateTime: string;
  currentTranDateTime: string;
  digitalInputs: Record<string, 0 | 1>;
  digitalOutputs: Record<string, 0 | 1>;
  analogInputs: Record<string, number>;
  analogOutputs: Record<string, number>;
  alarmsGeneratedStatus: 0 | 1;
  alarmsCode: string;
  checksum: string;
  receivedAt: string;
  device_registered: boolean;
}

export interface TelemetryTransactionListResponse {
  data: TelemetryTransaction[];
  meta: PaginationMeta;
}

// ── Request types ─────────────────────────────────────────────────────────

export interface DeviceQueryParams {
  deviceType?: DeviceType;
  clientId?: string;
  isActive?: string;
  page?: number;
  limit?: number;
}

export interface BatchQueryParams {
  deviceSerialNumber?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface TelemetryQueryParams {
  deviceSerialNumber?: string;
  alarmStatus?: 0 | 1;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface UpdateDevicePayload {
  name?: string;
  clientId?: string;
  isActive?: boolean;
  config?: {
    telemetryInterval?: number;
    alertEmails?: string[];
    alertSms?: string[];
    webhookUrl?: string;
    pendingUpdate?: boolean;
    parameters?: Record<string, unknown>;
  };
}

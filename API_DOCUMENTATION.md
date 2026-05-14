# IoT Dashboard — API Documentation

**Base URL:** `https://<your-domain>/api`  
**Auth:** Cookie-based JWT (`auth_token`). All dashboard endpoints require a valid session from `POST /api/auth/login`.  
**Content-Type:** `application/json`  
**Protocol:** HTTPS only

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Device Registration](#2-device-registration)
3. [Batch Controller Transactions](#3-batch-controller-transactions)
4. [Telemetry Transactions](#4-telemetry-transactions)
5. [RBAC Role Matrix](#5-rbac-role-matrix)
6. [Error Response Format](#6-error-response-format)
7. [Device Type Reference](#7-device-type-reference)

---

## 1. Authentication

### POST `/api/auth/login`
No authentication required.

**Request Body:**
```json
{
  "email": "operator@example.com",
  "password": "yourpassword"
}
```

**Response `200`:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "operator@example.com",
    "role": "OPER"
  }
}
```
Sets `auth_token` cookie (HttpOnly, Secure).

---

### GET `/api/auth/me`
Returns the currently authenticated user.

**Response `200`:**
```json
{
  "userId": 1,
  "role": "MNGR"
}
```

---

### POST `/api/auth/logout`
🔒 Requires auth.

Clears the `auth_token` cookie.

---

## 2. Device Registration

> Device registration is the prerequisite for all transaction ingestion. A device must be registered before the system will accept data from it.

### POST `/api/devices`
🔒 Roles: `SUPER`, `MNGR`

Registers a new device. Supports all three device types via a discriminated union on `deviceType`. Optionally seeds the device's configuration in the same request.

**Request Body — WATER_ATM:**
```json
{
  "deviceId": "WATM-SN-001234",
  "deviceType": "WATER_ATM",
  "name": "Site A — Water ATM Unit 1",
  "clientId": "cld_abc123xyz",
  "config": {
    "telemetryInterval": 300,
    "alertEmails": ["ops@example.com"],
    "alertSms": ["+919876543210"],
    "webhookUrl": "https://webhook.example.com/watm",
    "parameters": {
      "deliveryDeviationThreshold": 2.5,
      "forcedFillingAlertEnabled": true
    }
  }
}
```

**Request Body — TELEMETRY:**
```json
{
  "deviceId": "DEV000001",
  "deviceType": "TELEMETRY",
  "name": "Pump Station RTU — North Zone",
  "clientId": "cld_abc123xyz",
  "config": {
    "telemetryInterval": 60,
    "alertEmails": ["scada@example.com"],
    "alertSms": [],
    "parameters": {
      "analogThresholds": {
        "Analog_Input_1": { "min": 0, "max": 1000 },
        "Analog_Input_2": { "max": 500 }
      },
      "digitalExpected": {
        "Digital_Input_1": 1,
        "Digital_Output_1": 1
      }
    }
  }
}
```

**Request Body — BATCH_CONTROLLER:**
```json
{
  "deviceId": "LNG100001",
  "deviceType": "BATCH_CONTROLLER",
  "name": "Fuel Dispenser — Bay 3",
  "clientId": "cld_abc123xyz",
  "config": {
    "telemetryInterval": 300,
    "alertEmails": ["fuel-ops@example.com"],
    "alertSms": ["+919000000001"],
    "parameters": {
      "deliveryDeviationThreshold": 1.0,
      "forcedFillingAlertEnabled": true
    }
  }
}
```

**Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceId` | `string` | ✅ | Unique device serial number. Must match what the physical device sends as its identifier. |
| `deviceType` | `"WATER_ATM" \| "TELEMETRY" \| "BATCH_CONTROLLER"` | ✅ | Internal device type. Determines which config parameters are valid. |
| `name` | `string` | ❌ | Human-readable label for the device. |
| `clientId` | `cuid string` | ❌ | Assigns this device to a client. Must be an existing client ID. |
| `config` | `object` | ❌ | Seeds the DeviceConfig record. If omitted, config can be added later via `PATCH`. |
| `config.telemetryInterval` | `int (≥10)` | ❌ | Polling/push interval in seconds. Default: `300`. |
| `config.alertEmails` | `string[]` | ❌ | Email addresses for threshold alerts. Default: `[]`. |
| `config.alertSms` | `string[]` | ❌ | SMS numbers for threshold alerts. Default: `[]`. |
| `config.webhookUrl` | `url string` | ❌ | Optional webhook for push alerts. |
| `config.parameters` | `object` | ❌ | Device-type-specific threshold/config parameters (see below). |

**Config Parameters — TELEMETRY:**

| Parameter | Type | Description |
|---|---|---|
| `analogThresholds` | `Record<string, { min?: number, max?: number }>` | Per-sensor min/max bounds. Keys must match the sensor names sent by the device (e.g. `"Analog_Input_1"`). |
| `digitalExpected` | `Record<string, 0 \| 1>` | Expected binary state per digital channel. Mismatches trigger a tamper/failure alert. |

**Config Parameters — WATER_ATM / BATCH_CONTROLLER:**

| Parameter | Type | Description |
|---|---|---|
| `deliveryDeviationThreshold` | `number` | Maximum allowable deviation between preset and delivered quantity. |
| `forcedFillingAlertEnabled` | `boolean` | Fire an alert whenever a forced filling is recorded. Default: `false`. |

**Response `201`:**
```json
{
  "success": true,
  "deviceId": "DEV000001",
  "id": "cld_internal_db_id",
  "deviceType": "TELEMETRY",
  "createdAt": "2026-05-13T08:00:00.000Z"
}
```

**Error `409`** — device serial already registered.  
**Error `404`** — `clientId` not found.

---

### GET `/api/devices`
🔒 Roles: `SUPER`, `MNGR`, `ENGR`, `OPER`

Returns a paginated list of all registered devices with their config summary.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `deviceType` | `"WATER_ATM" \| "TELEMETRY" \| "BATCH_CONTROLLER"` | Filter by device type. |
| `clientId` | `string` | Filter by assigned client. |
| `isActive` | `"true" \| "false"` | Filter by active status. |
| `page` | `int` | Page number. Default: `1`. |
| `limit` | `int (1–100)` | Records per page. Default: `20`. |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "cld_internal_db_id",
      "deviceId": "DEV000001",
      "deviceType": "TELEMETRY",
      "name": "Pump Station RTU — North Zone",
      "clientId": "cld_abc123xyz",
      "isActive": true,
      "createdAt": "2026-05-13T08:00:00.000Z",
      "updatedAt": "2026-05-13T08:00:00.000Z",
      "config": {
        "telemetryInterval": 60,
        "pendingUpdate": false,
        "alertEmails": ["scada@example.com"],
        "alertSms": [],
        "webhookUrl": null,
        "updatedAt": "2026-05-13T08:00:00.000Z"
      },
      "client": {
        "id": "cld_abc123xyz",
        "name": "Acme Corp",
        "location": "Mumbai"
      }
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET `/api/devices/:deviceId`
🔒 Roles: `SUPER`, `MNGR`, `ENGR`, `OPER`

Returns full device details including complete config and the 5 most recent transaction stubs (for a quick health snapshot).

**Path Parameter:** `deviceId` — the device's serial number (e.g. `DEV000001`).

**Response `200`:**
```json
{
  "id": "cld_internal_db_id",
  "deviceId": "DEV000001",
  "deviceType": "TELEMETRY",
  "name": "Pump Station RTU — North Zone",
  "isActive": true,
  "config": {
    "id": "cld_config_id",
    "deviceId": "DEV000001",
    "deviceType": "TELEMETRY",
    "telemetryInterval": 60,
    "parameters": { "analogThresholds": {}, "digitalExpected": {} },
    "alertEmails": ["scada@example.com"],
    "alertSms": [],
    "webhookUrl": null,
    "pendingUpdate": false,
    "createdAt": "2026-05-13T08:00:00.000Z",
    "updatedAt": "2026-05-13T08:00:00.000Z"
  },
  "client": {
    "id": "cld_abc123xyz",
    "name": "Acme Corp",
    "location": "Mumbai"
  },
  "transactions": [
    { "id": "tx_id_1", "deviceType": "TELEMETRY", "receivedAt": "2026-05-13T08:05:00.000Z" }
  ]
}
```

**Error `404`** — device not found.

---

### GET `/api/devices/:deviceId/config`
🔒 Roles: `SUPER`, `MNGR`, `ENGR`

Returns only the DeviceConfig row for a device.

**Response `200`:** Full `DeviceConfig` object (see above).  
**Error `404`** — device not found, or device exists but has no config yet.

---

### GET `/api/devices/client/:clientId`
🔒 Roles: `SUPER`, `MNGR`, `ENGR`, `OPER`

Returns all devices assigned to a specific client (paginated). Supports the same `deviceType` and `isActive` filters as `GET /api/devices`.

**Response `200`:**
```json
{
  "client": { "id": "cld_abc123xyz", "name": "Acme Corp" },
  "data": [ ...devices ],
  "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### PATCH `/api/devices/:deviceId`
🔒 Roles: `SUPER`, `MNGR`

Partial update of device metadata and/or config. Only fields provided are written. Config is upserted — works even if no config exists yet.

**Request Body (all fields optional):**
```json
{
  "name": "Updated Device Name",
  "clientId": "cld_new_client_id",
  "isActive": true,
  "config": {
    "telemetryInterval": 120,
    "alertEmails": ["newalert@example.com"],
    "alertSms": ["+919111111111"],
    "webhookUrl": "https://webhook.example.com/updated",
    "pendingUpdate": true,
    "parameters": {
      "analogThresholds": {
        "Analog_Input_1": { "min": 10, "max": 900 }
      }
    }
  }
}
```

**Response `200`:**
```json
{
  "success": true,
  "deviceId": "DEV000001",
  "updatedAt": "2026-05-13T09:00:00.000Z"
}
```

---

### PATCH `/api/devices/:deviceId/toggle`
🔒 Roles: `SUPER`, `MNGR`

Flips `isActive` between `true` and `false`. No request body required. An inactive device will be rejected by the transaction ingest endpoints.

**Response `200`:**
```json
{
  "success": true,
  "deviceId": "DEV000001",
  "isActive": false
}
```

---

### DELETE `/api/devices/:deviceId`
🔒 Roles: `SUPER` only

Hard deletes a device and its config. **Blocked if any transactions exist for this device** — deactivate with `PATCH /toggle` instead to preserve history.

**Response `200`:**
```json
{
  "success": true,
  "deviceId": "DEV000001"
}
```

**Error `409`** — device has existing transactions, cannot hard-delete.

---

## 3. Batch Controller Transactions

> Ingest endpoints are unauthenticated — physical devices cannot manage JWT cookies. Security is enforced by validating the device serial number against the registered device registry.

### POST `/api/transaction/batch/ingest/batch-control`
No authentication. Called by physical BATCH_CONTROLLER devices on every transaction completion.

**Request Body:**
```json
{
  "device": {
    "deviceType": "BATCH_CONTROL",
    "deviceSerialNumber": "LNG100001",
    "dispenserId": "DSP001",
    "location": "Jaipur_1"
  },
  "transaction": {
    "transactionId": 200001,
    "transactionDateTime": "2026-05-05T11:00:00+05:30",
    "startTime": "2026-05-05T10:55:00+05:30",
    "endTime": "2026-05-05T11:00:00+05:30",
    "status": "COMPLETED"
  },
  "user": {
    "userId": "USER_1",
    "accessLevel": "ENGR",
    "rfId": 779253917
  },
  "vehicle": {
    "truckNumber": "MH12-XX-0001"
  },
  "filling": {
    "presetMode": "FULL",
    "presetQuantity": 92,
    "presetAmount": 22499,
    "deliveredQuantity": 260,
    "deliveredAmount": 36016,
    "unitRate": 82,
    "forcedFilling": false,
    "forcedFillingCode": ""
  },
  "meta": {
    "currency": "INR",
    "checksum": "CHK0001"
  }
}
```

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `device.deviceType` | `"BATCH_CONTROL"` | ✅ | Literal — must be exactly this string. |
| `device.deviceSerialNumber` | `string` | ✅ | Must be registered in the system via `POST /api/devices`. |
| `device.dispenserId` | `string` | ✅ | Dispenser unit identifier. |
| `device.location` | `string` | ✅ | Station or location name. |
| `transaction.transactionId` | `integer` | ✅ | Device-generated transaction ID. Duplicate IDs from the same device are rejected `409`. |
| `transaction.transactionDateTime` | `ISO 8601 string` | ✅ | Full timestamp with timezone offset. |
| `transaction.startTime` | `ISO 8601 string` | ✅ | |
| `transaction.endTime` | `ISO 8601 string` | ✅ | |
| `transaction.status` | `"COMPLETED" \| "FAILED" \| "CANCELLED" \| "ABORTED"` | ✅ | `ABORTED` added per real device packet data. |
| `user.userId` | `string` | ✅ | |
| `user.accessLevel` | `"MNGR" \| "OPER" \| "ENGR" \| "SUPER"` | ✅ | |
| `user.rfId` | `integer` | ✅ | RFID tag number. |
| `vehicle.truckNumber` | `string` | ✅ | |
| `filling.presetMode` | `"FULL" \| "WEIGHT" \| "QUANTITY"` | ✅ | |
| `filling.presetQuantity` | `number` | ✅ | |
| `filling.presetAmount` | `number` | ✅ | |
| `filling.deliveredQuantity` | `number` | ✅ | |
| `filling.deliveredAmount` | `number` | ✅ | |
| `filling.unitRate` | `number` | ✅ | |
| `filling.forcedFilling` | `boolean` | ✅ | |
| `filling.forcedFillingCode` | `string` | ✅ | `""` when `forcedFilling` is `false`. Exactly 4 characters when `forcedFilling` is `true`. |
| `meta.currency` | `string` | ❌ | Default: `"INR"`. |
| `meta.checksum` | `string` | ✅ | Device-generated checksum. Minimum 1 character. |

**Response `200`:**
```json
{
  "success": true,
  "id": "tx_cld_id",
  "receivedAt": "2026-05-05T05:30:00.000Z",
  "device_registered": true
}
```

> ℹ️ Unregistered or inactive devices are **not rejected**. The transaction is always stored. Check `device_registered` in the response to know if the sending device exists in the registry.
**Error `409`** — duplicate `transactionId` from the same device.

---

### GET `/api/transaction/batch`
🔒 Roles: `SUPER`, `MNGR`, `ENGR`, `OPER`

Returns paginated batch transactions with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `deviceSerialNumber` | `string` | Filter to a specific device. |
| `status` | `"COMPLETED" \| "FAILED" \| "CANCELLED" \| "ABORTED"` | Filter by transaction outcome. |
| `from` | `ISO 8601` | Start of date range filter on `receivedAt`. |
| `to` | `ISO 8601` | End of date range filter on `receivedAt`. |
| `page` | `int` | Default: `1`. |
| `limit` | `int (1–100)` | Default: `20`. |

**Response `200`:**
```json
{
  "data": [ ...transactions ],
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

### GET `/api/transaction/batch/:id`
🔒 Roles: all authenticated.

Returns a single transaction by its internal DB ID.

---

### GET `/api/transaction/batch/device/:deviceId`
🔒 Roles: all authenticated.

Returns all transactions for a given device serial number (paginated). Supports `from` / `to` date filters.

---

## 4. Telemetry Transactions

### POST `/api/transaction/telemetry/ingest`
No authentication. Called by TELEMETRY RTU/PLC devices on every timed or event-triggered push.

**Request Body:**
```json
{
  "device": {
    "deviceType": "TELEMETRY",
    "Device_Ser_No": "DEV000001",
    "Telemetry_Id": "TLM00000001",
    "Telemetry_Location": "LOC001"
  },
  "user": {
    "User_ID": "USER_1",
    "User_Access_Lvl": "MNGR"
  },
  "event": {
    "Event_No": 1001,
    "Event_Freq": 3600,
    "Event_Config_Type": 1,
    "Previous_Tran_Date_Time": "2024-05-05T09:07:40+05:30",
    "Current_Tran_Date_Time": "2024-05-05T09:07:40+05:30"
  },
  "digitalInputs": {
    "Digital_Input_1": 1,
    "Digital_Input_2": 0
  },
  "digitalOutputs": {
    "Digital_Output_1": 1,
    "Digital_Output_2": 0
  },
  "analogInputs": {
    "Analog_Input_1": 215,
    "Analog_Input_2": 509
  },
  "analogOutputs": {
    "Analog_Output_1": 122,
    "Analog_Output_2": 719
  },
  "alarms": {
    "Alarms_Generated_Status": 1,
    "Alarms_Code": "PJ22"
  },
  "meta": {
    "checksum": "CHK0001"
  }
}
```

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `device.deviceType` | `"TELEMETRY"` | ✅ | Literal. |
| `device.Device_Ser_No` | `string` | ✅ | Must be registered in the system. |
| `device.Telemetry_Id` | `string` | ✅ | Telemetry unit identifier. |
| `device.Telemetry_Location` | `string` | ✅ | Physical location label. |
| `user.User_ID` | `string` | ✅ | |
| `user.User_Access_Lvl` | `"MNGR" \| "OPER" \| "ENGR" \| "SUPER"` | ✅ | |
| `event.Event_No` | `integer` | ✅ | Device-generated event number. Duplicate `Event_No` from same device is rejected `409`. |
| `event.Event_Freq` | `integer > 0` | ✅ | Transmission frequency in seconds as configured on the device. |
| `event.Event_Config_Type` | `0 \| 1` | ✅ | `0` = Time-based trigger. `1` = Event/Alarm-based trigger. |
| `event.Previous_Tran_Date_Time` | `ISO 8601` | ✅ | Timestamp of the previous transmission. |
| `event.Current_Tran_Date_Time` | `ISO 8601` | ✅ | Timestamp of this transmission. |
| `digitalInputs` | `Record<string, 0\|1>` | ❌ | Flexible map — any number of channels. Keys like `"Digital_Input_1"`. Values strictly `0` or `1`. |
| `digitalOutputs` | `Record<string, 0\|1>` | ❌ | Same format as `digitalInputs`. |
| `analogInputs` | `Record<string, number>` | ❌ | Flexible map — keys like `"Analog_Input_1"`. Values are continuous integers or floats. |
| `analogOutputs` | `Record<string, number>` | ❌ | Same format as `analogInputs`. |
| `alarms.Alarms_Generated_Status` | `0 \| 1` | ✅ | `0` = No alarm. `1` = Alarm active. |
| `alarms.Alarms_Code` | `string` | ✅ | `""` when status is `0`. Exactly 4 characters when status is `1`. |
| `meta.checksum` | `string` | ✅ | Minimum 1 character. |

**Response `200`:**
```json
{
  "success": true,
  "id": "tx_cld_id",
  "receivedAt": "2026-05-13T08:00:00.000Z",
  "device_registered": true
}
```

**Error `409`** — duplicate `Event_No` from same device.

---

### GET `/api/transaction/telemetry`
🔒 Roles: all authenticated.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `deviceSerialNumber` | `string` | Filter to a specific device. |
| `alarmStatus` | `0 \| 1` | Filter to only alarmed (`1`) or normal (`0`) events. |
| `from` | `ISO 8601` | |
| `to` | `ISO 8601` | |
| `page` | `int` | Default: `1`. |
| `limit` | `int (1–100)` | Default: `20`. |

---

### GET `/api/transaction/telemetry/:id`
🔒 Roles: all authenticated. Returns a single telemetry event by DB ID.

---

### GET `/api/transaction/telemetry/device/:deviceId`
🔒 Roles: all authenticated. Returns all telemetry events for a device (paginated).

---

## 5. RBAC Role Matrix

| Endpoint | SUPER | MNGR | ENGR | OPER |
|---|:---:|:---:|:---:|:---:|
| Register device | ✅ | ✅ | ❌ | ❌ |
| Update device / Toggle active | ✅ | ✅ | ❌ | ❌ |
| Delete device | ✅ | ❌ | ❌ | ❌ |
| View all devices / single device | ✅ | ✅ | ✅ | ✅ |
| View device config | ✅ | ✅ | ✅ | ❌ |
| View transactions (batch/telemetry) | ✅ | ✅ | ✅ | ✅ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ | ❌ |

---

## 6. Error Response Format

All errors follow a consistent envelope:

```json
{
  "error": "Human-readable message",
  "statusCode": 404
}
```

**Common HTTP status codes:**

| Code | Meaning |
|---|---|
| `400` | Validation error — request body failed Zod schema. |
| `401` | Unauthorized — missing or invalid `auth_token` cookie. |
| `403` | Forbidden — authenticated but insufficient role, or device is inactive. |
| `404` | Resource not found. |
| `409` | Conflict — duplicate registration or duplicate transaction. |
| `500` | Internal server error. |

---

## 7. Device Type Reference

### Internal vs Wire Device Types

The system distinguishes between the **device type sent by the hardware** (wire format) and the **internal enum** stored in the database:

| Wire `deviceType` (sent by device) | Internal DB `DeviceType` enum | Register as |
|---|---|---|
| `"BATCH_CONTROL"` | `BATCH_CONTROLLER` | `"BATCH_CONTROLLER"` |
| `"TELEMETRY"` | `TELEMETRY` | `"TELEMETRY"` |
| *(ATM / water dispenser)* | `WATER_ATM` | `"WATER_ATM"` |

> **Important:** When registering a Batch Controller device, use `deviceType: "BATCH_CONTROLLER"` in `POST /api/devices`. The device itself will send `"BATCH_CONTROL"` in its transaction payload — these are intentionally different and handled internally.

### Schema Fixes Applied (vs Original Spec)

The following corrections were made after cross-referencing the PDF interface spec against the real 10-packet sample data:

| File | Field | Original | Fixed | Reason |
|---|---|---|---|---|
| `transactions.schema.ts` | `transaction.status` | `COMPLETED \| FAILED \| CANCELLED` | + `ABORTED` | Packets 1, 4, 8, 10 all send `"ABORTED"` |
| `transactions.schema.ts` | `filling.forcedFillingCode` | `.string().length(4).nullable()` | `z.union([z.string().length(4), z.literal('')])` | Devices send `""` (empty string) when `forcedFilling: false`, not `null` |
| `transactions.schema.ts` | `meta.checksum` | `.string().length(6)` | `.string().min(1)` | Device packets send `"CHK0001"` (7 chars), not always 6. Exact algorithm TBC with ASKpro. |
| `transactions.schema.ts` | `TransactionQuerySchema.status` | `COMPLETED \| FAILED \| CANCELLED` | + `ABORTED` | Status filter must match the updated enum |
| `transactions.write.service.ts` / `telemetry.write.service.ts` | Device check on ingest | Throws `404`/`403` if unregistered or inactive | Soft check — stores `device_registered: boolean` in response and payload | Devices should never be blocked from ingesting; registration state tracked as a flag |

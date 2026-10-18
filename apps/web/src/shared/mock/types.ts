export type DeviceStatus = "online" | "warning" | "offline";

export type DeviceProfile = "web" | "api" | "worker" | "database" | "cache" | "edge";

export type ProcessState = "running" | "sleeping" | "zombie";

export interface DeviceGroup {
  id: string;
  name: string;
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  os: string;
  groupId: string;
  profile: DeviceProfile;
  cores: number;
  ramTotalGb: number;
  diskTotalGb: number;
  cpu: number;
  ram: number;
  disk: number;
  netIn: number;
  netOut: number;
  uptimeSec: number;
  status: DeviceStatus;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  ramMb: number;
  state: ProcessState;
  startedAgoSec: number;
  system: boolean;
}

export interface TelemetryPoint {
  cpu: number;
  ram: number;
  netIn: number;
  netOut: number;
}

export type EventSeverity = "info" | "success" | "warning" | "error";

export type EventKind = "status" | "process" | "system";

export interface SentinelEvent {
  id: number;
  at: number;
  severity: EventSeverity;
  kind: EventKind;
  deviceId?: string;
  deviceName?: string;
  message: string;
}

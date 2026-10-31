export type Metric = "temp" | "rh" | "co2" | "o2" | "lux" | "moisture";
export type Readings = Record<Metric, number>;
export type RecipeId = "milky" | "oyster" | "cordyceps" | "strawberry";
export type DeviceId = "lights" | "fogger" | "fan" | "heater" | "cooler" | "enrichment";
export type Devices = Record<DeviceId, boolean>;
export type DeviceModes = Record<DeviceId, "auto" | "manual">;
export interface Target { min: number; max: number; source: string }
export interface Recipe {
  id: RecipeId; name: string; shortName: string; stage: string; description: string;
  temp: Target; nightTemp?: Target; rh: Target; co2: Target; o2: Target; moisture: Target; lux: Target;
  photoperiod: { hours: number; source: string }; co2Mode: "vent" | "enrich";
}
export interface Decision { id: string; minute: number; reading: string; rule: string; action: string; severity: "info" | "warning" | "critical" }
export interface GrowAlert { id: string; kind: "co2" | "disease" | "climate"; hindi: string; english: string; minute?: number; preview?: boolean }
export interface HistoryPoint extends Readings { minute: number }
export interface SimulatorState {
  seed: number; recipeId: RecipeId; minute: number; readings: Readings; devices: Devices; modes: DeviceModes;
  decisions: Decision[]; history: HistoryPoint[]; trend: { minute: number; co2: number }[];
  heatUntil: number; powerUntil: number; serial: number; lastAlert: Record<string, number>; pendingAlert?: GrowAlert;
}
export type Injection = "co2" | "humidity" | "heat" | "power";
export interface ReadingSnapshot { mode: "demo" | "live"; readings: Readings; timestamp: string; deviceId?: string; receivedAt?: string; storage?: "memory" | "supabase" }

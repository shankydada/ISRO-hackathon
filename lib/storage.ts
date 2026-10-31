import type { Readings } from "./types";
export interface DeviceReading { deviceId: string; readings: Readings; receivedAt: string }
const globalStore = globalThis as unknown as { mycotechReading?: DeviceReading };
export function saveMemory(reading: DeviceReading) { globalStore.mycotechReading = reading; }
export function getMemory() { return globalStore.mycotechReading; }
export function isFresh(reading: DeviceReading | undefined, now = Date.now()) { return !!reading && now - Date.parse(reading.receivedAt) < 120_000 && Date.parse(reading.receivedAt) <= now + 5_000; }
function supabaseConfig() { const url = process.env.SUPABASE_URL?.replace(/\/$/, ""); const key = process.env.SUPABASE_ANON_KEY; return url && key ? { url, key } : null; }
export function supabaseEnabled() { return !!supabaseConfig(); }
async function supabaseFetch(path: string, init: RequestInit = {}) {
 const config = supabaseConfig(); if (!config) return null;
 return fetch(`${config.url}/rest/v1/${path}`, { ...init, headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", ...init.headers }, signal: AbortSignal.timeout(5000), cache: "no-store" });
}
export async function persistReading(reading: DeviceReading): Promise<"memory" | "supabase"> {
 saveMemory(reading);
 if (!supabaseEnabled()) return "memory";
 try { const r = reading.readings; const response = await supabaseFetch("readings", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ device_id: reading.deviceId, ...r, received_at: reading.receivedAt }) }); if (response?.ok) return "supabase"; } catch { /* The authenticated device reading remains available in instance memory. */ }
 return "memory";
}
export async function latestReading(): Promise<{ reading?: DeviceReading; storage: "memory" | "supabase" }> {
 const memory = getMemory();
 if (!supabaseEnabled()) return { reading: memory, storage: "memory" };
 try {
  const response = await supabaseFetch("readings?select=device_id,temp,rh,co2,o2,lux,moisture,received_at&order=received_at.desc&limit=1");
  if (response?.ok) { const rows = await response.json() as Array<{ device_id: string; temp: number; rh: number; co2: number; o2: number; lux: number; moisture: number; received_at: string }>; const row = rows[0]; if (row) { const reading = { deviceId: row.device_id, readings: { temp: row.temp, rh: row.rh, co2: row.co2, o2: row.o2, lux: row.lux, moisture: row.moisture }, receivedAt: row.received_at }; if (!memory || Date.parse(reading.receivedAt) > Date.parse(memory.receivedAt)) return { reading, storage: "supabase" }; } }
 } catch { /* Demo and memory fallback are intentional when persistence is unavailable. */ }
 return { reading: memory, storage: "memory" };
}
export async function persistScan(record: { sample: string | null; label: string; confidence: number; explanation: string; actions: string[]; urgency: string; mode: string }) {
 if (!supabaseEnabled()) return false;
 try { const response = await supabaseFetch("scans", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ ...record, created_at: new Date().toISOString() }) }); return !!response?.ok; } catch { return false; }
}

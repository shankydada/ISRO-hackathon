import { RECIPES, targetsFor, METRICS } from "./recipes";
import { applyRules, addDecision } from "./rules";
import type { DeviceId, Injection, RecipeId, Readings, SimulatorState } from "./types";
export const DEFAULT_SEED = 2027;
export const ALL_DEVICES: DeviceId[] = ["lights", "fogger", "fan", "heater", "cooler", "enrichment"];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export function noise(seed: number, minute: number, salt = 0) { let x = Math.imul((Math.floor(minute * 30) + salt * 997) ^ seed, 1597334677); x = Math.imul(x ^ (x >>> 16), 2246822507); x = Math.imul(x ^ (x >>> 13), 3266489909); return ((x ^ (x >>> 16)) >>> 0) / 4294967295 * 2 - 1; }
export function baseTemperature(recipeId: RecipeId, minute: number, seed = DEFAULT_SEED) { const r = RECIPES[recipeId]; const mid = (r.temp.min + r.temp.max) / 2; return mid + 3 * Math.sin(2 * Math.PI * ((minute / 60) % 24) / 24) + noise(seed, minute) * .16; }
function baseline(recipeId: RecipeId, minute: number, seed: number): Readings {
 const r = RECIPES[recipeId], t = targetsFor(r, minute), mid = (t.temp.min + t.temp.max) / 2;
 const temp = recipeId === "strawberry" ? mid + Math.sin(2 * Math.PI * ((minute / 60) % 24) / 24) + noise(seed, minute) * .16 : baseTemperature(recipeId, minute, seed);
 const rh = clamp((r.rh.min + r.rh.max) / 2 - (temp - mid) * 1.5 + noise(seed, minute, 2) * .4, 20, 100);
 const cycle = ((minute % 40) + 40) % 40;
 const co2 = r.co2Mode === "enrich" ? 800 + 25 * Math.sin(minute / 18) : 650 + cycle * 7.5;
 return { temp, rh, co2, o2: 20.9 - Math.max(0, co2 - 800) * .0004, lux: t.lux.min > 0 ? 1100 + noise(seed, minute, 3) * 30 : 0, moisture: 65 + 2 * Math.sin(minute / 70) + noise(seed, minute, 4) * .2 };
}
export function createSimulator(recipeId: RecipeId = "milky", seed = DEFAULT_SEED, startMinute = 840): SimulatorState {
 const readings = baseline(recipeId, startMinute, seed);
 const s: SimulatorState = { seed, recipeId, minute: startMinute, readings, devices: { lights: true, fogger: false, fan: false, heater: false, cooler: false, enrichment: false }, modes: { lights: "auto", fogger: "auto", fan: "auto", heater: "auto", cooler: "auto", enrichment: "auto" }, decisions: [], history: [], trend: [], heatUntil: 0, powerUntil: 0, serial: 0, lastAlert: {} };
 for (let m = startMinute - 1440; m <= startMinute; m += 5) s.history.push({ minute: m, ...baseline(recipeId, m, seed) });
 s.trend = [{ minute: startMinute - 1, co2: readings.co2 - 25 }, { minute: startMinute, co2: readings.co2 }];
 addDecision(s, "Seed 2027 · repeatable demo", "Simulator initialized; no physical devices connected", `${RECIPES[recipeId].shortName} recipe loaded`);
 applyRules(s);
 return s;
}
export function stepSimulator(previous: SimulatorState, deltaMinutes = 1): SimulatorState {
 if (deltaMinutes <= 0) return previous;
 const s: SimulatorState = { ...previous, minute: previous.minute + deltaMinutes, readings: { ...previous.readings }, devices: { ...previous.devices }, lastAlert: { ...previous.lastAlert }, pendingAlert: undefined };
 const wasPowered = previous.powerUntil > previous.minute;
 if (wasPowered && s.powerUntil <= s.minute) { s.powerUntil = 0; addDecision(s, "Power restored", "Outage ended; automatic control resumes", "AI recovery started"); }
 if (previous.heatUntil > 0 && previous.heatUntil <= s.minute) { s.heatUntil = 0; addDecision(s, "Heat event ended", "Ambient heat offset removed", "Controller continues pulling temperature to target"); }
 applyRules(s);
 const r = RECIPES[s.recipeId], t = targetsFor(r, s.minute);
 if (s.powerUntil > s.minute) {
  for (const d of ALL_DEVICES) s.devices[d] = false;
 }
 const powered = s.powerUntil <= s.minute;
 const ambient = (s.recipeId === "strawberry" ? (t.temp.min + t.temp.max) / 2 + Math.sin(2 * Math.PI * (s.minute / 60 % 24) / 24) : baseTemperature(s.recipeId, s.minute, s.seed)) + (s.heatUntil > s.minute ? 6 : 0);
 const temp = s.readings.temp + (ambient - s.readings.temp) * Math.min(1, .16 * deltaMinutes) + (s.devices.heater ? .65 * deltaMinutes : 0) - (s.devices.cooler ? .7 * deltaMinutes : 0);
 const rhMid = (r.rh.min + r.rh.max) / 2;
 const ambientRh = rhMid - (temp - (r.temp.min + r.temp.max) / 2) * 1.5 + noise(s.seed, s.minute, 2) * .4;
 const rh = s.readings.rh + (ambientRh - s.readings.rh) * Math.min(1, .08 * deltaMinutes) + (s.devices.fogger ? 1.8 * deltaMinutes : -.06 * deltaMinutes);
 const co2 = s.readings.co2 + (s.devices.fan ? -120 : 25) * deltaMinutes + (s.devices.enrichment ? 25 * deltaMinutes : 0);
 s.readings = { temp: clamp(temp, -10, 55), rh: clamp(rh, 20, 100), co2: clamp(co2, 400, 5000), o2: 20.9 - Math.max(0, co2 - 800) * .0004, lux: s.devices.lights ? 1100 + noise(s.seed, s.minute, 3) * 30 : 0, moisture: clamp(s.readings.moisture - .035 * deltaMinutes + (s.devices.fogger ? .22 * deltaMinutes : 0), 0, 100) };
 s.trend = [...previous.trend.filter(p => p.minute >= s.minute - 5), { minute: s.minute, co2: s.readings.co2 }];
 const last = previous.history[previous.history.length - 1];
 s.history = [...previous.history.filter(p => p.minute >= s.minute - 1440), ...(s.minute - last.minute >= 1 || s.recipeId !== previous.recipeId ? [{ minute: s.minute, ...s.readings }] : [])].slice(-1600);
 if (!powered) return s;
 applyRules(s);
 return s;
}
export function switchRecipe(previous: SimulatorState, recipeId: RecipeId): SimulatorState {
 if (previous.recipeId === recipeId) return previous;
 const s = { ...previous, recipeId, pendingAlert: undefined, devices: { ...previous.devices, enrichment: false } };
 addDecision(s, `Crop: ${RECIPES[recipeId].name}`, "Recipe switch; sourced target bands updated", `Recipe switched to ${RECIPES[recipeId].shortName}: targets updated`);
 applyRules(s);
 return s;
}
export function setDeviceMode(previous: SimulatorState, device: DeviceId, mode: "auto" | "manual", on?: boolean): SimulatorState {
 const s = { ...previous, modes: { ...previous.modes, [device]: mode }, devices: { ...previous.devices, [device]: mode === "manual" ? (on ?? previous.devices[device]) : previous.devices[device] }, pendingAlert: undefined };
 addDecision(s, "Operator input", mode === "manual" ? "Manual override; automatic rule bypassed" : "Automatic hysteresis control enabled", `${device === "lights" ? "LED lights" : device} → ${mode.toUpperCase()}`, mode === "manual" ? "warning" : "info");
 if (mode === "auto") applyRules(s);
 return s;
}
export function injectEvent(previous: SimulatorState, event: Injection): SimulatorState {
 const s: SimulatorState = { ...previous, readings: { ...previous.readings }, devices: { ...previous.devices }, pendingAlert: undefined };
 if (event === "co2") { s.readings.co2 += 600; addDecision(s, `CO₂ +600 → ${Math.round(s.readings.co2)} ppm`, "Judge-injected event", "CO₂ spike injected", "critical"); }
 if (event === "humidity") { s.readings.rh = clamp(s.readings.rh - 15, 0, 100); addDecision(s, `RH −15 → ${s.readings.rh.toFixed(1)}%`, "Judge-injected event", "Humidity drop injected", "warning"); }
 if (event === "heat") { s.heatUntil = s.minute + 20; s.readings.temp += 6; addDecision(s, `Temp +6 → ${s.readings.temp.toFixed(1)}°C`, "Judge-injected event for 20 simulated minutes", "Heat wave injected", "critical"); }
 if (event === "power") { s.powerUntil = s.minute + 5; for (const d of ALL_DEVICES) { s.devices[d] = false; s.modes[d] = "auto"; } addDecision(s, "All actuators OFF", "Judge-injected outage for 5 simulated minutes", "Power cut injected; AI recovery queued", "critical"); }
 s.readings.o2 = 20.9 - Math.max(0, s.readings.co2 - 800) * .0004;
 s.readings.lux = s.devices.lights ? 1100 : 0;
 s.history = [...s.history, { minute: s.minute + .001, ...s.readings }].slice(-1600);
 s.trend = [...s.trend, { minute: s.minute + .001, co2: s.readings.co2 }];
 applyRules(s);
 return s;
}
/** Stateless snapshot for GET /api/readings; the wall clock selects a repeatable point in the demo day. */
export function snapshotAt(timestamp: number, recipeId: RecipeId = "milky"): Readings {
 const minute = ((timestamp / 2000) % 1440 + 1440) % 1440;
 const s = createSimulator(recipeId, DEFAULT_SEED, minute);
 for (const metric of METRICS) s.readings[metric] = baseline(recipeId, minute, DEFAULT_SEED)[metric];
 return s.readings;
}

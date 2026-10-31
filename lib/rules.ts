import { RECIPES, targetsFor, formatReading } from "./recipes";
import type { DeviceId, SimulatorState } from "./types";
import { formatClock } from "./utils";
export const DEVICE_LABELS: Record<DeviceId, string> = { lights: "LED lights", fogger: "Fogger", fan: "Fresh-air fan", heater: "Heater", cooler: "Cooler", enrichment: "CO₂ enrichment" };
export function addDecision(s: SimulatorState, reading: string, rule: string, action: string, severity: "info" | "warning" | "critical" = "info") {
 s.serial += 1;
 s.decisions = [{ id: `decision-${s.seed}-${s.serial}`, minute: s.minute, reading, rule, action, severity }, ...s.decisions].slice(0, 80);
}
function switchDevice(s: SimulatorState, device: DeviceId, on: boolean, reading: string, rule: string, duration?: string) {
 if (s.devices[device] === on) return;
 s.devices = { ...s.devices, [device]: on };
 addDecision(s, reading, rule, `${DEVICE_LABELS[device]} ${on ? "ON" : "OFF"}${duration ? ` ${duration}` : ""}`, device === "fan" || device === "cooler" ? "warning" : "info");
}
export function co2Slope(s: SimulatorState) {
 const recent = s.trend.filter(p => p.minute >= s.minute - 5);
 if (recent.length < 2) return 0;
 const first = recent[0], last = recent[recent.length - 1];
 return last.minute > first.minute ? (last.co2 - first.co2) / (last.minute - first.minute) : 0;
}
function alertOnce(s: SimulatorState, key: string, kind: "co2" | "climate", hindi: string, english: string) {
 if (s.minute - (s.lastAlert[key] ?? -100) < 10) return;
 s.lastAlert = { ...s.lastAlert, [key]: s.minute };
 s.pendingAlert = { id: `alert-${s.seed}-${s.serial}-${Math.floor(s.minute)}`, kind, hindi, english, minute: s.minute };
}
/** Hysteresis: switch on at a breach, switch off only after returning toward the midpoint. */
export function applyRules(s: SimulatorState) {
 if (s.powerUntil > s.minute) return;
 const r = s.readings, t = targetsFor(RECIPES[s.recipeId], s.minute);
 const auto = (d: DeviceId) => s.modes[d] === "auto";
 const slope = co2Slope(s);
 const minutesToBreach = slope > 0 && r.co2 < t.co2.max ? (t.co2.max - r.co2) / slope : Infinity;
 if (auto("fan")) {
  if (r.co2 > t.co2.max) {
   switchDevice(s, "fan", true, formatReading("co2", r.co2), `CO₂ > ${t.co2.max.toLocaleString("en-IN")} ppm max`, "until the room is ventilated");
   const n = Math.round(r.co2).toLocaleString("en-IN");
   alertOnce(s, "co2", "co2", `चेतावनी: CO₂ का स्तर ${n} ppm है। ताज़ी हवा का पंखा चालू कर दिया गया है।`, `Alert: CO₂ is ${n} ppm. Fresh-air fan switched on.`);
  } else if (minutesToBreach <= 3 && !s.devices.fan) {
   switchDevice(s, "fan", true, `CO₂ trend +${slope.toFixed(0)} ppm/min`, "Predicted breach in ~3 min", "early");
  } else if (s.devices.fan && r.co2 <= (RECIPES[s.recipeId].co2Mode === "enrich" ? t.co2.min : t.co2.max - 200) && minutesToBreach > 3) {
   switchDevice(s, "fan", false, formatReading("co2", r.co2), "CO₂ recovered; hysteresis band reached");
  }
 }
 if (auto("enrichment") && RECIPES[s.recipeId].co2Mode === "enrich") {
  if (r.co2 < t.co2.min) switchDevice(s, "enrichment", true, formatReading("co2", r.co2), "Below the 800 ppm enrichment target");
  else if (r.co2 >= 800) switchDevice(s, "enrichment", false, formatReading("co2", r.co2), "Enrichment target reached");
 }
 if (auto("fogger")) {
  const midpoint = (t.rh.min + t.rh.max) / 2;
  if (r.rh < t.rh.min) {
   switchDevice(s, "fogger", true, formatReading("rh", r.rh), `RH < ${t.rh.min}% min`, `until RH ${midpoint}%`);
   if (r.rh < t.rh.min - 10) alertOnce(s, "rh", "climate", `चेतावनी: नमी ${r.rh.toFixed(1)}% है। फॉगर चालू कर दिया गया है।`, `Alert: humidity is ${r.rh.toFixed(1)}%. Fogger switched on.`);
  } else if (r.rh >= midpoint) switchDevice(s, "fogger", false, formatReading("rh", r.rh), "Humidity midpoint reached");
 }
 if (auto("cooler")) {
  if (r.temp > t.temp.max) {
   switchDevice(s, "cooler", true, formatReading("temp", r.temp), `Temp > ${t.temp.max}°C max`);
   if (r.temp > t.temp.max + 3) alertOnce(s, "temp", "climate", `चेतावनी: तापमान ${r.temp.toFixed(1)}°C है। कूलर चालू कर दिया गया है।`, `Alert: temperature is ${r.temp.toFixed(1)}°C. Cooler switched on.`);
  } else if (r.temp <= (t.temp.min + t.temp.max) / 2) switchDevice(s, "cooler", false, formatReading("temp", r.temp), "Temperature recovered to midpoint");
 }
 if (auto("heater")) {
  if (r.temp < t.temp.min) switchDevice(s, "heater", true, formatReading("temp", r.temp), `Temp < ${t.temp.min}°C min`);
  else if (r.temp >= (t.temp.min + t.temp.max) / 2) switchDevice(s, "heater", false, formatReading("temp", r.temp), "Temperature recovered to midpoint");
 }
 if (auto("lights")) switchDevice(s, "lights", t.lux.min > 0, `${formatClock(s.minute)} local grow-room time`, `${RECIPES[s.recipeId].photoperiod.hours}-hour crop photoperiod`);
}

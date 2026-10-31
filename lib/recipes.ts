import type { Metric, Recipe, RecipeId, Target } from "./types";
const DEMO = "Demo control default; validate against your substrate and grow-room trials.";
export const METRICS: Metric[] = ["temp", "rh", "co2", "o2", "lux", "moisture"];
export const METRIC_META: Record<Metric, { label: string; short: string; unit: string; scale: [number, number]; decimals: number; color: string }> = {
  temp: { label: "Temperature", short: "Temp", unit: "°C", scale: [0, 45], decimals: 1, color: "#00E5FF" },
  rh: { label: "Humidity", short: "RH", unit: "%", scale: [0, 100], decimals: 1, color: "#B8FF2E" },
  co2: { label: "CO₂", short: "CO₂", unit: "ppm", scale: [0, 2400], decimals: 0, color: "#B48CFF" },
  o2: { label: "Oxygen", short: "O₂", unit: "%", scale: [19, 21.5], decimals: 2, color: "#FFCB70" },
  lux: { label: "Light", short: "Light", unit: "lux", scale: [0, 1800], decimals: 0, color: "#F4F6FF" },
  moisture: { label: "Substrate moisture", short: "Substrate", unit: "%", scale: [0, 100], decimals: 1, color: "#70E1C0" }
};
export const RECIPES: Record<RecipeId, Recipe> = {
  milky: {
    id: "milky", name: "Milky mushroom", shortName: "Milky", stage: "Cropping", description: "Calocybe indica · warm, humid fruiting conditions",
    temp: { min: 30, max: 35, source: "ICAR-DMR milky mushroom profile" },
    rh: { min: 80, max: 90, source: "ICAR-DMR milky mushroom profile" },
    co2: { min: 400, max: 1000, source: "Demo default: 1,000 ppm maximum" },
    o2: { min: 20.4, max: 21, source: DEMO }, moisture: { min: 60, max: 70, source: DEMO }, lux: { min: 500, max: 1500, source: DEMO },
    photoperiod: { hours: 12, source: "Demo default: 12 hours of light per day" }, co2Mode: "vent"
  },
  oyster: {
    id: "oyster", name: "Oyster mushroom", shortName: "Oyster", stage: "Cropping", description: "Pleurotus · fresh-air exchange for healthy fruiting",
    temp: { min: 20, max: 30, source: "ICAR NEH oyster cultivation guide" },
    rh: { min: 70, max: 90, source: "ICAR NEH oyster cultivation guide" },
    co2: { min: 400, max: 1000, source: "Literature threshold cited in Lin et al., J. Fungi 2022" },
    o2: { min: 20.4, max: 21, source: DEMO }, moisture: { min: 60, max: 70, source: DEMO }, lux: { min: 500, max: 1500, source: DEMO },
    photoperiod: { hours: 12, source: "Demo default: 12 hours of light per day" }, co2Mode: "vent"
  },
  cordyceps: {
    id: "cordyceps", name: "Cordyceps militaris", shortName: "Cordyceps", stage: "Fruiting", description: "A cool, tightly controlled fruiting environment",
    temp: { min: 18, max: 22, source: "GUIDE Cordyceps SOP" },
    rh: { min: 95, max: 98, source: "GUIDE Cordyceps SOP" },
    co2: { min: 400, max: 1000, source: "Demo default: 1,000 ppm maximum" },
    o2: { min: 20.4, max: 21, source: DEMO }, moisture: { min: 60, max: 70, source: DEMO }, lux: { min: 500, max: 1500, source: DEMO },
    photoperiod: { hours: 12, source: "GUIDE Cordyceps SOP" }, co2Mode: "vent"
  },
  strawberry: {
    id: "strawberry", name: "Strawberry", shortName: "Strawberry", stage: "Day / night recipe", description: "Cool nights, brighter days, and CO₂ enrichment",
    temp: { min: 22, max: 25, source: "Just Agriculture 2023: day temperature" },
    nightTemp: { min: 7, max: 13, source: "Just Agriculture 2023: night temperature" },
    rh: { min: 60, max: 75, source: DEMO },
    co2: { min: 750, max: 850, source: "Demo control band around the supplied 800 ppm enrichment target" },
    o2: { min: 20.4, max: 21, source: DEMO }, moisture: { min: 60, max: 70, source: DEMO }, lux: { min: 500, max: 1500, source: DEMO },
    photoperiod: { hours: 14, source: "Demo default: 14 hours of light per day" }, co2Mode: "enrich"
  }
};
export const RECIPE_IDS = Object.keys(RECIPES) as RecipeId[];
export function isDay(minute: number, recipe: Recipe) { const hour = ((minute / 60) % 24 + 24) % 24; return hour >= 6 && hour < 6 + recipe.photoperiod.hours; }
export function targetsFor(recipe: Recipe, minute: number): Record<Metric, Target> {
 const day = isDay(minute, recipe);
 return { temp: !day && recipe.nightTemp ? recipe.nightTemp : recipe.temp, rh: recipe.rh, co2: recipe.co2, o2: recipe.o2, moisture: recipe.moisture,
   lux: day ? recipe.lux : { min: 0, max: 50, source: "Demo default: lights off outside the crop photoperiod" } };
}
export function targetStatus(value: number, target: Target): { label: "In range" | "Low" | "High" | "Near limit"; tone: "good" | "near" | "bad" } {
 if (value < target.min) return { label: "Low", tone: "bad" };
 if (value > target.max) return { label: "High", tone: "bad" };
 const margin = (target.max - target.min) * .12;
 if ((value > target.min && value < target.min + margin) || (value < target.max && value > target.max - margin)) return { label: "Near limit", tone: "near" };
 return { label: "In range", tone: "good" };
}
export function formatReading(metric: Metric, value: number) { const m = METRIC_META[metric]; return `${value.toLocaleString("en-IN", { minimumFractionDigits: m.decimals, maximumFractionDigits: m.decimals })}${m.unit === "%" || m.unit === "°C" ? "" : " "}${m.unit}`; }

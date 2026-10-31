import test from "node:test";
import assert from "node:assert/strict";
import { createSimulator, stepSimulator, injectEvent, switchRecipe, setDeviceMode, snapshotAt } from "../lib/simulator";
import { RECIPES, targetsFor, targetStatus } from "../lib/recipes";
import { co2Slope } from "../lib/rules";

test("simulator is deterministic for the same seed and start", () => {
 const a = createSimulator("milky", 2027, 840), b = createSimulator("milky", 2027, 840);
 assert.deepEqual(a.readings, b.readings);
 assert.deepEqual(stepSimulator(a, 1), stepSimulator(b, 1));
 assert.notDeepEqual(a.readings, createSimulator("milky", 7, 840).readings);
});
test("CO₂ rises with fan off and falls with fan on", () => {
 let s = createSimulator(); s = { ...s, devices: { ...s.devices, fan: false }, modes: { ...s.modes, fan: "manual" } };
 const before = s.readings.co2; const next = stepSimulator(s, 1); assert.ok(next.readings.co2 > before);
 s = { ...next, devices: { ...next.devices, fan: true } }; const after = stepSimulator(s, 1); assert.ok(after.readings.co2 < s.readings.co2);
});
test("CO₂ spike turns the fan on and recovers within a few simulated minutes", () => {
 let s = injectEvent(createSimulator(), "co2");
 assert.equal(s.devices.fan, true); assert.ok(s.pendingAlert);
 const breached = s.readings.co2;
 for (let i = 0; i < 8; i++) s = stepSimulator(s, 1);
 assert.ok(s.readings.co2 < breached); assert.ok(s.readings.co2 <= 1000);
});
test("predictive control starts the fan before the max is crossed", () => {
 let s = createSimulator(); s = { ...s, readings: { ...s.readings, co2: 940 }, trend: [{ minute: s.minute - 4, co2: 840 }, { minute: s.minute, co2: 940 }] };
 s = stepSimulator(s, 0.001);
 assert.equal(s.devices.fan, true);
 assert.ok(s.decisions.some(d => d.action.includes("fan ON early") || d.action.includes("Fresh-air fan ON early")));
 assert.ok(co2Slope(s) > 0);
});
test("humidity drop starts fogger and heat wave starts cooler", () => {
 const humid = injectEvent(createSimulator(), "humidity"); assert.equal(humid.devices.fogger, true);
 const heat = injectEvent(createSimulator(), "heat"); assert.equal(heat.devices.cooler, true); assert.equal(heat.heatUntil, heat.minute + 20);
});
test("power cut disables every device and recovers after five minutes", () => {
 let s = injectEvent(createSimulator(), "power");
 assert.ok(Object.values(s.devices).every(v => v === false));
 for (let i = 0; i < 4; i++) s = stepSimulator(s, 1);
 assert.ok(Object.values(s.devices).every(v => v === false));
 s = stepSimulator(s, 1);
 assert.equal(s.powerUntil, 0); assert.ok(s.decisions.some(d => d.action === "AI recovery started"));
});
test("manual override bypasses automatic rules until auto is restored", () => {
 let s = setDeviceMode(createSimulator(), "fan", "manual", true);
 s = { ...s, readings: { ...s.readings, co2: 500 } };
 s = stepSimulator(s, 1); assert.equal(s.devices.fan, true);
 s = setDeviceMode(s, "fan", "auto"); assert.equal(s.modes.fan, "auto");
});
test("recipe switching logs a decision and changes target bands", () => {
 const s = switchRecipe(createSimulator(), "strawberry");
 assert.equal(s.recipeId, "strawberry");
 assert.ok(s.decisions.some(d => d.action.includes("Recipe switched to Strawberry")));
 assert.deepEqual(targetsFor(RECIPES.strawberry, 14 * 60).temp, { min: 22, max: 25, source: "Just Agriculture 2023: day temperature" });
 assert.deepEqual(targetsFor(RECIPES.strawberry, 2 * 60).temp, { min: 7, max: 13, source: "Just Agriculture 2023: night temperature" });
});
test("target status is paired with a textual state", () => {
 const t = { min: 30, max: 35, source: "test" };
 assert.equal(targetStatus(32, t).label, "In range"); assert.equal(targetStatus(29, t).label, "Low"); assert.equal(targetStatus(36, t).label, "High");
});
test("API demo snapshot is deterministic for a timestamp", () => {
 assert.deepEqual(snapshotAt(1_800_000_000_000), snapshotAt(1_800_000_000_000));
});

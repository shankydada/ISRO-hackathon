import test from "node:test";
import assert from "node:assert/strict";
import { demoScan, scanResultSchema, SCAN_LABELS } from "../lib/scan";
import { readingSchema } from "../lib/validation";

test("sample scans are deterministic and match the brief", () => {
 assert.deepEqual(demoScan("inkcap-tub"), demoScan("inkcap-grey"));
 assert.equal(demoScan("inkcap-tub").label, "ink_cap"); assert.equal(demoScan("inkcap-tub").confidence, .91); assert.equal(demoScan("inkcap-tub").urgency, "high");
 assert.equal(demoScan("milky-single").label, "ready_to_harvest"); assert.equal(demoScan("milky-single").confidence, .88);
 assert.equal(demoScan("milky-pins").label, "pinning"); assert.equal(demoScan("milky-pins").confidence, .86);
 assert.equal(demoScan("oyster-wheat").label, "healthy_mycelium"); assert.equal(demoScan("oyster-wheat").confidence, .84);
});
test("unknown uploads are unclear without a key", () => {
 const r = demoScan(null); assert.equal(r.label, "unclear"); assert.match(r.explanation, /GEMINI_API_KEY/);
});
test("scan schema rejects invalid labels, confidence and extra actions", () => {
 assert.equal(scanResultSchema.safeParse(demoScan("inkcap-tub")).success, true);
 assert.equal(scanResultSchema.safeParse({ ...demoScan("inkcap-tub"), confidence: 1.1 }).success, false);
 assert.equal(scanResultSchema.safeParse({ ...demoScan("inkcap-tub"), label: "banana" }).success, false);
 assert.equal(scanResultSchema.safeParse({ ...demoScan("inkcap-tub"), actions: ["a", "b", "c", "d"] }).success, false);
 assert.equal(SCAN_LABELS.length, 7);
});
test("device reading schema validates all six metrics and device id", () => {
 const valid = { deviceId: "esp32-room-01", temp: 32.4, rh: 85, co2: 920, o2: 20.8, lux: 1100, moisture: 65 };
 assert.equal(readingSchema.safeParse(valid).success, true);
 assert.equal(readingSchema.safeParse({ ...valid, co2: "920" }).success, false);
 assert.equal(readingSchema.safeParse({ ...valid, rh: 101 }).success, false);
 assert.equal(readingSchema.safeParse({ ...valid, extra: 1 }).success, false);
 assert.equal(readingSchema.safeParse({ ...valid, deviceId: "../etc" }).success, false);
});

import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
test("three-minute judge flow works without keys", async ({ page }) => {
 await page.goto(base); await expect(page.getByRole("heading", { name: /Crops that don't care/ })).toBeVisible();
 await page.getByRole("link", { name: "Open live grow room" }).first().click();
 await expect(page.getByText("DEMO MODE · SIMULATED SENSORS")).toBeVisible();
 await page.getByRole("tab", { name: "Strawberry" }).click();
 await expect(page.getByText("Recipe switched to Strawberry", { exact: false }).first()).toBeVisible();
 await page.getByRole("button", { name: "CO₂ spike" }).click();
 await expect(page.getByText("CO₂ spike injected", { exact: false }).first()).toBeVisible();
 await page.getByRole("button", { name: /Alert preview/ }).first().click();
 await expect(page.getByText("ALERT PREVIEW", { exact: true })).toBeVisible(); await expect(page.getByText(/चेतावनी/).first()).toBeVisible();
 await page.keyboard.press("Escape");
 await page.goto(`${base}/scan`); await page.getByRole("button", { name: "Scan Ink-cap · tub trial photo" }).click(); await expect(page.getByRole("heading", { name: "Ink-cap contamination" })).toBeVisible();
 await page.getByRole("button", { name: "Send alert" }).click(); await expect(page.getByText(/इंक-कैप/).first()).toBeVisible();
});
test("reduced motion and mobile have no horizontal overflow", async ({ page }) => {
 await page.emulateMedia({ reducedMotion: "reduce" });
 for (const width of [390, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of ["/", "/dashboard", "/scan"]) {
   await page.goto(base + path); await expect(page.locator("h1")).toBeVisible();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
 }
});
test("API validates device key and payload", async ({ request }) => {
 const readings = await request.get(`${base}/api/readings`); expect(readings.ok()).toBe(true); expect(await readings.json()).toHaveProperty("mode", "demo");
 const bad = await request.post(`${base}/api/readings`, { data: { deviceId: "x", temp: 999 } }); expect([401, 503]).toContain(bad.status());
 const scan = await request.post(`${base}/api/scan`, { multipart: { sample: "inkcap-tub", image: { name: "inkcap-tub.jpg", mimeType: "image/jpeg", buffer: readFileSync("public/images/inkcap-tub.jpg") } } }); expect(scan.ok()).toBe(true);
 expect((await scan.json()).label).toBe("ink_cap");
});

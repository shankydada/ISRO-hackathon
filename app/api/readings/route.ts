import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { snapshotAt } from "@/lib/simulator";
import { RECIPES } from "@/lib/recipes";
import { readingSchema } from "@/lib/validation";
import type { RecipeId } from "@/lib/types";
import { isFresh, latestReading, persistReading } from "@/lib/storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function authorized(request: NextRequest) { const expected = process.env.DEVICE_KEY; const actual = request.headers.get("x-device-key"); if (!expected || !actual) return false; const a = Buffer.from(actual), b = Buffer.from(expected); return a.length === b.length && timingSafeEqual(a, b); }
export async function GET(request: NextRequest) {
 const now = Date.now(); const { reading, storage } = await latestReading();
 const recipeParam = request.nextUrl.searchParams.get("recipe") ?? "milky";
 const recipe: RecipeId = Object.hasOwn(RECIPES, recipeParam) ? recipeParam as RecipeId : "milky";
 const body = isFresh(reading, now) && reading ? { mode: "live", readings: reading.readings, deviceId: reading.deviceId, receivedAt: reading.receivedAt, timestamp: reading.receivedAt, storage } : { mode: "demo", readings: snapshotAt(now, recipe), timestamp: new Date(now).toISOString(), storage: "memory" };
 return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
 if (!process.env.DEVICE_KEY) return NextResponse.json({ error: "Device ingestion is disabled. Configure DEVICE_KEY on the server." }, { status: 503 });
 if (!authorized(request)) return NextResponse.json({ error: "Invalid or missing x-device-key." }, { status: 401 });
 if (Number(request.headers.get("content-length") ?? 0) > 4096) return NextResponse.json({ error: "Reading payload is too large." }, { status: 413 });
 let json: unknown; try { const text = await request.text(); if (text.length > 4096) return NextResponse.json({ error: "Reading payload is too large." }, { status: 413 }); json = JSON.parse(text); } catch { return NextResponse.json({ error: "Send a valid JSON object." }, { status: 400 }); }
 const parsed = readingSchema.safeParse(json); if (!parsed.success) return NextResponse.json({ error: "Invalid sensor reading.", issues: parsed.error.issues.map(i => ({ field: i.path.join("."), message: i.message })) }, { status: 400 });
 const { deviceId, ...readings } = parsed.data;
 const receivedAt = new Date().toISOString(); const storage = await persistReading({ deviceId, readings, receivedAt });
 return NextResponse.json({ ok: true, mode: "live", deviceId, receivedAt, storage }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

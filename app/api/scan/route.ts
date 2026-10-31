import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoScan, geminiScan, SAMPLE_SCANS } from "@/lib/scan";
import { persistScan } from "@/lib/storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const sampleSchema = z.string().refine(v => SAMPLE_SCANS.some(s => s.id === v));
export async function POST(request: NextRequest) {
 const length = Number(request.headers.get("content-length") ?? 0);
 if (length > 6_000_000) return NextResponse.json({ error: "Image is too large. Resize to 1280 px and try again." }, { status: 413 });
 let form: FormData; try { form = await request.formData(); } catch { return NextResponse.json({ error: "Send an image as multipart form data." }, { status: 400 }); }
 const image = form.get("image"); const rawSample = form.get("sample");
 if (!(image instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size === 0 || image.size > 4_500_000) return NextResponse.json({ error: "Use a JPEG, PNG or WebP image under 4.5 MB." }, { status: 400 });
 const sample = typeof rawSample === "string" && sampleSchema.safeParse(rawSample).success ? rawSample : null;
 const bytes = await image.arrayBuffer();
 const signature = new Uint8Array(bytes.slice(0, 12));
 const validSignature = image.type === "image/jpeg" ? signature[0] === 255 && signature[1] === 216 && signature[2] === 255 : image.type === "image/png" ? signature[0] === 137 && signature[1] === 80 && signature[2] === 78 && signature[3] === 71 : String.fromCharCode(...signature.slice(0, 4)) === "RIFF" && String.fromCharCode(...signature.slice(8, 12)) === "WEBP";
 if (!validSignature) return NextResponse.json({ error: "The file content does not match a supported image." }, { status: 400 });
 const live = await geminiScan(bytes, image.type);
 const result = live ?? demoScan(sample); const mode = live ? "live" : "demo";
 const persisted = await persistScan({ sample, ...result, mode });
 return NextResponse.json({ ...result, mode, persisted }, { headers: { "Cache-Control": "no-store", "X-Result-Mode": mode } });
}

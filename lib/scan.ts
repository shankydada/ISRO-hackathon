import { z } from "zod";
export const SCAN_LABELS = ["healthy_mycelium", "pinning", "ready_to_harvest", "ink_cap", "green_mould", "other_contamination", "unclear"] as const;
export const scanResultSchema = z.object({ label: z.enum(SCAN_LABELS), confidence: z.number().finite().min(0).max(1), explanation: z.string().min(1).max(2000), actions: z.array(z.string().min(1).max(500)).max(3), urgency: z.enum(["low", "medium", "high"]) }).strict();
export type ScanResult = z.infer<typeof scanResultSchema>;
export const scanResponseSchema = scanResultSchema.extend({ mode: z.enum(["demo", "live"]), persisted: z.boolean().optional() }).passthrough();
export type ScanLabel = ScanResult["label"];
export const LABEL_NAMES: Record<ScanLabel, string> = { healthy_mycelium: "Healthy mycelium", pinning: "Pinning has started", ready_to_harvest: "Ready to harvest", ink_cap: "Ink-cap contamination", green_mould: "Green mould", other_contamination: "Other contamination", unclear: "Needs a clearer look" };
export const SAMPLE_SCANS = [
 { id: "inkcap-tub", file: "inkcap-tub.jpg", name: "Ink-cap · tub", alt: "Grey ink-cap weed fungi among straw in a trial tub" },
 { id: "inkcap-grey", file: "inkcap-grey.jpg", name: "Ink-cap · grey cluster", alt: "A cluster of grey ink-cap fungi in trial substrate" },
 { id: "milky-single", file: "milky-single.jpg", name: "Milky · single", alt: "A mature white milky mushroom with a broad cap" },
 { id: "milky-cluster", file: "milky-cluster.jpg", name: "Milky · cluster", alt: "A cluster of milky mushrooms at different growth stages" },
 { id: "milky-pins", file: "milky-pins.jpg", name: "Milky · pinheads", alt: "Small milky mushroom pinheads emerging from substrate" },
 { id: "oyster-wheat", file: "oyster-wheat.jpg", name: "Oyster · wheat", alt: "An oyster mushroom wheat-straw trial bag with visible mycelium" }
] as const;
const results: Record<ScanLabel, Omit<ScanResult, "label">> = {
 ink_cap: { confidence: .91, explanation: "Ink-cap fruiting bodies indicate excess moisture, leftover ammonia or improper pasteurisation rather than a healthy mushroom crop.", actions: ["Isolate the affected bag away from healthy crops.", "Reduce excess moisture and improve fresh-air exchange.", "Review pasteurisation and substrate cooling before the next batch."], urgency: "high" },
 ready_to_harvest: { confidence: .88, explanation: "The milky mushroom shows a developed cap and stem consistent with a crop ready for careful harvest.", actions: ["Harvest gently with clean hands and tools.", "Check the remaining pins before adjusting humidity.", "Keep the harvested mushrooms clean and cool."], urgency: "low" },
 pinning: { confidence: .86, explanation: "Small pinheads are emerging from the substrate, consistent with the early fruiting stage.", actions: ["Maintain the recipe's humidity and fresh-air targets.", "Avoid spraying directly onto young pinheads.", "Photograph the same rack daily to track development."], urgency: "low" },
 healthy_mycelium: { confidence: .84, explanation: "Visible mycelium in this trial sample is consistent with healthy colonisation, with no obvious competitor growth in the photographed area.", actions: ["Keep the bag in its current clean growing area.", "Continue monitoring moisture and fresh-air readings.", "Inspect again when pinheads begin to form."], urgency: "low" },
 green_mould: { confidence: .9, explanation: "Green sporulating patches can indicate Trichoderma, favoured by high humidity, poor hygiene and improper pasteurisation.", actions: ["Isolate the bag without shaking or spreading spores.", "Clean the surrounding rack and review hygiene.", "Review pasteurisation and avoid excessive moisture."], urgency: "high" },
 other_contamination: { confidence: .8, explanation: "The crop shows growth that may not belong to the intended mushroom culture.", actions: ["Separate the affected bag for inspection.", "Keep tools and hands clean between racks.", "Document the change with a clear close-up photograph."], urgency: "medium" },
 unclear: { confidence: 0, explanation: "This upload is not a labelled trial sample. Add a GEMINI_API_KEY for live analysis.", actions: ["Try a labelled photo from the trial gallery below.", "Use even lighting and keep the crop in focus.", "Include the substrate and fruiting bodies in the frame."], urgency: "medium" }
};
export function demoScan(sample?: string | null): ScanResult {
 let label: ScanLabel = "unclear";
 if (sample === "inkcap-tub" || sample === "inkcap-grey") label = "ink_cap";
 if (sample === "milky-single" || sample === "milky-cluster") label = "ready_to_harvest";
 if (sample === "milky-pins") label = "pinning";
 if (sample === "oyster-wheat") label = "healthy_mycelium";
 return { label, ...results[label] };
}
export const VISION_INSTRUCTION = "You are a mushroom cultivation expert for oyster (Pleurotus) and milky (Calocybe indica) mushrooms grown in polythene bags in India. Classify the image into exactly one label: healthy_mycelium, pinning, ready_to_harvest, ink_cap, green_mould, other_contamination, unclear. Ink caps (Coprinus) indicate excess moisture, leftover ammonia or improper pasteurisation. Green mould (Trichoderma) is favoured by high humidity, poor hygiene and improper pasteurisation. Return only JSON with label, confidence, a one-sentence explanation, up to 3 practical actions without chemical sprays, and urgency. If the image is not a mushroom crop, return unclear.";
export async function geminiScan(bytes: ArrayBuffer, mime: string): Promise<ScanResult | null> {
 const key = process.env.GEMINI_API_KEY; const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
 if (!key || !/^[a-zA-Z0-9._-]+$/.test(model)) return null;
 try {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
   method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, signal: AbortSignal.timeout(25000),
   body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: VISION_INSTRUCTION }, { inline_data: { mime_type: mime, data: Buffer.from(bytes).toString("base64") } }] }], generationConfig: { temperature: 0, responseMimeType: "application/json", maxOutputTokens: 1024, responseSchema: { type: "OBJECT", properties: { label: { type: "STRING", enum: [...SCAN_LABELS] }, confidence: { type: "NUMBER" }, explanation: { type: "STRING" }, actions: { type: "ARRAY", items: { type: "STRING" }, maxItems: 3 }, urgency: { type: "STRING", enum: ["low", "medium", "high"] } }, required: ["label", "confidence", "explanation", "actions", "urgency"] } } })
  });
  if (!response.ok) return null;
  const payload = await response.json(); const text = payload?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (typeof text !== "string") return null;
  const parsed = scanResultSchema.safeParse(JSON.parse(text)); return parsed.success ? parsed.data : null;
 } catch { return null; }
}

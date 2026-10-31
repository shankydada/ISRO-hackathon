"use client";
import { useState } from "react";
import { Check, Copy, Radio, Terminal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
const body = `{
  "deviceId": "esp32-room-01",
  "temp": 32.4,
  "rh": 85,
  "co2": 920,
  "o2": 20.8,
  "lux": 1100,
  "moisture": 65
}`;
export function DeviceDocs({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
 const [copied, setCopied] = useState(false);
 const curl = `curl -X POST '${typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app"}/api/readings' \\\n  -H 'Content-Type: application/json' \\\n  -H 'x-device-key: YOUR_DEVICE_KEY' \\\n  --data '${body.replace(/\n\s*/g, "")}'`;
 const copy = async () => { try { await navigator.clipboard.writeText(curl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { toast.error("Clipboard unavailable", { description: "Select and copy the example command below." }); } };
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto text-ink"><DialogTitle>Connect a real sensor</DialogTitle><DialogDescription>POST an ESP32 reading to the same app. No cron job, external broker, or API key is needed for the demo.</DialogDescription><div className="mt-5 rounded-xl bg-paper-2 p-4 text-xs leading-relaxed"><p className="flex items-center gap-2 font-bold"><Radio className="size-4 text-electric" /> One reading. A live room.</p><p className="mt-2 text-muted">Set <code>DEVICE_KEY</code> in your server environment and send the same secret in <code>x-device-key</code>. The dashboard checks every 10 seconds and shows LIVE · ESP32 for two minutes after a valid POST.</p></div><Tabs defaultValue="json" className="mt-5"><TabsList><TabsTrigger value="json">JSON body</TabsTrigger><TabsTrigger value="curl">curl example</TabsTrigger></TabsList><TabsContent value="json"><pre className="prose-code rounded-xl bg-ink p-5 text-lime">{body}</pre></TabsContent><TabsContent value="curl"><div className="relative"><pre className="prose-code rounded-xl bg-ink p-5 pr-12 text-lime">{curl}</pre><Button variant="ghost" size="icon" className="absolute right-2 top-2 text-white hover:bg-white/10" onClick={copy} aria-label="Copy curl command">{copied ? <Check /> : <Copy />}</Button></div></TabsContent></Tabs><div className="mt-4 space-y-2 text-xs leading-relaxed text-muted"><p><strong className="text-ink">Units:</strong> temp °C · rh % · co2 ppm · o2 % · lux · moisture %. All six readings and deviceId are required; numeric strings and extra fields are rejected.</p><p><strong className="text-ink">Storage:</strong> without Supabase, readings stay in instance memory. Serverless instances do not share memory; configure Supabase for reliable cross-instance live status.</p><p><strong className="text-ink">Safety:</strong> ingestion is read-only telemetry. Keep relay control and safety interlocks on your edge controller. Never put DEVICE_KEY in browser code.</p></div><a href="https://github.com/shankydada/ISRO-hackathon#connect-an-esp32" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-electric"><Terminal className="size-4" /> Full integration notes in the README</a></DialogContent></Dialog>;
}

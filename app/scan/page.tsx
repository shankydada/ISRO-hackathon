import type { Metadata } from "next";
import { Scan } from "@/components/scan/scan";
export const metadata: Metadata = { title: "Crop disease scan", description: "Try crop disease screening on real MycoTech trial photos. Works without an API key in clearly labelled demo mode." };
export default function ScanPage() { return <Scan />; }

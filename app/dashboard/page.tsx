import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";
export const metadata: Metadata = { title: "Live grow room", description: "A deterministic AI + IoT grow-room simulator with crop recipes, live gauges, predictive control, and device integration." };
export default function DashboardPage() { return <Dashboard />; }

import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
export const metadata: Metadata = {
  title: { default: "MycoTech — Crops that don't care about the weather", template: "%s · MycoTech" },
  description: "An AI + IoT grow ecosystem from Bihar. Explore real field trials, a live simulated grow room, and a demo-ready crop disease scanner. Built for RISE@IITs 2027.",
  applicationName: "MycoTech",
  keywords: ["MycoTech", "mushroom cultivation", "agritech", "Bihar", "IIT Patna", "RISE IITs 2027"],
  openGraph: { title: "MycoTech — Grow beyond the climate", description: "Real bags. Real problems. Real harvest. An AI + IoT grow ecosystem from Bihar.", type: "website" }
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0A0F2E" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${space.variable} ${manrope.variable} ${mono.variable} font-sans antialiased`}><LazyMotion features={domAnimation} strict><MotionConfig reducedMotion="user"><a href="#main-content" className="skip-link">Skip to content</a>{children}<Toaster /></MotionConfig></LazyMotion></body></html>;
}

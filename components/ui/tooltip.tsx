"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
export function TooltipProvider({ children }: { children: React.ReactNode }) { return <TooltipPrimitive.Provider delayDuration={150}>{children}</TooltipPrimitive.Provider>; }
export function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
 return <TooltipPrimitive.Root><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={8} className={cn("z-[70] max-w-72 rounded-lg bg-ink px-3 py-2 text-xs leading-relaxed text-white shadow-lg")}>{content}<TooltipPrimitive.Arrow className="fill-ink" /></TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root>;
}

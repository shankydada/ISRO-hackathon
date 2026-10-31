"use client";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { m } from "motion/react";
import { cn } from "@/lib/utils";
export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "left" | "right" }) {
 return <SheetPrimitive.Portal><SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-sm" /><SheetPrimitive.Content className={cn("fixed inset-y-0 z-50 w-full max-w-md border-l bg-card shadow-2xl", side === "right" ? "right-0" : "left-0", className)} {...props}><m.div initial={{ x: side === "right" ? 60 : -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .35 }} className="h-full">{children}<SheetPrimitive.Close className="absolute right-4 top-5 z-10 rounded-lg p-2 hover:bg-white/10" aria-label="Close panel"><X className="size-5" /></SheetPrimitive.Close></m.div></SheetPrimitive.Content></SheetPrimitive.Portal>;
}
export function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) { return <SheetPrimitive.Title className={cn("font-heading text-xl font-bold", className)} {...props} />; }
export function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) { return <SheetPrimitive.Description className={cn("text-sm text-muted", className)} {...props} />; }

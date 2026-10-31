"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { m } from "motion/react";
import { cn } from "@/lib/utils";
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
 return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/65 backdrop-blur-sm" /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-1 shadow-2xl", className)} {...props}><m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative p-6">{children}<DialogPrimitive.Close className="absolute right-3 top-3 rounded-md p-2 hover:bg-secondary" aria-label="Close dialog"><X className="size-4" /></DialogPrimitive.Close></m.div></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className={cn("pr-8 font-heading text-2xl font-bold", className)} {...props} />; }
export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className={cn("mt-3 text-sm leading-relaxed text-muted", className)} {...props} />; }

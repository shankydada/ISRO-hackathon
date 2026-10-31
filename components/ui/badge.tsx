import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium leading-normal tracking-wide [&_svg]:size-3", { variants: { variant: {
 default: "border-electric/15 bg-electric/8 text-electric", lime: "border-transparent bg-lime text-ink", outline: "border-border text-foreground", dark: "border-transparent bg-ink text-lime", amber: "border-amber-500/30 bg-amber-400/15 text-amber-700", danger: "border-alert/20 bg-alert/10 text-alert", success: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700"
}}, defaultVariants: { variant: "default" } });
export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) { return <span className={cn(badgeVariants({ variant }), className)} {...props} />; }

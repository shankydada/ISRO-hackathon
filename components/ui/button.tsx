import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-3 focus-visible:outline-offset-4", {
 variants: { variant: {
  default: "bg-electric text-white hover:bg-electric/90",
  lime: "bg-lime text-ink hover:bg-[#c8ff5c]",
  outline: "border border-current bg-transparent hover:bg-electric/5",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-secondary text-foreground",
  destructive: "bg-alert text-white hover:bg-alert/90"
 }, size: { default: "min-h-12 px-5 py-3", sm: "min-h-9 rounded-lg px-3 py-2 text-xs", lg: "min-h-14 px-7 py-4 text-base", icon: "size-11" } },
 defaultVariants: { variant: "default", size: "default" }
});
function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
 const Comp = asChild ? Slot : "button";
 return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
export { Button, buttonVariants };

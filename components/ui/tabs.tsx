"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) { return <TabsPrimitive.Root className={cn("flex flex-col gap-4", className)} {...props} />; }
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn("inline-flex items-center gap-1 rounded-xl bg-secondary p-1", className)} {...props} />; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-45 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />; }
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content className={cn("focus-visible:outline-3", className)} {...props} />; }

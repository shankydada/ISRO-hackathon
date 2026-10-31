"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, ScanLine, LayoutDashboard } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
const anchors = [{ href: "/#how-it-works", label: "How it works" }, { href: "/#proof", label: "Proof" }, { href: "/#crops", label: "Crops" }, { href: "/#market", label: "Market" }];
export function SiteHeader() {
 const pathname = usePathname(); const dark = pathname === "/dashboard"; const [open, setOpen] = useState(false);
 return <header className={cn("sticky top-0 z-40 border-b backdrop-blur-xl", dark ? "border-white/10 bg-[#070B24]/90 text-white" : "border-electric/8 bg-paper/90 text-ink")}>
  <div className="section-wrap flex h-[76px] items-center justify-between gap-6">
   <Brand dark={dark} />
   <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">{anchors.map(a => <Link key={a.href} href={a.href} className={cn("text-[13px] font-semibold transition-colors hover:text-electric", dark && "hover:text-lime")}>{a.label}</Link>)}</nav>
   <div className="hidden items-center gap-3 sm:flex"><Button asChild variant="ghost" size="icon" aria-label="Scan a crop" className={cn(pathname === "/scan" && "bg-electric/10 text-electric")}><Link href="/scan"><ScanLine /></Link></Button><Button asChild variant={dark ? "outline" : "lime"} size="sm" className={cn(!dark && "border border-ink/10", dark && "text-lime")}><Link href={dark ? "/scan" : "/dashboard"}>{dark ? <><ScanLine /> Scan a crop</> : <>Open live grow room <ArrowUpRight /></>}</Link></Button></div>
   <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" className={cn("lg:hidden", dark && "text-white")} aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent className={cn(dark && "bg-ink text-white")}><div className="p-7 pt-8"><Brand /><SheetTitle className="mt-10">Explore MycoTech</SheetTitle><SheetDescription className="mt-2">From a real trial in Bihar to a smarter grow room.</SheetDescription><nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-2">{anchors.map(a => <Link onClick={() => setOpen(false)} key={a.href} href={a.href} className="rounded-lg px-3 py-3 text-lg font-semibold hover:bg-electric/5">{a.label}</Link>)}<Link onClick={() => setOpen(false)} href="/dashboard" className="mt-3 flex items-center gap-3 rounded-xl bg-lime p-4 font-bold text-ink"><LayoutDashboard className="size-5" /> Live grow room</Link><Link onClick={() => setOpen(false)} href="/scan" className="flex items-center gap-3 rounded-xl bg-electric/8 p-4 font-bold"><ScanLine className="size-5" /> Disease scan</Link></nav></div></SheetContent></Sheet>
  </div>
 </header>;
}

import Link from "next/link";
import { cn } from "@/lib/utils";
export function MushroomMark({ className }: { className?: string }) {
 return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("size-9", className)}><path d="M5 22C5 3 35 3 35 22H5ZM15 22V34Q20 38 25 34V22M12 15H13M20 11H21M28 15H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function Brand({ className, dark = false }: { className?: string; dark?: boolean }) {
 return <Link href="/" aria-label="MycoTech home" className={cn("inline-flex shrink-0 items-center gap-2.5 font-heading text-2xl font-bold tracking-[-.06em]", className)}><span className={cn("grid size-10 place-items-center rounded-xl", dark ? "bg-lime text-ink" : "bg-electric text-white")}><MushroomMark className="size-7" /></span>MycoTech<span className={cn("mt-1 size-1.5 rounded-full", dark ? "bg-lime" : "bg-electric")} /></Link>;
}

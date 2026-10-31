"use client";
import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
export function PhotoBadge({ className }: { className?: string }) {
 return <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1.5 font-mono text-[8px] font-bold leading-none tracking-[.035em] text-ink shadow-sm", className)}><span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />REAL PHOTO · OUR TRIAL</span>;
}
export function TrialPhoto({ file, alt, className, imageClassName, priority = false, sizes = "(max-width: 768px) 100vw, 50vw", badge = true, position = "center" }: { file: string; alt: string; className?: string; imageClassName?: string; priority?: boolean; sizes?: string; badge?: boolean; position?: string }) {
 const [failed, setFailed] = useState(false);
 return <div className={cn("relative isolate overflow-hidden bg-paper-2", className)}>
  {failed ? <div role="img" aria-label={`Photo unavailable: ${file}. ${alt}`} className="signature absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white"><ImageOff className="size-8 opacity-70" /><span className="font-mono text-xs">{file}</span><span className="text-xs text-white/80">Trial photo unavailable</span></div> : <Image src={`/images/${file}`} alt={alt} fill decoding={priority ? "sync" : "async"} preload={priority} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} sizes={sizes} className={cn("object-cover", imageClassName)} style={{ objectPosition: position }} onError={() => setFailed(true)} />}
  {badge && !failed && <PhotoBadge className="absolute bottom-3 left-3 z-10" />}
 </div>;
}

import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
export default function NotFound() {
 return <main id="main-content" className="grid min-h-screen place-items-center bg-paper p-8"><div className="max-w-lg text-center"><Sprout className="mx-auto mb-6 size-12 text-electric" /><p className="eyebrow">ROOM NOT FOUND</p><h1 className="mt-6 font-heading text-6xl font-bold">Nothing growing here.</h1><p className="mt-5 text-muted">Let&apos;s get you back to the grow room.</p><Link className="button-primary mt-8" href="/"><ArrowLeft className="size-4" /> Back to MycoTech</Link></div></main>;
}

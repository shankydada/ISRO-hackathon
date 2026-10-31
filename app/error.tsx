"use client";
import { RefreshCw } from "lucide-react";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
 return <main id="main-content" className="grid min-h-screen place-items-center bg-paper p-8"><div className="max-w-lg text-center"><p className="eyebrow">LET&apos;S TRY THAT AGAIN</p><h1 className="mt-6 font-heading text-5xl font-bold">A small interruption.</h1><p className="my-6 text-muted">This page couldn&apos;t load. Your device settings have not been changed.</p><button className="button-primary" onClick={reset}><RefreshCw className="size-4" /> Try again</button></div></main>;
}

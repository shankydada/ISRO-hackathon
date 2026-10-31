"use client";
import { Toaster as Sonner } from "sonner";
export function Toaster() {
 return <Sonner position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-manrope)", borderRadius: "14px" } }} />;
}
export { toast } from "sonner";

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
// The sandbox cannot reach Google Fonts. Use the committed, licensed font mirror
// there; on Vercel, next/font/google fetches and self-hosts the fonts normally.
if (!env.VERCEL && !env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES) env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES = path.join(root, "scripts/google-font-faces.cjs");
const next = path.join(root, "node_modules/next/dist/bin/next");
const args = process.argv.slice(2);
if (!env.VERCEL && ["dev", "build"].includes(args[0])) args.push("--webpack");
const child = spawn(process.execPath, [next, ...args], { cwd: root, env, stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code ?? 0));

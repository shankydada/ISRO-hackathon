import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "./tests", testMatch: "**/*.spec.ts", reporter: "list", use: { ...{ baseURL: process.env.BASE_URL || "http://127.0.0.1:3000" }, launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined } });

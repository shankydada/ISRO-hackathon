import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals, ...nextTs,
  { files: ["scripts/**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".cache/**"]),
  { rules: { "@next/next/no-img-element": "error" } }
]);
// Next's documented offline Google Fonts fixture is CommonJS.

# MycoTech

**Crops that don't care about the weather.** An AI + IoT grow ecosystem for RISE@IITs 2027: sensors and cameras read each crop; AI gives it the light, moisture, oxygen and CO₂ it needs, and warns of disease before it spreads. Starts with oyster and milky mushrooms in Bihar; expands to Cordyceps, medicinal herbs, strawberries, indoor saffron and drying.

Founder: **Shashank Roy, IIT Patna · AI/ML engineer**. Raised so far: **₹0 · fully self-funded**. The landing uses only the founder's real trial photographs from `mycotech-images.zip`.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. **No API keys are required.** The dashboard is a deterministic simulation, and the scanner uses fixed demo results for the six supplied photographs. Unknown uploads without a Gemini key return `unclear` with a clear explanation.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`dev`, `build` and `start` use `scripts/next-with-fonts.mjs`. Off Vercel it supplies local mirrors of the three Google Fonts (`public/fonts`) so the build works without network access to Google; on Vercel it uses the normal Google Fonts fetch. It also uses Webpack locally because the font mock is incompatible with Turbopack in this environment. On Vercel the default build command is simply `next build`.

## Deploy to Vercel (zero config)

1. Push this repository to GitHub.
2. Import it in Vercel. Framework preset: **Next.js**. Build command: `next build` (or leave the package `build` script). Output: leave default. No `vercel.json` is required.
3. Deploy with **no environment variables** for the full judge demo.
4. Optional: add the variables below, then redeploy. Never prefix secret keys with `NEXT_PUBLIC_`.

## Environment variables

| Variable | Required? | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Enables real Gemini vision on `/api/scan`. Without it, sample images return fixed demo results and unknown uploads return `unclear`. |
| `GEMINI_MODEL` | Optional | Defaults to `gemini-2.5-flash`. |
| `DEVICE_KEY` | For real sensor POSTs | Shared secret checked against the `x-device-key` header. Without it, POST returns 503 and the dashboard stays in demo mode. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Anon key. When both Supabase variables exist, readings and scans are also persisted. Without them, an in-memory store is used. |

Copy `.env.example` to `.env.local` for local secrets. Supabase SQL is in `supabase/schema.sql`. Its RLS policies are intentionally open for this keyless demo; tighten them before a production rollout. Serverless memory is not durable across instances; Supabase is recommended for real deployments.

## Routes

- `/` — scroll-driven story: hero, problem, 300vh SENSE → PREDICT → ACT loop, real trial proof, crop roadmap, market, “if selected”, sources.
- `/dashboard` — dark control room: recipe switcher, six gauges, 24-hour history, five actuators, AI decision log, fault injection, live ESP32 mode, alert preview.
- `/scan` — upload/drag/drop/camera, resize to 1280px, six real-photo samples, Gemini or demo diagnosis, confidence ring, urgency/actions, alert preview, last-10 local history.

API: `GET /api/readings`, `POST /api/readings`, `POST /api/scan`.

## Connect a real sensor (ESP32)

Set `DEVICE_KEY` on the server and on the device. POST every 10–60 seconds:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/readings \
  -H 'content-type: application/json' \
  -H 'x-device-key: YOUR_DEVICE_KEY' \
  -d '{"deviceId":"esp32-room-01","temp":32.4,"rh":85,"co2":920,"o2":20.8,"lux":1100,"moisture":65}'
```

Fields: `deviceId` (1–64 chars, letters/numbers/dot/underscore/hyphen), `temp` °C (−20…60), `rh` % (0…100), `co2` ppm (0…50000), `o2` % (0…100), `lux` (0…200000), `moisture` % (0…100). Invalid JSON/ranges return 400; missing/wrong key returns 401; unconfigured key returns 503. Body limit 4 KB.

When a valid POST arrives, the dashboard shows **LIVE · ESP32** and pauses the simulator. If no reading arrives for 2 minutes it returns to **DEMO MODE · SIMULATED SENSORS**. Telemetry never sends relay commands; actuator controls are a safe local demonstration. The in-page “Connect a real sensor” sheet repeats the JSON and curl.

## 3-minute judge demo

1. **0:00–0:35 — Landing.** Scroll the hero → problem → pinned SENSE/PREDICT/ACT loop → real bags and harvest → crop roadmap → market → “We'll grow it live, in front of the judges.” Point out the lime “REAL PHOTO · OUR TRIAL” badges and the ₹0 self-funded chip.
2. **0:35–1:00 — Dashboard.** Open “Open live grow room”. Show Grow Room 01 · Bihar, the amber demo badge, six gauges and the 24-hour chart. Switch **Milky → Strawberry**: targets animate (day 22–25°C, night 7–13°C), and the AI log records the recipe change. Hover a target for its source.
3. **1:00–1:50 — Fault and recovery.** Click **CO₂ spike**. At 30× the fan turns on, the log explains the reading/rule/action, and CO₂ recovers below the recipe limit. Use **Heat wave** or **Dry air** to show cooler/fogger response. **Power cut** shows all devices off and recovery after five simulated minutes. Manual override shows a visible warning; Auto returns control to AI.
4. **1:50–2:30 — Scan.** Open `/scan`, tap the ink-cap sample, run the scan. Show the label, confidence ring, plain-language explanation, isolate/reduce-moisture actions and high urgency. The result is clearly marked demo.
5. **2:30–3:00 — Alert.** Click **Send alert** (or the dashboard bell). The phone mockup shows Hindi plus English with a typing animation. Close by returning to the landing's “if selected” promise and sources.

## What is real vs simulated

- **Real:** founder's trial photos, dates, substrate arms, ink-cap diagnosis/correction story, harvest, crop recipes and cited market figures.
- **Simulated:** dashboard sensor curves, actuator states, AI decision log and fault injections. They are deterministic from a seed and simulated time, never random on the server render.
- **Optional real:** Gemini vision, ESP32 readings, Supabase persistence.

## Tests

`npm test` runs Node tests for deterministic simulation, gas exchange, CO₂ prediction/recovery, humidity/heat response, power-cut recovery, manual override, recipe switching, scan schemas/demo results and device validation. `npm run test:e2e` runs Playwright against a running app (set `BASE_URL`, default http://127.0.0.1:3000) for the judge flow, keyboard/focus, reduced motion, mobile overflow, alert preview, scan history and API validation. Production axe/Lighthouse checks were run locally; the landing targets 90+ performance/accessibility.

## Sources

All figures are shown with sources on the landing (footer disclosure): ICAR Mushroom Research (Bihar analysis); Indian Masterminds 2025; FreshPlaza Dec 2025; Biswas, The Bioscan 2015; NIOS Mushroom Production L9; ICAR-DMR milky profile/rates; ICAR NEH oyster guide; GUIDE Cordyceps SOP; Mohanty et al., Frontiers in Plant Science 2016; Inc42 & StarAgri Agritech Report 2025; IMARC; Economic Times 2025; PIB 2026; IBEF; Patna Press 2025. Strawberry day/night recipe: Just Agriculture 2023. Generic plant-AI accuracy caveat (99.35% lab vs 31.4% outside images): Mohanty et al. 2016.

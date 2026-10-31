import { z } from "zod";
const finite = (min: number, max: number) => z.number().finite().min(min).max(max);
export const readingSchema = z.object({
  deviceId: z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  temp: finite(-40, 80), rh: finite(0, 100), co2: finite(0, 50000),
  o2: finite(0, 100), lux: finite(0, 200000), moisture: finite(0, 100)
}).strict();

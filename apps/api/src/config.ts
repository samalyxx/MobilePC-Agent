import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(8787),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  PAIRING_TTL_SECONDS: z.coerce.number().int().positive().default(300)
});

export const config = EnvSchema.parse(process.env);

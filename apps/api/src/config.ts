import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(8787),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  PAIRING_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  DEV_PAIRING_ENABLED: z.coerce.boolean().default(process.env.NODE_ENV !== "production"),
  DEV_DEVICE_ID: z.string().default("pc_local_demo"),
  DEV_AGENT_TOKEN: z.string().default("local-demo-agent-token"),
  DEV_MOBILE_TOKEN: z.string().default("local-demo-mobile-token")
});

export const config = EnvSchema.parse(process.env);

import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  API_WS_URL: z.string().url().default("ws://localhost:8787/ws"),
  DEVICE_ID: z.string().min(1),
  AGENT_TOKEN: z.string().min(1),
  PEEKWIN_BIN: z.string().default("peekwin"),
  FFMPEG_BIN: z.string().default("ffmpeg"),
  ARTIFACT_DIR: z.string().default("./recordings"),
  AUTO_APPROVE_LOW_RISK: z.coerce.boolean().default(true)
});

export const config = EnvSchema.parse(process.env);

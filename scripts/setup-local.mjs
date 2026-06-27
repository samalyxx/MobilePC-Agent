import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const files = new Map([
  ["apps/api/.env", `API_HOST=0.0.0.0
API_PORT=8787
CORS_ORIGIN=http://localhost:3000
PAIRING_TTL_SECONDS=300
DEV_PAIRING_ENABLED=true
DEV_DEVICE_ID=pc_local_demo
DEV_AGENT_TOKEN=local-demo-agent-token
DEV_MOBILE_TOKEN=local-demo-mobile-token
`],
  ["apps/windows-agent/.env", `API_WS_URL=ws://localhost:8787/ws
DEVICE_ID=pc_local_demo
AGENT_TOKEN=local-demo-agent-token
PEEKWIN_BIN=peekwin
FFMPEG_BIN=ffmpeg
ARTIFACT_DIR=./recordings
AUTO_APPROVE_LOW_RISK=true
`],
  ["apps/web/.env", `NUXT_PUBLIC_API_BASE=http://localhost:8787
NUXT_PUBLIC_WS_URL=ws://localhost:8787/ws
NUXT_PUBLIC_DEV_DEVICE_ID=pc_local_demo
NUXT_PUBLIC_DEV_AGENT_TOKEN=local-demo-agent-token
NUXT_PUBLIC_DEV_MOBILE_TOKEN=local-demo-mobile-token
`]
]);

for (const [relativePath, contents] of files) {
  const target = resolve(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
  console.log(`wrote ${relativePath}`);
}

console.log("");
console.log("Local demo env is ready.");
console.log("Run these in three terminals:");
console.log("  npm run dev:api");
console.log("  npm run dev:agent");
console.log("  npm run dev:web");
console.log("");
console.log("Then open http://localhost:3000 and click:");
console.log("  Use local demo pairing -> Connect mobile socket -> Run on PC");

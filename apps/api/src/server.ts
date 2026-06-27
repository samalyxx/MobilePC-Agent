import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { config } from "./config.js";
import { PairingStore } from "./pairing.js";
import { RelayHub } from "./relay.js";
import { TaskStore } from "./task-store.js";

export function buildServer() {
  const app = Fastify({ logger: true });
  const pairings = new PairingStore();
  const tasks = new TaskStore();
  const relay = new RelayHub(pairings, tasks);

  app.register(cors, { origin: config.CORS_ORIGIN });
  app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  app.register(websocket);

  app.get("/health", async () => ({ ok: true }));
  app.get("/tasks", async () => ({ tasks: tasks.list() }));
  app.post("/pairings", async () => pairings.create(config.PAIRING_TTL_SECONDS));

  app.register(async (wsRoutes) => {
    wsRoutes.get("/ws", { websocket: true }, (socket) => {
      relay.attach(socket);
    });
  });

  return app;
}

const isEntrypoint = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (isEntrypoint) {
  const app = buildServer();
  await app.listen({ host: config.API_HOST, port: config.API_PORT });
}

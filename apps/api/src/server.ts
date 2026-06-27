import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
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

  app.get("/ws", { websocket: true }, (connection) => {
    relay.attach(connection);
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildServer();
  await app.listen({ host: config.API_HOST, port: config.API_PORT });
}

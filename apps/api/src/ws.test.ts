import { describe, expect, it } from "vitest";
import WebSocket from "ws";
import { buildServer } from "./server.js";

describe("websocket relay route", () => {
  it("accepts websocket upgrades on /ws", async () => {
    const app = buildServer();
    await app.listen({ host: "127.0.0.1", port: 0 });

    try {
      const address = app.server.address();
      if (!address || typeof address === "string") throw new Error("Expected TCP address");

      await new Promise<void>((resolve, reject) => {
        const socket = new WebSocket(`ws://127.0.0.1:${address.port}/ws`);
        socket.once("open", () => {
          socket.close();
          resolve();
        });
        socket.once("error", reject);
      });

      expect(true).toBe(true);
    } finally {
      await app.close();
    }
  });
});

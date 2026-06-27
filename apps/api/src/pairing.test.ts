import { describe, expect, it } from "vitest";
import { PairingStore } from "./pairing.js";

describe("PairingStore", () => {
  it("verifies scoped agent and mobile tokens", () => {
    const store = new PairingStore();
    const secret = store.create(60);

    expect(store.verify(secret.deviceId, secret.agentToken, "agent")).toBe(true);
    expect(store.verify(secret.deviceId, secret.agentToken, "mobile")).toBe(false);
    expect(store.verify(secret.deviceId, secret.mobileToken, "mobile")).toBe(true);
  });

  it("can verify the local development pairing", () => {
    const store = new PairingStore({
      enabled: true,
      deviceId: "pc_local_demo",
      agentToken: "agent-token",
      mobileToken: "mobile-token"
    });

    expect(store.verify("pc_local_demo", "agent-token", "agent")).toBe(true);
    expect(store.verify("pc_local_demo", "mobile-token", "mobile")).toBe(true);
    expect(store.verify("pc_local_demo", "agent-token", "mobile")).toBe(false);
    expect(store.verify("pc_other", "agent-token", "agent")).toBe(false);
  });
});

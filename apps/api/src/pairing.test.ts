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
});

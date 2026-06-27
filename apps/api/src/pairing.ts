import { createToken, hashToken, newId } from "@mobilepc/shared";

export interface PairingRecord {
  code: string;
  deviceId: string;
  agentTokenHash: string;
  mobileTokenHash: string;
  expiresAt: number;
  claimedAt?: number;
}

export interface PairingSecret {
  code: string;
  deviceId: string;
  agentToken: string;
  mobileToken: string;
  expiresAt: string;
}

export class PairingStore {
  private readonly pairings = new Map<string, PairingRecord>();

  create(ttlSeconds: number): PairingSecret {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const deviceId = newId("pc");
    const agentToken = createToken();
    const mobileToken = createToken();
    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.pairings.set(code, {
      code,
      deviceId,
      agentTokenHash: hashToken(agentToken),
      mobileTokenHash: hashToken(mobileToken),
      expiresAt
    });

    return {
      code,
      deviceId,
      agentToken,
      mobileToken,
      expiresAt: new Date(expiresAt).toISOString()
    };
  }

  verify(deviceId: string, token: string, role: "agent" | "mobile"): boolean {
    this.prune();
    for (const record of this.pairings.values()) {
      if (record.deviceId !== deviceId) continue;
      const expected = role === "agent" ? record.agentTokenHash : record.mobileTokenHash;
      if (expected === hashToken(token)) {
        record.claimedAt = Date.now();
        return true;
      }
    }
    return false;
  }

  private prune(): void {
    const now = Date.now();
    for (const [code, record] of this.pairings) {
      if (record.expiresAt < now) this.pairings.delete(code);
    }
  }
}

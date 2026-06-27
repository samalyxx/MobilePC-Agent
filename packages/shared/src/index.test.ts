import { describe, expect, it } from "vitest";
import { ClientMessageSchema, isSensitiveAction } from "./index.js";

describe("shared contracts", () => {
  it("validates task creation messages", () => {
    const parsed = ClientMessageSchema.parse({
      type: "task:create",
      prompt: "open notepad",
      requestedBy: "mobile"
    });

    expect(parsed.type).toBe("task:create");
    if (parsed.type === "task:create") {
      expect(parsed.prompt).toBe("open notepad");
    }
  });

  it("flags destructive hotkeys", () => {
    expect(isSensitiveAction({ type: "hotkey", keys: ["Control", "Delete"] })).toBe("destructive");
  });
});

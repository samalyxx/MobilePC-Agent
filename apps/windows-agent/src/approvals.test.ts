import { describe, expect, it } from "vitest";
import { approvalRiskFor } from "./approvals.js";

describe("approval policy", () => {
  it("requires approval for explicit sensitive steps", () => {
    expect(approvalRiskFor({ type: "click", x: 1, y: 2 }, true)).toBe("sensitive");
  });

  it("allows normal typing", () => {
    expect(approvalRiskFor({ type: "type", text: "hello from mobile agent" }, false)).toBeNull();
  });
});

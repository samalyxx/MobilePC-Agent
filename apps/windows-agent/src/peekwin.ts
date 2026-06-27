import type { AgentAction } from "@mobilepc/shared";
import { runCommand } from "./process-runner.js";

export class PeekWinClient {
  constructor(private readonly bin: string) {}

  async execute(action: AgentAction): Promise<string> {
    switch (action.type) {
      case "inspect":
        return this.run(["see", "ui", "--json"]);
      case "click":
        return action.ref
          ? this.run(["click", "--ref", action.ref])
          : this.run(["click", "--x", String(action.x), "--y", String(action.y)]);
      case "type":
        return this.run(["type", "--text", action.text]);
      case "hotkey":
        return this.run(["key", "--keys", action.keys.join("+")]);
      case "wait":
        await new Promise((resolve) => setTimeout(resolve, action.ms));
        return `waited ${action.ms}ms`;
      case "launchApp":
        return this.run(["app", "launch", "--name", action.app, ...action.args]);
      case "screenshot":
        return this.run(["image", "--screen", "0", "--output", action.label ?? "capture.png"]);
      case "startRecording":
      case "stopRecording":
      case "approvalRequest":
        return `${action.type} handled outside PeekWin`;
      default: {
        const neverAction: never = action;
        throw new Error(`Unsupported action: ${JSON.stringify(neverAction)}`);
      }
    }
  }

  private async run(args: string[]): Promise<string> {
    const result = await runCommand(this.bin, args, 60000);
    if (result.exitCode !== 0) {
      throw new Error(`PeekWin failed (${result.exitCode}): ${result.stderr || result.stdout}`);
    }
    return result.stdout.trim() || result.stderr.trim() || "ok";
  }
}

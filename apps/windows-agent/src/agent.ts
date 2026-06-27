import type { ServerMessage, AgentAction, ClientMessage } from "@mobilepc/shared";
import { ServerMessageSchema } from "@mobilepc/shared";
import WebSocket from "ws";
import { approvalRiskFor } from "./approvals.js";
import { PeekWinClient } from "./peekwin.js";
import type { ScreenRecorder } from "./recorder.js";
import type { PlannerProvider } from "@mobilepc/shared";

interface AgentOptions {
  wsUrl: string;
  deviceId: string;
  token: string;
  autoApproveLowRisk: boolean;
  peekwin: PeekWinClient;
  recorder: ScreenRecorder;
  planner: PlannerProvider;
}

export class WindowsAgent {
  private socket?: WebSocket;
  private approvalResolvers = new Map<string, (approved: boolean) => void>();

  constructor(private readonly options: AgentOptions) {}

  connect(): void {
    this.socket = new WebSocket(this.options.wsUrl);
    this.socket.on("open", () => {
      this.send({ type: "hello", role: "agent", deviceId: this.options.deviceId, token: this.options.token });
    });
    this.socket.on("message", (raw) => {
      const message = ServerMessageSchema.parse(JSON.parse(raw.toString()));
      void this.handle(message);
    });
    this.socket.on("close", () => {
      setTimeout(() => this.connect(), 3000);
    });
  }

  private async handle(message: ServerMessage): Promise<void> {
    if (message.type === "task:assigned") {
      await this.runTask(message.taskId, message.prompt);
      return;
    }

    if (message.type === "approval:decision") {
      const resolver = this.approvalResolvers.get(message.taskId);
      if (resolver) resolver(message.approved);
      this.approvalResolvers.delete(message.taskId);
    }
  }

  private async runTask(taskId: string, prompt: string): Promise<void> {
    const artifacts: string[] = [];
    try {
      this.log(taskId, "info", `Planning task: ${prompt}`);
      const plan = await this.options.planner.createPlan({
        taskId,
        prompt,
        platform: "windows",
        capabilities: ["peekwin", "ffmpeg", "approval_requests"]
      });
      this.log(taskId, "info", plan.summary, { planner: this.options.planner.name, steps: plan.steps.length });

      for (const step of plan.steps) {
        this.log(taskId, "info", step.title, { action: step.action.type });
        const approved = await this.ensureApproved(taskId, step.action, step.requiresApproval);
        if (!approved) throw new Error(`Approval denied for step: ${step.title}`);
        const artifact = await this.execute(step.action);
        if (artifact) artifacts.push(artifact);
      }

      this.send({ type: "agent:result", taskId, status: "completed", artifacts });
    } catch (error) {
      this.log(taskId, "error", error instanceof Error ? error.message : "Task failed");
      this.send({
        type: "agent:result",
        taskId,
        status: "failed",
        artifacts,
        error: error instanceof Error ? error.message : "Task failed"
      });
    }
  }

  private async ensureApproved(taskId: string, action: AgentAction, explicit: boolean): Promise<boolean> {
    const risk = approvalRiskFor(action, explicit);
    if (!risk) return true;
    if (risk === "low" && this.options.autoApproveLowRisk) return true;
    const reason = action.type === "approvalRequest" ? action.reason : `Approve ${risk} action: ${action.type}`;
    this.send({ type: "agent:approval", taskId, reason, risk });
    return new Promise((resolve) => this.approvalResolvers.set(taskId, resolve));
  }

  private async execute(action: AgentAction): Promise<string | undefined> {
    if (action.type === "startRecording") return this.options.recorder.start(action.label ?? "session");
    if (action.type === "stopRecording") return this.options.recorder.stop();
    return this.options.peekwin.execute(action);
  }

  private log(taskId: string, level: "debug" | "info" | "warn" | "error", message: string, data?: unknown): void {
    this.send({ type: "agent:log", taskId, level, message, data });
  }

  private send(message: ClientMessage): void {
    this.socket?.send(JSON.stringify(message));
  }
}

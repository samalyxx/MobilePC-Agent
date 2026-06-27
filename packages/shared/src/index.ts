import crypto from "node:crypto";
import { z } from "zod";

export const DeviceRoleSchema = z.enum(["mobile", "agent"]);
export type DeviceRole = z.infer<typeof DeviceRoleSchema>;

export const TaskStatusSchema = z.enum([
  "queued",
  "running",
  "waiting_for_approval",
  "completed",
  "failed",
  "cancelled"
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const ApprovalRiskSchema = z.enum(["low", "sensitive", "destructive"]);
export type ApprovalRisk = z.infer<typeof ApprovalRiskSchema>;

export const AgentActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("inspect"), target: z.string().optional() }),
  z.object({ type: z.literal("click"), x: z.number(), y: z.number(), ref: z.string().optional() }),
  z.object({ type: z.literal("type"), text: z.string() }),
  z.object({ type: z.literal("hotkey"), keys: z.array(z.string()).min(1) }),
  z.object({ type: z.literal("wait"), ms: z.number().int().positive().max(120000), reason: z.string().optional() }),
  z.object({ type: z.literal("launchApp"), app: z.string(), args: z.array(z.string()).default([]) }),
  z.object({ type: z.literal("screenshot"), label: z.string().optional() }),
  z.object({ type: z.literal("startRecording"), label: z.string().optional() }),
  z.object({ type: z.literal("stopRecording") }),
  z.object({ type: z.literal("approvalRequest"), reason: z.string(), risk: ApprovalRiskSchema })
]);
export type AgentAction = z.infer<typeof AgentActionSchema>;

export const PlannerStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  action: AgentActionSchema,
  requiresApproval: z.boolean().default(false)
});
export type PlannerStep = z.infer<typeof PlannerStepSchema>;

export const PlannerPlanSchema = z.object({
  id: z.string(),
  summary: z.string(),
  steps: z.array(PlannerStepSchema).min(1)
});
export type PlannerPlan = z.infer<typeof PlannerPlanSchema>;

export interface PlannerContext {
  taskId: string;
  prompt: string;
  platform: "windows" | "macos" | "linux";
  capabilities: string[];
}

export interface PlannerProvider {
  readonly name: string;
  createPlan(context: PlannerContext): Promise<PlannerPlan>;
}

export const ClientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hello"), role: DeviceRoleSchema, deviceId: z.string(), token: z.string() }),
  z.object({ type: z.literal("task:create"), prompt: z.string().min(1).max(4000), requestedBy: z.string().default("mobile") }),
  z.object({ type: z.literal("approval:decision"), taskId: z.string(), approved: z.boolean(), note: z.string().optional() }),
  z.object({ type: z.literal("task:cancel"), taskId: z.string() }),
  z.object({ type: z.literal("agent:log"), taskId: z.string(), level: z.enum(["debug", "info", "warn", "error"]), message: z.string(), data: z.unknown().optional() }),
  z.object({ type: z.literal("agent:result"), taskId: z.string(), status: TaskStatusSchema, artifacts: z.array(z.string()).default([]), error: z.string().optional() }),
  z.object({ type: z.literal("agent:approval"), taskId: z.string(), reason: z.string(), risk: ApprovalRiskSchema })
]);
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

export const ServerMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("welcome"), role: DeviceRoleSchema, deviceId: z.string() }),
  z.object({ type: z.literal("task:assigned"), taskId: z.string(), prompt: z.string() }),
  z.object({ type: z.literal("task:update"), taskId: z.string(), status: TaskStatusSchema }),
  z.object({ type: z.literal("task:log"), taskId: z.string(), level: z.enum(["debug", "info", "warn", "error"]), message: z.string(), data: z.unknown().optional(), at: z.string() }),
  z.object({ type: z.literal("task:result"), taskId: z.string(), status: TaskStatusSchema, artifacts: z.array(z.string()).default([]), error: z.string().optional() }),
  z.object({ type: z.literal("approval:requested"), taskId: z.string(), reason: z.string(), risk: ApprovalRiskSchema }),
  z.object({ type: z.literal("approval:decision"), taskId: z.string(), approved: z.boolean(), note: z.string().optional() }),
  z.object({ type: z.literal("error"), code: z.string(), message: z.string() })
]);
export type ServerMessage = z.infer<typeof ServerMessageSchema>;

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

export function createToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function safeParseJsonMessage(input: string): ClientMessage {
  return ClientMessageSchema.parse(JSON.parse(input));
}

export function isSensitiveAction(action: AgentAction): ApprovalRisk | null {
  if (action.type === "approvalRequest") return action.risk;
  if (action.type === "hotkey" && action.keys.map((key) => key.toLowerCase()).includes("delete")) return "destructive";
  if (action.type === "type" && /password|token|secret|api[_ -]?key/i.test(action.text)) return "sensitive";
  return null;
}

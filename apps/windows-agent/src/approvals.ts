import type { AgentAction, ApprovalRisk } from "@mobilepc/shared";
import { isSensitiveAction } from "@mobilepc/shared";

export function approvalRiskFor(action: AgentAction, explicit: boolean): ApprovalRisk | null {
  return explicit ? "sensitive" : isSensitiveAction(action);
}

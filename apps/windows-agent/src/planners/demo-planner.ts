import { newId, type PlannerContext, type PlannerPlan, type PlannerProvider } from "@mobilepc/shared";

export class DemoPlanner implements PlannerProvider {
  readonly name = "demo-deterministic";

  async createPlan(context: PlannerContext): Promise<PlannerPlan> {
    const desktopPath = "%USERPROFILE%\\Desktop\\mobile-agent-demo.txt";
    return {
      id: newId("plan"),
      summary: `Demo plan for: ${context.prompt}`,
      steps: [
        { id: "record-start", title: "Start screen recording", action: { type: "startRecording", label: "notepad-demo" }, requiresApproval: false },
        { id: "launch-notepad", title: "Open Notepad", action: { type: "launchApp", app: "notepad", args: [] }, requiresApproval: false },
        { id: "wait-notepad", title: "Wait for Notepad", action: { type: "wait", ms: 1200, reason: "notepad launch" }, requiresApproval: false },
        { id: "inspect-notepad", title: "Inspect visible UI", action: { type: "inspect", target: "notepad" }, requiresApproval: false },
        { id: "type-message", title: "Type demo message", action: { type: "type", text: "hello from mobile agent" }, requiresApproval: false },
        { id: "save-dialog", title: "Open save dialog", action: { type: "hotkey", keys: ["Control", "S"] }, requiresApproval: false },
        { id: "wait-save", title: "Wait for save dialog", action: { type: "wait", ms: 800, reason: "save dialog" }, requiresApproval: false },
        { id: "type-path", title: "Type Desktop file path", action: { type: "type", text: desktopPath }, requiresApproval: false },
        { id: "confirm-save", title: "Confirm save", action: { type: "hotkey", keys: ["Enter"] }, requiresApproval: false },
        { id: "record-stop", title: "Stop screen recording", action: { type: "stopRecording" }, requiresApproval: false }
      ]
    };
  }
}

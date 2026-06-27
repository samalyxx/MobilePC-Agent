import type { PlannerProvider } from "@mobilepc/shared";
import { DemoPlanner } from "./demo-planner.js";

export function createPlannerProvider(): PlannerProvider {
  return new DemoPlanner();
}

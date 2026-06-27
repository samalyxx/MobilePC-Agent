# Architecture

## Components

`apps/web` is a mobile-first Nuxt 3 PWA. It creates pairing credentials, opens a mobile WebSocket session, submits natural language tasks, handles approvals, and renders live logs/results.

`apps/api` is a Fastify relay. It owns short-lived pairing records, authenticates mobile and agent sockets, stores task metadata in memory for the MVP, and relays task/log/result/approval messages.

`apps/windows-agent` is the local execution runtime. It connects to the relay, plans tasks, runs PeekWin actions, records the screen with FFmpeg, and reports artifacts back to the PWA.

`packages/shared` contains message schemas, planner contracts, ID/token helpers, and shared safety policy.

## Message Flow

1. Mobile creates a pairing.
2. Windows agent starts with `DEVICE_ID` and `AGENT_TOKEN`.
3. Mobile connects with `DEVICE_ID` and `mobileToken`.
4. Mobile submits `task:create`.
5. API assigns the task to the agent.
6. Agent creates a planner plan.
7. Agent executes steps locally with PeekWin and FFmpeg.
8. Agent streams logs, approval requests, and final results through the API.
9. Mobile renders logs, prompts for approvals, and shows artifact paths.

## Planner Interface

Planner providers implement:

```ts
interface PlannerProvider {
  readonly name: string;
  createPlan(context: PlannerContext): Promise<PlannerPlan>;
}
```

The MVP ships with `DemoPlanner`, a deterministic provider for the first working demo. Future adapters for OpenAI, Claude, Gemini, Codex, or local models should translate model output into `PlannerPlan` and rely on shared validation before execution.

## Platform Extensibility

The agent is intentionally adapter-shaped:

- `PeekWinClient`: Windows UI automation and inspection.
- `ScreenRecorder`: FFmpeg recording.
- `PlannerProvider`: model-independent planning.
- `approvalRiskFor`: centralized approval policy.

macOS and Linux support should add platform agents with the same shared contracts instead of changing the relay or PWA protocol.

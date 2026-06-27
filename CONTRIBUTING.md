# Contributing

Thanks for helping build MobilePC-Agent.

## Principles

- Keep execution local to the desktop agent.
- Prefer UI inspection and automation through PeekWin over screenshot-only control.
- Ask for approval before sensitive or destructive actions.
- Keep planner providers behind the shared `PlannerProvider` interface.
- Make platform-specific code live behind adapters so macOS and Linux can be added later.

## Development

```bash
npm install
npm run test
npm run typecheck
```

Run services:

```bash
npm run dev:api
npm run dev:web
npm run dev:agent
```

## Pull Requests

- Include tests for contracts, policy, or planner behavior you change.
- Document new environment variables in the relevant `.env.example`.
- Avoid adding cloud execution paths. The relay can coordinate; the agent executes.

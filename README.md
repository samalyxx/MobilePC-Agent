# MobilePC-Agent

MobilePC-Agent is an open-source, mobile-first remote computer control system. A Nuxt 3 PWA sends natural language tasks to a Fastify relay, which streams them over WebSocket to a local Windows agent. The agent executes locally with PeekWin as the primary UI automation and inspection layer. Screenshots are fallback and reporting tools, not the main control strategy.

## Architecture

```text
Mobile PWA -> Fastify API -> WebSocket relay -> Windows Agent -> PeekWin -> Planner -> logs/results -> PWA
```

Core packages:

- `apps/web`: Nuxt 3 + TypeScript + Tailwind PWA.
- `apps/api`: Fastify HTTP and WebSocket relay with pairing and task metadata.
- `apps/windows-agent`: Node.js + TypeScript desktop agent for PeekWin, FFmpeg, approvals, and local execution.
- `packages/shared`: contracts, schemas, security helpers, and planner interfaces.

## MVP Demo

The included deterministic demo planner opens Notepad, types `hello from mobile agent`, saves it to the Desktop, records the session with FFmpeg, and streams logs/results back to the PWA.

## Requirements

- Node.js 20.11+
- Windows 10/11 for the desktop agent
- PeekWin installed and available as `peekwin.exe`
- FFmpeg installed and available as `ffmpeg.exe`

PeekWin install options are documented upstream: <https://github.com/usamaejaz/peekwin>

## Quick Start

Clone the MVP branch:

```bash
git clone --branch initial-mvp https://github.com/samalyxx/MobilePC-Agent.git
cd MobilePC-Agent
```

Install dependencies:

```bash
npm install
```

If your shell has `NODE_ENV=production`, install dev dependencies explicitly because this repo needs TypeScript, Nuxt, and Vitest for local development:

```bash
npm install --include=dev
```

Create local env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/windows-agent/.env.example apps/windows-agent/.env
cp apps/web/.env.example apps/web/.env
```

Build and verify:

```bash
npm run build
npm run typecheck
npm run test
```

Start the API relay:

```bash
npm run dev:api
```

By default the API listens on:

- HTTP: `http://localhost:8787`
- WebSocket: `ws://localhost:8787/ws`

Start the mobile PWA in a second terminal:

```bash
npm run dev:web
```

Nuxt prints a local URL and a network URL. Open the network URL on your phone if your phone and computer are on the same network.

Start the Windows agent in a third terminal after pairing:

```bash
npm run dev:agent
```

## Pairing A Device

1. Open the PWA.
2. Press `Create pairing`.
3. Copy the displayed `DEVICE_ID` and `AGENT_TOKEN`.
4. Put those values in `apps/windows-agent/.env`:

```bash
API_WS_URL=ws://localhost:8787/ws
DEVICE_ID=pc_...
AGENT_TOKEN=...
PEEKWIN_BIN=peekwin
FFMPEG_BIN=ffmpeg
ARTIFACT_DIR=./recordings
AUTO_APPROVE_LOW_RISK=true
```

5. Press `Connect mobile socket` in the PWA.
6. Run the Windows agent:

```bash
npm run dev:agent
```

The agent should connect to the relay and wait for tasks.

## Running The MVP Demo

After the API, PWA, and Windows agent are running, submit this prompt from the PWA:

```text
open notepad, type hello from mobile agent, save to desktop, record the session
```

Expected result:

- The PWA creates a task and streams live logs.
- The Windows agent creates a deterministic demo plan.
- FFmpeg starts recording the screen.
- PeekWin launches Notepad.
- PeekWin types `hello from mobile agent`.
- PeekWin saves the file to `%USERPROFILE%\Desktop\mobile-agent-demo.txt`.
- FFmpeg stops recording.
- The PWA displays final status and local artifact paths.

The recording stays on the Windows PC under `apps/windows-agent/recordings` by default.

## Testing Without A Windows PC

You can still verify the repo structure, contracts, API, and PWA build on macOS/Linux:

```bash
npm install --include=dev
npm run build
npm run typecheck
npm run test
npm audit --omit=dev
```

You can also run the API and PWA without the Windows agent:

```bash
npm run dev:api
npm run dev:web
```

The PWA will create pairings and submit tasks, but execution requires the Windows agent plus PeekWin and FFmpeg.

## Windows Requirements

Install PeekWin and FFmpeg on the Windows PC that will be controlled:

```powershell
winget install --id UsamaEjaz.PeekWin
winget install --id Gyan.FFmpeg
```

Then confirm both commands work in PowerShell:

```powershell
peekwin --help
ffmpeg -version
```

If the commands are not on PATH, set absolute paths in `apps/windows-agent/.env`:

```bash
PEEKWIN_BIN=C:\path\to\peekwin.exe
FFMPEG_BIN=C:\path\to\ffmpeg.exe
```

## Useful Commands

```bash
npm run dev:api       # Fastify HTTP/WebSocket relay
npm run dev:web       # Nuxt mobile PWA
npm run dev:agent     # Windows desktop agent
npm run build         # Build shared, API, agent, and PWA
npm run typecheck     # TypeScript/Nuxt type checks
npm run test          # Vitest coverage for contracts and safety policy
npm audit --omit=dev  # Production dependency audit
```

## Security Model

- Pairing is short-lived and explicit.
- Agents authenticate to the relay with scoped tokens.
- The cloud/API relay stores task metadata and streams messages only.
- Execution stays local on the Windows PC.
- Destructive and sensitive actions require approval before execution.
- Planner providers are abstracted so OpenAI, Claude, Gemini, Codex, or local models can be plugged in later.

## Current Status

This is a working MVP scaffold with real code paths and test coverage for contracts and safety policy. PeekWin and FFmpeg calls are executed by the Windows agent when run on a properly configured Windows machine.

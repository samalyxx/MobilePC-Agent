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

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/windows-agent/.env.example apps/windows-agent/.env
cp apps/web/.env.example apps/web/.env
npm run build
npm run dev:api
```

In separate terminals:

```bash
npm run dev:web
npm run dev:agent
```

Open the Nuxt URL on your phone or browser, pair the Windows agent with the API, then submit:

```text
open notepad, type hello from mobile agent, save to desktop, record the session
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


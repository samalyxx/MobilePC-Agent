# MVP Demo

## Goal

Open Notepad, type `hello from mobile agent`, save it to the Desktop, record the session, and stream logs/results back to the PWA.

## Setup

Install these on Windows:

```powershell
winget install --id UsamaEjaz.PeekWin
winget install --id Gyan.FFmpeg
```

Start the API:

```bash
npm run dev:api
```

Start the PWA:

```bash
npm run dev:web
```

Create a pairing in the PWA, then put the displayed values into `apps/windows-agent/.env`:

```bash
DEVICE_ID=pc_...
AGENT_TOKEN=...
```

Start the Windows agent:

```bash
npm run dev:agent
```

Submit the default prompt in the PWA. The agent will use the deterministic demo planner for this first flow.

## Notes

The recording artifact path is local to the Windows PC. A later version should add authenticated artifact upload/download or LAN-local retrieval.

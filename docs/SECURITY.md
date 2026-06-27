# Security

## Current MVP Controls

- Pairings use short-lived random role-scoped tokens.
- Agent and mobile clients authenticate separately.
- The API relays tasks and stores metadata only.
- The Windows agent executes locally.
- Sensitive and destructive actions are checked before execution.
- Approval requests flow back to the mobile PWA.

## Production Hardening Roadmap

- Persist pairings and tasks in a database with encrypted token hashes.
- Replace copy/paste pairing with QR codes and device-bound credentials.
- Add TLS everywhere and reject insecure WebSocket URLs outside local development.
- Add replay protection and per-message sequence numbers.
- Scope mobile users to devices and audit every approval decision.
- Add allowlists for apps, filesystem paths, and shell-like operations.
- Sign agent releases and verify PeekWin/FFmpeg binary paths.
- Encrypt recordings and expire artifacts by policy.

## Sensitive Actions

The shared policy currently flags obvious destructive hotkeys and secret-like typed text. Planner providers should also mark high-risk steps with `requiresApproval`, and adapters should refuse unsupported commands by default.

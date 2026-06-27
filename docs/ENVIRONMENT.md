# Environment Variables

## API

- `API_HOST`: bind host, default `0.0.0.0`.
- `API_PORT`: bind port, default `8787`.
- `CORS_ORIGIN`: allowed PWA origin.
- `PAIRING_TTL_SECONDS`: pairing lifetime.

## Web

- `NUXT_PUBLIC_API_BASE`: HTTP API base URL.
- `NUXT_PUBLIC_WS_URL`: WebSocket API URL.

## Windows Agent

- `API_WS_URL`: relay WebSocket URL.
- `DEVICE_ID`: paired device ID from the API.
- `AGENT_TOKEN`: role-scoped agent token from the API.
- `PEEKWIN_BIN`: path or command name for PeekWin.
- `FFMPEG_BIN`: path or command name for FFmpeg.
- `ARTIFACT_DIR`: local recording/capture output directory.
- `AUTO_APPROVE_LOW_RISK`: whether low-risk steps may run without prompting.

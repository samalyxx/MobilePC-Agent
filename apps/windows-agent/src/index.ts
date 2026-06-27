import { config } from "./config.js";
import { WindowsAgent } from "./agent.js";
import { PeekWinClient } from "./peekwin.js";
import { ScreenRecorder } from "./recorder.js";
import { createPlannerProvider } from "./planners/provider.js";

const agent = new WindowsAgent({
  wsUrl: config.API_WS_URL,
  deviceId: config.DEVICE_ID,
  token: config.AGENT_TOKEN,
  autoApproveLowRisk: config.AUTO_APPROVE_LOW_RISK,
  peekwin: new PeekWinClient(config.PEEKWIN_BIN),
  recorder: new ScreenRecorder(config.FFMPEG_BIN, config.ARTIFACT_DIR),
  planner: createPlannerProvider()
});

agent.connect();

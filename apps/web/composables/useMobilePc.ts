import type { ServerMessage } from "@mobilepc/shared";

export interface LogLine {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  at: string;
}

export function useMobilePc() {
  const config = useRuntimeConfig();
  const connected = ref(false);
  const deviceId = ref("");
  const mobileToken = ref("");
  const pairCode = ref("");
  const agentToken = ref("");
  const prompt = ref("open notepad, type hello from mobile agent, save to desktop, record the session");
  const activeTaskId = ref("");
  const status = ref("idle");
  const logs = ref<LogLine[]>([]);
  const artifacts = ref<string[]>([]);
  const approval = ref<{ taskId: string; reason: string; risk: string } | null>(null);
  let socket: WebSocket | undefined;

  async function createPairing() {
    const response = await $fetch<{
      code: string;
      deviceId: string;
      agentToken: string;
      mobileToken: string;
      expiresAt: string;
    }>(`${config.public.apiBase}/pairings`, { method: "POST" });
    pairCode.value = response.code;
    deviceId.value = response.deviceId;
    agentToken.value = response.agentToken;
    mobileToken.value = response.mobileToken;
    status.value = "pairing_ready";
  }

  function useLocalDemoPairing() {
    pairCode.value = "local-dev";
    deviceId.value = config.public.devDeviceId;
    agentToken.value = config.public.devAgentToken;
    mobileToken.value = config.public.devMobileToken;
    status.value = "local_demo_ready";
  }

  function connectMobile() {
    if (!deviceId.value || !mobileToken.value) return;
    socket?.close();
    socket = new WebSocket(config.public.wsUrl);
    socket.addEventListener("open", () => {
      socket?.send(JSON.stringify({
        type: "hello",
        role: "mobile",
        deviceId: deviceId.value,
        token: mobileToken.value
      }));
    });
    socket.addEventListener("message", (event) => handleMessage(JSON.parse(event.data) as ServerMessage));
    socket.addEventListener("close", () => {
      connected.value = false;
    });
  }

  function submitTask() {
    artifacts.value = [];
    logs.value = [];
    socket?.send(JSON.stringify({ type: "task:create", prompt: prompt.value, requestedBy: "mobile" }));
  }

  function decideApproval(approved: boolean) {
    if (!approval.value) return;
    socket?.send(JSON.stringify({ type: "approval:decision", taskId: approval.value.taskId, approved }));
    approval.value = null;
  }

  function handleMessage(message: ServerMessage) {
    if (message.type === "welcome") {
      connected.value = true;
      status.value = "connected";
      return;
    }
    if (message.type === "task:update") {
      activeTaskId.value = message.taskId;
      status.value = message.status;
      return;
    }
    if (message.type === "task:log") {
      activeTaskId.value = message.taskId;
      logs.value.unshift({
        id: `${message.taskId}-${message.at}-${logs.value.length}`,
        level: message.level,
        message: message.message,
        at: message.at
      });
      return;
    }
    if (message.type === "approval:requested") {
      approval.value = { taskId: message.taskId, reason: message.reason, risk: message.risk };
      status.value = "waiting_for_approval";
      return;
    }
    if (message.type === "task:result") {
      activeTaskId.value = message.taskId;
      status.value = message.status;
      artifacts.value = message.artifacts;
      return;
    }
    if (message.type === "error") {
      status.value = message.code;
      logs.value.unshift({ id: crypto.randomUUID(), level: "error", message: message.message, at: new Date().toISOString() });
    }
  }

  onBeforeUnmount(() => socket?.close());

  return {
    connected,
    deviceId,
    mobileToken,
    pairCode,
    agentToken,
    prompt,
    activeTaskId,
    status,
    logs,
    artifacts,
    approval,
    useLocalDemoPairing,
    createPairing,
    connectMobile,
    submitTask,
    decideApproval
  };
}

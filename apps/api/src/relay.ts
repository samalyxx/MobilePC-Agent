import type { WebSocket } from "ws";
import {
  ClientMessageSchema,
  type ClientMessage,
  type DeviceRole,
  type ServerMessage
} from "@mobilepc/shared";
import type { PairingStore } from "./pairing.js";
import type { TaskStore } from "./task-store.js";

interface Peer {
  role: DeviceRole;
  deviceId: string;
  socket: WebSocket;
}

export class RelayHub {
  private readonly peers = new Map<string, Peer>();

  constructor(
    private readonly pairings: PairingStore,
    private readonly tasks: TaskStore
  ) {}

  attach(socket: WebSocket): void {
    let peer: Peer | undefined;

    socket.on("message", (raw) => {
      try {
        const message = ClientMessageSchema.parse(JSON.parse(raw.toString()));
        if (message.type === "hello") {
          if (!this.pairings.verify(message.deviceId, message.token, message.role)) {
            this.send(socket, { type: "error", code: "auth_failed", message: "Invalid or expired pairing token." });
            socket.close();
            return;
          }
          peer = { role: message.role, deviceId: message.deviceId, socket };
          this.peers.set(this.key(message.role, message.deviceId), peer);
          this.send(socket, { type: "welcome", role: message.role, deviceId: message.deviceId });
          return;
        }

        if (!peer) {
          this.send(socket, { type: "error", code: "hello_required", message: "Send hello before other messages." });
          return;
        }

        this.handle(peer, message);
      } catch (error) {
        this.send(socket, {
          type: "error",
          code: "bad_message",
          message: error instanceof Error ? error.message : "Invalid message"
        });
      }
    });

    socket.on("close", () => {
      if (peer) this.peers.delete(this.key(peer.role, peer.deviceId));
    });
  }

  private handle(peer: Peer, message: ClientMessage): void {
    if (message.type === "task:create") {
      const task = this.tasks.create(message.prompt);
      this.broadcast(peer.deviceId, { type: "task:update", taskId: task.id, status: "queued" });
      this.toAgent(peer.deviceId, { type: "task:assigned", taskId: task.id, prompt: task.prompt });
      return;
    }

    if (message.type === "agent:log") {
      this.broadcast(peer.deviceId, {
        type: "task:log",
        taskId: message.taskId,
        level: message.level,
        message: message.message,
        data: message.data,
        at: new Date().toISOString()
      });
      return;
    }

    if (message.type === "agent:approval") {
      this.tasks.update(message.taskId, { status: "waiting_for_approval" });
      this.broadcast(peer.deviceId, {
        type: "approval:requested",
        taskId: message.taskId,
        reason: message.reason,
        risk: message.risk
      });
      return;
    }

    if (message.type === "approval:decision") {
      this.broadcast(peer.deviceId, message);
      return;
    }

    if (message.type === "agent:result") {
      this.tasks.update(message.taskId, {
        status: message.status,
        artifacts: message.artifacts,
        error: message.error
      });
      this.broadcast(peer.deviceId, {
        type: "task:result",
        taskId: message.taskId,
        status: message.status,
        artifacts: message.artifacts,
        error: message.error
      });
      return;
    }

    if (message.type === "task:cancel") {
      this.tasks.update(message.taskId, { status: "cancelled" });
      this.broadcast(peer.deviceId, { type: "task:update", taskId: message.taskId, status: "cancelled" });
    }
  }

  private toAgent(deviceId: string, message: ServerMessage): void {
    const agent = this.peers.get(this.key("agent", deviceId));
    if (!agent) {
      this.broadcast(deviceId, { type: "error", code: "agent_offline", message: "No paired Windows agent is connected." });
      return;
    }
    this.send(agent.socket, message);
  }

  private broadcast(deviceId: string, message: ServerMessage): void {
    for (const role of ["mobile", "agent"] as const) {
      const peer = this.peers.get(this.key(role, deviceId));
      if (peer) this.send(peer.socket, message);
    }
  }

  private send(socket: WebSocket, message: ServerMessage): void {
    socket.send(JSON.stringify(message));
  }

  private key(role: DeviceRole, deviceId: string): string {
    return `${role}:${deviceId}`;
  }
}

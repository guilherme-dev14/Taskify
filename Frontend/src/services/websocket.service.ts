/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "../utils/token.utils";
import type { ICreateTaskRequest } from "../types/task.types";
import type { IWorkspaceMember } from "../types/workspace.types";
import type { INotification } from "../types/notification.types";

export interface WebSocketEvents {
  "task:created": (task: ICreateTaskRequest) => void;
  "task:updated": (task: ICreateTaskRequest) => void;
  "task:deleted": (taskId: string) => void;
  "task:assigned": (data: {
    taskId: string;
    userId: string;
    userName: string;
  }) => void;

  "workspace:member_joined": (member: IWorkspaceMember) => void;
  "workspace:member_left": (memberId: string) => void;
  "workspace:updated": (workspace: IWorkspaceMember) => void;

  "user:online": (data: { userId: string; userName: string }) => void;
  "user:offline": (userId: string) => void;
  "user:typing": (data: {
    userId: string;
    userName: string;
    taskId?: string;
  }) => void;
  "user:cursor": (data: {
    userId: string;
    userName: string;
    x: number;
    y: number;
  }) => void;

  "notification:new": (notification: INotification) => void;
  "notification:read": (notificationId: string) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, any>();
  private eventHandlers = new Map<string, Array<(data: any) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<Client> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve(this.client);
        return;
      }

      const token = getToken();
      if (!token) {
        reject(new Error("No authentication token available"));
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: () => {},
        onConnect: () => {
          this.reconnectAttempts = 0;
          this.setupDefaultSubscriptions();
          resolve(this.client!);
        },
        onDisconnect: () => {},
        onStompError: (frame) => {
          reject(new Error(frame.body));
        },
        onWebSocketError: (error) => {
          this.handleReconnection();
          reject(error);
        },
      });

      this.client.activate();
    });
  }

  private setupDefaultSubscriptions() {
    if (!this.client) return;

    this.subscribe("/topic/tasks", (message) => {
      const data = JSON.parse(message.body);
      this.emit(`task:${data.action}`, data.task);
    });

    this.subscribe("/topic/workspaces", (message) => {
      const data = JSON.parse(message.body);
      this.emit(`workspace:${data.action}`, data.workspace);
    });
    this.subscribe("/topic/presence", (message) => {
      const data = JSON.parse(message.body);
      this.emit(`user:${data.action}`, data);
    });
    this.subscribe("/user/queue/notifications", (message) => {
      const data = JSON.parse(message.body);
      this.emit("notification:new", data);
    });
  }

  private subscribe(destination: string, callback: (message: any) => void) {
    if (!this.client) return;

    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.client?.activate();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this.eventHandlers.clear();
  }

  joinWorkspace(workspaceId: string) {
    this.client?.publish({
      destination: "/app/workspace/join",
      body: JSON.stringify({ workspaceId }),
    });
  }

  leaveWorkspace(workspaceId: string) {
    this.client?.publish({
      destination: "/app/workspace/leave",
      body: JSON.stringify({ workspaceId }),
    });
  }

  watchTask(taskId: string) {
    this.client?.publish({
      destination: "/app/task/watch",
      body: JSON.stringify({ taskId }),
    });
  }

  unwatchTask(taskId: string) {
    this.client?.publish({
      destination: "/app/task/unwatch",
      body: JSON.stringify({ taskId }),
    });
  }

  updateCursor(x: number, y: number, taskId?: string) {
    this.client?.publish({
      destination: "/app/presence/cursor",
      body: JSON.stringify({ x, y, taskId }),
    });
  }

  startTyping(taskId?: string) {
    this.client?.publish({
      destination: "/app/presence/typing/start",
      body: JSON.stringify({ taskId }),
    });
  }

  stopTyping(taskId?: string) {
    this.client?.publish({
      destination: "/app/presence/typing/stop",
      body: JSON.stringify({ taskId }),
    });
  }

  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback as any);
  }

  off<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ) {
    if (!this.eventHandlers.has(event)) return;

    if (callback) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(callback as any);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.set(event, []);
    }
  }
  emit(event: string, data?: unknown) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  get isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export default new WebSocketService();

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from "../utils/token.utils";
import type { ICreateTaskRequest } from "../types/task.types";
import type { IWorkspaceMember } from "../types/workspace.types";
import type { INotification } from "../types/notification.types";

export interface WebSocketEvents {
  // Task events
  "task:created": (task: ICreateTaskRequest) => void;
  "task:updated": (task: ICreateTaskRequest) => void;
  "task:deleted": (taskId: string) => void;
  "task:assigned": (data: {
    taskId: string;
    userId: string;
    userName: string;
  }) => void;

  // Workspace events
  "workspace:member_joined": (member: IWorkspaceMember) => void;
  "workspace:member_left": (memberId: string) => void;
  "workspace:updated": (workspace: IWorkspaceMember) => void;

  // Presence events
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

  // Notification events
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
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: (frame) => {
          console.log('STOMP Connected:', frame);
          this.reconnectAttempts = 0;
          this.setupDefaultSubscriptions();
          resolve(this.client!);
        },
        onDisconnect: (frame) => {
          console.log('STOMP Disconnected:', frame);
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          reject(new Error(frame.body));
        },
        onWebSocketError: (error) => {
          console.error('WebSocket Error:', error);
          this.handleReconnection();
          reject(error);
        }
      });

      this.client.activate();
    });
  }

  private setupDefaultSubscriptions() {
    if (!this.client) return;

    // Subscribe to task updates
    this.subscribe('/topic/tasks', (message) => {
      const data = JSON.parse(message.body);
      this.emit(`task:${data.action}`, data.task);
    });

    // Subscribe to workspace updates
    this.subscribe('/topic/workspaces', (message) => {
      const data = JSON.parse(message.body);
      this.emit(`workspace:${data.action}`, data.workspace);
    });

    // Subscribe to presence updates
    this.subscribe('/topic/presence', (message) => {
      const data = JSON.parse(message.body);
      this.emit(`user:${data.action}`, data);
    });

    // Subscribe to notifications
    this.subscribe('/user/queue/notifications', (message) => {
      const data = JSON.parse(message.body);
      this.emit('notification:new', data);
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
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.client?.activate();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this.eventHandlers.clear();
  }

  // Workspace methods
  joinWorkspace(workspaceId: string) {
    this.client?.publish({
      destination: '/app/workspace/join',
      body: JSON.stringify({ workspaceId })
    });
  }

  leaveWorkspace(workspaceId: string) {
    this.client?.publish({
      destination: '/app/workspace/leave',
      body: JSON.stringify({ workspaceId })
    });
  }

  // Task methods
  watchTask(taskId: string) {
    this.client?.publish({
      destination: '/app/task/watch',
      body: JSON.stringify({ taskId })
    });
  }

  unwatchTask(taskId: string) {
    this.client?.publish({
      destination: '/app/task/unwatch',
      body: JSON.stringify({ taskId })
    });
  }

  // Presence methods
  updateCursor(x: number, y: number, taskId?: string) {
    this.client?.publish({
      destination: '/app/presence/cursor',
      body: JSON.stringify({ x, y, taskId })
    });
  }

  startTyping(taskId?: string) {
    this.client?.publish({
      destination: '/app/presence/typing/start',
      body: JSON.stringify({ taskId })
    });
  }

  stopTyping(taskId?: string) {
    this.client?.publish({
      destination: '/app/presence/typing/stop',
      body: JSON.stringify({ taskId })
    });
  }

  // Event listeners - custom implementation for STOMP
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

  // Internal emit method
  emit(event: string, data?: unknown) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  get isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export default new WebSocketService();

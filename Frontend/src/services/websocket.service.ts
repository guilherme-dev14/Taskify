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
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'failed' = 'disconnected';
  private errorHandlers = new Map<string, Array<(error: any) => void>>();

  connect(): Promise<Client> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve(this.client);
        return;
      }

      const token = getToken();
      if (!token) {
        this.connectionStatus = 'failed';
        this.emitError('auth', new Error("No authentication token available"));
        reject(new Error("No authentication token available"));
        return;
      }

      this.connectionStatus = 'connecting';

      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('WebSocket Debug:', str);
          }
        },
        onConnect: () => {
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.setupDefaultSubscriptions();
          this.emit('connection:established', null);
          resolve(this.client!);
        },
        onDisconnect: () => {
          this.connectionStatus = 'disconnected';
          this.emit('connection:lost', null);
          this.handleReconnection();
        },
        onStompError: (frame) => {
          this.connectionStatus = 'failed';
          const error = new Error(`STOMP Error: ${frame.body}`);
          this.emitError('stomp', error);
          reject(error);
        },
        onWebSocketError: (error) => {
          this.connectionStatus = 'failed';
          this.emitError('websocket', error);
          this.handleReconnection();
          reject(error);
        },
        onWebSocketClose: () => {
          this.connectionStatus = 'disconnected';
          this.emit('connection:closed', null);
        }
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
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      this.emit('connection:reconnecting', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        nextAttemptIn: delay
      });

      setTimeout(() => {
        if (this.connectionStatus !== 'connected') {
          this.connect().catch(error => {
            console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              this.connectionStatus = 'failed';
              this.emitError('connection', new Error('Maximum reconnection attempts reached'));
            }
          });
        }
      }, delay);
    } else {
      this.connectionStatus = 'failed';
      this.emitError('connection', new Error('Maximum reconnection attempts reached'));
    }
  }

  disconnect() {
    try {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription, destination) => {
        try {
          subscription.unsubscribe();
          console.log(`Unsubscribed from: ${destination}`);
        } catch (error) {
          console.warn(`Error unsubscribing from ${destination}:`, error);
        }
      });
      this.subscriptions.clear();

      // Deactivate the client
      if (this.client) {
        this.client.deactivate();
        this.client = null;
      }

      // Clear event handlers
      this.eventHandlers.clear();
      this.errorHandlers.clear();

      // Reset connection status
      this.connectionStatus = 'disconnected';

      console.log('WebSocket service disconnected successfully');
    } catch (error) {
      console.error('Error during WebSocket disconnect:', error);
    }
  }

  unsubscribeFromWorkspaceChannel(workspaceId: string): void {
    const subscriptionsToRemove = [
      `/topic/workspace/${workspaceId}/tasks`,
      `/topic/workspace/${workspaceId}/presence`,
      `/topic/workspace/${workspaceId}/activity`,
      `/topic/workspace/${workspaceId}/cursors`
    ];

    subscriptionsToRemove.forEach(destination => {
      const subscription = this.subscriptions.get(destination);
      if (subscription) {
        try {
          subscription.unsubscribe();
          this.subscriptions.delete(destination);
          console.log(`Unsubscribed from: ${destination}`);
        } catch (error) {
          console.warn(`Error unsubscribing from ${destination}:`, error);
        }
      }
    });
  }

  joinWorkspace(workspaceId: string) {
    this.client?.publish({
      destination: "/app/workspace.join",
      body: JSON.stringify({ workspaceId }),
    });
  }

  leaveWorkspace(workspaceId: string) {
    this.client?.publish({
      destination: "/app/workspace.leave",
      body: JSON.stringify({ workspaceId }),
    });
  }

  watchTask(taskId: string) {
    this.client?.publish({
      destination: "/app/task.watch",
      body: JSON.stringify({ taskId }),
    });
  }

  unwatchTask(taskId: string) {
    this.client?.publish({
      destination: "/app/task.unwatch",
      body: JSON.stringify({ taskId }),
    });
  }

  updateCursor(x: number, y: number, taskId?: string) {
    this.client?.publish({
      destination: "/app/cursor.update",
      body: JSON.stringify({ x, y, taskId }),
    });
  }

  startTyping(taskId?: string) {
    this.client?.publish({
      destination: "/app/typing.start",
      body: JSON.stringify({ taskId }),
    });
  }

  stopTyping(taskId?: string) {
    this.client?.publish({
      destination: "/app/typing.stop",
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

  get status(): 'connecting' | 'connected' | 'disconnected' | 'failed' {
    return this.connectionStatus;
  }

  onError(errorType: string, callback: (error: any) => void): void {
    if (!this.errorHandlers.has(errorType)) {
      this.errorHandlers.set(errorType, []);
    }
    this.errorHandlers.get(errorType)!.push(callback);
  }

  offError(errorType: string, callback?: (error: any) => void): void {
    if (!this.errorHandlers.has(errorType)) return;

    if (callback) {
      const handlers = this.errorHandlers.get(errorType)!;
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.errorHandlers.set(errorType, []);
    }
  }

  private emitError(errorType: string, error: any): void {
    console.error(`WebSocket ${errorType} error:`, error);

    const handlers = this.errorHandlers.get(errorType);
    if (handlers) {
      handlers.forEach(handler => handler(error));
    }

    // Also emit to general error listeners
    const generalHandlers = this.errorHandlers.get('error');
    if (generalHandlers) {
      generalHandlers.forEach(handler => handler({ type: errorType, error }));
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  sendMessage(destination: string, message: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
    }
  }

  subscribeToWorkspaceChannel(workspaceId: string, callback: (message: any) => void): void {
    if (!this.client) {
      this.connect().then(() => {
        this.subscribeToWorkspaceChannel(workspaceId, callback);
      });
      return;
    }

    if (!this.client.connected) {
      this.client.activate();
      setTimeout(() => {
        this.subscribeToWorkspaceChannel(workspaceId, callback);
      }, 1000);
      return;
    }

    // Subscribe to workspace-specific topics
    const subscriptions = [
      `/topic/workspace/${workspaceId}/tasks`,
      `/topic/workspace/${workspaceId}/presence`,
      `/topic/workspace/${workspaceId}/activity`,
      `/topic/workspace/${workspaceId}/cursors`
    ];

    subscriptions.forEach(destination => {
      if (!this.subscriptions.has(destination)) {
        const subscription = this.client!.subscribe(destination, (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        });
        this.subscriptions.set(destination, subscription);
      }
    });

    // Join workspace
    this.joinWorkspace(workspaceId);
  }
}

export default new WebSocketService();

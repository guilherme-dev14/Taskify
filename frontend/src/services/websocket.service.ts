import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/token.utils';

export interface WebSocketEvents {
  // Task events
  'task:created': (task: any) => void;
  'task:updated': (task: any) => void;
  'task:deleted': (taskId: string) => void;
  'task:assigned': (data: { taskId: string; userId: string; userName: string }) => void;
  
  // Workspace events
  'workspace:member_joined': (member: any) => void;
  'workspace:member_left': (memberId: string) => void;
  'workspace:updated': (workspace: any) => void;
  
  // Presence events
  'user:online': (data: { userId: string; userName: string }) => void;
  'user:offline': (userId: string) => void;
  'user:typing': (data: { userId: string; userName: string; taskId?: string }) => void;
  'user:cursor': (data: { userId: string; userName: string; x: number; y: number }) => void;
  
  // Notification events
  'notification:new': (notification: any) => void;
  'notification:read': (notificationId: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      const token = getToken();
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io('http://localhost:8080', {
        auth: {
          token: `Bearer ${token}`
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        if (reason === 'io server disconnect') {
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.handleReconnection();
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Workspace methods
  joinWorkspace(workspaceId: string) {
    this.socket?.emit('workspace:join', { workspaceId });
  }

  leaveWorkspace(workspaceId: string) {
    this.socket?.emit('workspace:leave', { workspaceId });
  }

  // Task methods
  watchTask(taskId: string) {
    this.socket?.emit('task:watch', { taskId });
  }

  unwatchTask(taskId: string) {
    this.socket?.emit('task:unwatch', { taskId });
  }

  // Presence methods
  updateCursor(x: number, y: number, taskId?: string) {
    this.socket?.emit('cursor:update', { x, y, taskId });
  }

  startTyping(taskId?: string) {
    this.socket?.emit('typing:start', { taskId });
  }

  stopTyping(taskId?: string) {
    this.socket?.emit('typing:stop', { taskId });
  }

  // Event listeners
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    this.socket?.on(event, callback);
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    this.socket?.off(event, callback);
  }

  // Generic emit
  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
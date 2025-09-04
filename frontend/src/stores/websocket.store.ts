import { create } from "zustand";
import { io, Socket } from "socket.io-client";

export interface WebSocketMessage {
  type: 'TASK_UPDATED' | 'TASK_CREATED' | 'TASK_DELETED' | 
        'TIME_TRACKING_STARTED' | 'TIME_TRACKING_STOPPED' |
        'NOTIFICATION' | 'USER_ACTIVITY' | 'WORKSPACE_UPDATED';
  payload: any;
  timestamp: string;
  userId?: number;
  workspaceId?: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected: string | null;
  connectionAttempts: number;
  latency: number;
}

interface WebSocketState {
  socket: Socket | null;
  status: ConnectionStatus;
  subscribedChannels: Set<string>;
  messageHistory: WebSocketMessage[];
  error: string | null;
  
  // Connection management
  connect: (token: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Channel management
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  subscribeToWorkspace: (workspaceId: number) => void;
  subscribeToTask: (taskId: number) => void;
  subscribeToUser: (userId: number) => void;
  
  // Message handling
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp'>) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
  
  // Real-time event handlers
  onTaskUpdate: (callback: (task: any) => void) => () => void;
  onTimeTrackingUpdate: (callback: (entry: any) => void) => () => void;
  onNotification: (callback: (notification: any) => void) => () => void;
  
  // State management
  setError: (error: string | null) => void;
  clearMessageHistory: () => void;
  updateLatency: (latency: number) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  status: {
    isConnected: false,
    isReconnecting: false,
    lastConnected: null,
    connectionAttempts: 0,
    latency: 0,
  },
  subscribedChannels: new Set(),
  messageHistory: [],
  error: null,

  connect: (token) => {
    const { socket } = get();
    if (socket?.connected) {
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    // Connection event listeners
    newSocket.on('connect', () => {
      set((state) => ({
        status: {
          ...state.status,
          isConnected: true,
          isReconnecting: false,
          lastConnected: new Date().toISOString(),
          connectionAttempts: 0,
        },
        error: null,
      }));
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', (reason) => {
      set((state) => ({
        status: {
          ...state.status,
          isConnected: false,
          isReconnecting: reason === 'io server disconnect' ? false : true,
        },
      }));
      console.log('WebSocket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      set((state) => ({
        status: {
          ...state.status,
          isConnected: false,
          isReconnecting: true,
          connectionAttempts: state.status.connectionAttempts + 1,
        },
        error: error.message,
      }));
      console.error('WebSocket connection error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      set((state) => ({
        status: {
          ...state.status,
          isReconnecting: false,
          connectionAttempts: attemptNumber,
        },
      }));
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    });

    // Message listeners
    newSocket.on('message', (message: WebSocketMessage) => {
      set((state) => ({
        messageHistory: [message, ...state.messageHistory.slice(0, 99)], // Keep last 100 messages
      }));
    });

    // Latency measurement
    const measureLatency = () => {
      const start = Date.now();
      newSocket.emit('ping', start);
    };

    newSocket.on('pong', (timestamp) => {
      const latency = Date.now() - timestamp;
      get().updateLatency(latency);
    });

    // Start latency measurement every 30 seconds
    const latencyInterval = setInterval(measureLatency, 30000);
    
    newSocket.on('disconnect', () => {
      clearInterval(latencyInterval);
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null,
        subscribedChannels: new Set(),
        status: {
          isConnected: false,
          isReconnecting: false,
          lastConnected: null,
          connectionAttempts: 0,
          latency: 0,
        }
      });
    }
  },

  reconnect: () => {
    const { disconnect, connect } = get();
    disconnect();
    // Get token from auth store or localStorage
    const token = localStorage.getItem('auth-token');
    if (token) {
      setTimeout(() => connect(token), 1000);
    }
  },

  subscribe: (channel) => {
    const { socket, subscribedChannels } = get();
    if (socket?.connected && !subscribedChannels.has(channel)) {
      socket.emit('subscribe', channel);
      set({
        subscribedChannels: new Set([...subscribedChannels, channel])
      });
    }
  },

  unsubscribe: (channel) => {
    const { socket, subscribedChannels } = get();
    if (socket?.connected && subscribedChannels.has(channel)) {
      socket.emit('unsubscribe', channel);
      const newChannels = new Set(subscribedChannels);
      newChannels.delete(channel);
      set({ subscribedChannels: newChannels });
    }
  },

  subscribeToWorkspace: (workspaceId) => {
    get().subscribe(`workspace:${workspaceId}`);
  },

  subscribeToTask: (taskId) => {
    get().subscribe(`task:${taskId}`);
  },

  subscribeToUser: (userId) => {
    get().subscribe(`user:${userId}`);
  },

  sendMessage: (message) => {
    const { socket } = get();
    if (socket?.connected) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      socket.emit('message', fullMessage);
    }
  },

  onMessage: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.on('message', callback);
      return () => socket.off('message', callback);
    }
    return () => {};
  },

  onTaskUpdate: (callback) => {
    const { socket } = get();
    if (socket) {
      const handler = (message: WebSocketMessage) => {
        if (message.type === 'TASK_UPDATED' || message.type === 'TASK_CREATED') {
          callback(message.payload);
        }
      };
      socket.on('message', handler);
      return () => socket.off('message', handler);
    }
    return () => {};
  },

  onTimeTrackingUpdate: (callback) => {
    const { socket } = get();
    if (socket) {
      const handler = (message: WebSocketMessage) => {
        if (message.type === 'TIME_TRACKING_STARTED' || message.type === 'TIME_TRACKING_STOPPED') {
          callback(message.payload);
        }
      };
      socket.on('message', handler);
      return () => socket.off('message', handler);
    }
    return () => {};
  },

  onNotification: (callback) => {
    const { socket } = get();
    if (socket) {
      const handler = (message: WebSocketMessage) => {
        if (message.type === 'NOTIFICATION') {
          callback(message.payload);
        }
      };
      socket.on('message', handler);
      return () => socket.off('message', handler);
    }
    return () => {};
  },

  setError: (error) => set({ error }),

  clearMessageHistory: () => set({ messageHistory: [] }),

  updateLatency: (latency) =>
    set((state) => ({
      status: { ...state.status, latency }
    })),
}));
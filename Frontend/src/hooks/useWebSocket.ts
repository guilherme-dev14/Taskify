import { useEffect, useRef } from 'react';
import { useAuthStore } from '../services/auth.store';
import websocketService, { type WebSocketEvents } from '../services/websocket.service';

export function useWebSocket() {
  const { user } = useAuthStore();
  const connectionAttempted = useRef(false);

  useEffect(() => {
    if (user && !connectionAttempted.current) {
      connectionAttempted.current = true;
      websocketService.connect().catch(console.error);
    }

    return () => {
      if (!user) {
        websocketService.disconnect();
        connectionAttempted.current = false;
      }
    };
  }, [user]);

  return {
    isConnected: websocketService.isConnected,
    joinWorkspace: websocketService.joinWorkspace.bind(websocketService),
    leaveWorkspace: websocketService.leaveWorkspace.bind(websocketService),
    watchTask: websocketService.watchTask.bind(websocketService),
    unwatchTask: websocketService.unwatchTask.bind(websocketService),
    updateCursor: websocketService.updateCursor.bind(websocketService),
    startTyping: websocketService.startTyping.bind(websocketService),
    stopTyping: websocketService.stopTyping.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
    emit: websocketService.emit.bind(websocketService)
  };
}

export function useWebSocketEvent<K extends keyof WebSocketEvents>(
  event: K,
  callback: WebSocketEvents[K],
  deps: React.DependencyList = []
) {
  const websocket = useWebSocket();

  useEffect(() => {
    websocket.on(event, callback);
    return () => {
      websocket.off(event, callback);
    };
  }, [websocket, event, ...deps]);
}
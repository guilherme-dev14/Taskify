import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import webSocketService, {
  type WebSocketEvents,
} from "../services/websocket.service";
import { type ITask } from "../types/task.types";

export const useWebSocket = (workspaceId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (workspaceId) {
      const callback = (message: any) => {
        // Handle task updates from backend format
        if (
          message.action &&
          (message.action === "CREATED" ||
            message.action === "UPDATED" ||
            message.action === "DELETED" ||
            message.action === "ASSIGNED")
        ) {
          queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId],
          });
        }

        // Handle presence updates
        if (message.type === "USER_ONLINE" || message.type === "USER_OFFLINE") {
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId, "members"],
          });
        }

        // Handle activity updates
        if (message.activity) {
          queryClient.invalidateQueries({
            queryKey: ["workspace", workspaceId, "activities"],
          });
        }
      };

      webSocketService.subscribeToWorkspaceChannel(workspaceId, callback);

      return () => {
        if (workspaceId) {
          webSocketService.leaveWorkspace(workspaceId);
          webSocketService.unsubscribeFromWorkspaceChannel(workspaceId);
        }
      };
    }
  }, [workspaceId, queryClient]);

  const notifyTaskChange = (
    spaceId: string,
    actionType: "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED",
    task: Partial<ITask>
  ) => {
    if (webSocketService.isInitialized()) {
      // Note: The backend automatically broadcasts task changes via WebSocketService
      // This function can be used for custom notifications if needed
      console.log(`Task ${actionType} for workspace ${spaceId}:`, task);
    }
  };

  return { notifyTaskChange };
};

export const useWebSocketEvent = <K extends keyof WebSocketEvents>(
  event: K,
  callback: WebSocketEvents[K],
  dependencies: any[] = []
) => {
  const callbackRef = useCallback(callback, dependencies);

  useEffect(() => {
    webSocketService.on(event, callbackRef);

    return () => {
      webSocketService.off(event, callbackRef);
    };
  }, [event, callbackRef]);
};

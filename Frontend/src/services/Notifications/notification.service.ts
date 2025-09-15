import api from "../api";
import type {
  INotificationFilters,
  INotificationsResponse,
  INotificationPreferences,
} from "../../types/notification.types";

export const notificationService = {
  getNotifications: async (
    filters: INotificationFilters
  ): Promise<INotificationsResponse> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
    });

    if (filters.read !== undefined)
      params.append("read", filters.read.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.workspaceId) params.append("workspaceId", filters.workspaceId);

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.count;
  },
  getPreferences: async (): Promise<INotificationPreferences> => {
    const response = await api.get("/notifications/preferences");
    return response.data;
  },

  updatePreferences: async (
    preferences: Partial<INotificationPreferences>
  ): Promise<INotificationPreferences> => {
    const response = await api.put("/notifications/preferences", preferences);
    return response.data;
  },

  requestPushPermission: async (): Promise<NotificationPermission> => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return "denied";
  },

  sendPushNotification: (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      return new Notification(title, options);
    }
    return null;
  },
};

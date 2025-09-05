import api from "../api";
import type {
  INotificationFilters,
  INotificationsResponse,
  INotificationPreferences,
} from "../../types/notification.types";

export const notificationService = {
  // Get notifications with pagination and filters
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

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.count;
  },

  // Get notification preferences
  getPreferences: async (): Promise<INotificationPreferences> => {
    const response = await api.get("/notifications/preferences");
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (
    preferences: Partial<INotificationPreferences>
  ): Promise<INotificationPreferences> => {
    const response = await api.patch("/notifications/preferences", preferences);
    return response.data;
  },

  // Request push notification permission
  requestPushPermission: async (): Promise<NotificationPermission> => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return "denied";
  },

  // Send push notification
  sendPushNotification: (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      return new Notification(title, options);
    }
    return null;
  },
};

import React, { useState } from "react";
import { BellIcon, XMarkIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/Notifications/notification.service";
import { useWebSocketEvent } from "../../hooks/useWebSocket";
import { type INotification } from "../../types/notification.types";
import { formatDate } from "../../utils/dateUtils";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", { page: 0, size: 20 }],
    queryFn: () => notificationService.getNotifications({ page: 0, size: 20 }),
    enabled: isOpen,
  });

  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Safe check for notifications content
  const notificationsList = notifications?.content || [];

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      setUnreadCount(0);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  useWebSocketEvent("notification:new", (notification: INotification) => {
    setUnreadCount((prev) => prev + 1);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

    notificationService.sendPushNotification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
    });
  });

  useWebSocketEvent("notification:read", () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  const handleMarkAsRead = (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: INotification["type"]) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return "📋";
      case "TASK_UPDATED":
        return "✏️";
      case "TASK_DUE":
        return "⏰";
      case "WORKSPACE_INVITE":
        return "👥";
      case "MEMBER_JOINED":
        return "🎉";
      case "COMMENT_ADDED":
        return "💬";
      default:
        return "📢";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : notificationsList.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificationsList.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-medium text-gray-900 ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) =>
                                  handleMarkAsRead(notification.id, e)
                                }
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                              title="Delete notification"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificationsList.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

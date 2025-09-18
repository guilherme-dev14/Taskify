/* eslint-disable @typescript-eslint/no-explicit-any */
export interface INotification {
  id: string;
  type:
    | "TASK_ASSIGNED"
    | "TASK_UPDATED"
    | "TASK_DUE"
    | "WORKSPACE_INVITE"
    | "MEMBER_JOINED"
    | "COMMENT_ADDED";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  workspaceId?: string;
  taskId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface INotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskAssignments: boolean;
  taskUpdates: boolean;
  dueDates: boolean;
  workspaceUpdates: boolean;
  comments: boolean;
  digestEmail: "NONE" | "DAILY" | "WEEKLY";
}

export interface ICreateNotificationRequest {
  type: INotification["type"];
  title: string;
  message: string;
  userId: string;
  workspaceId?: string;
  taskId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface INotificationFilters {
  page: number;
  size: number;
  read?: boolean;
  type?: INotification["type"];
  workspaceId?: string;
}

export interface INotificationsResponse {
  content: INotification[];
  totalElements: number;
  unreadCount: number;
  page: number;
  totalPages: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

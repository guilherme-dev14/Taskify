import api from "../api";

export interface IActivityItem {
  id: string;
  type:
    | "task_completed"
    | "task_created"
    | "timer_started"
    | "timer_stopped"
    | "comment_added"
    | "user_joined"
    | "task_assigned"
    | "deadline_approaching";
  title: string;
  description: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: {
    taskId?: number;
    taskTitle?: string;
    workspaceId?: number;
    workspaceName?: string;
    duration?: number;
  };
}

export interface IActivityFilters {
  page?: number;
  size?: number;
  type?: IActivityItem["type"];
  workspaceId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface IActivityResponse {
  content: IActivityItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

class ActivityService {
  private readonly baseUrl = "/activities";

  async getActivities(
    filters: IActivityFilters = {}
  ): Promise<IActivityResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.workspaceId)
      params.append("workspaceId", filters.workspaceId.toString());
    if (filters.userId) params.append("userId", filters.userId.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getRecentActivities(limit: number = 20): Promise<IActivityItem[]> {
    const response = await api.get(`${this.baseUrl}/recent?limit=${limit}`);
    return response.data;
  }

  async getUserActivities(
    userId: number,
    filters: IActivityFilters = {}
  ): Promise<IActivityResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(
      `${this.baseUrl}/user/${userId}?${params.toString()}`
    );
    return response.data;
  }

  async getWorkspaceActivities(
    workspaceId: number,
    filters: IActivityFilters = {}
  ): Promise<IActivityResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(
      `${this.baseUrl}/workspace/${workspaceId}?${params.toString()}`
    );
    return response.data;
  }

  async clearUserActivities(userId: number): Promise<void> {
    await api.delete(`/activities/user/${userId}/clear`);
  }

  async getActivityStats(
    filters: {
      startDate?: string;
      endDate?: string;
      workspaceId?: number;
    } = {}
  ): Promise<{
    totalActivities: number;
    activitiesByType: Record<IActivityItem["type"], number>;
    dailyActivity: Array<{
      date: string;
      count: number;
    }>;
    mostActiveUsers: Array<{
      userId: number;
      userName: string;
      count: number;
    }>;
  }> {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.workspaceId)
      params.append("workspaceId", filters.workspaceId.toString());

    const response = await api.get(
      `${this.baseUrl}/stats?${params.toString()}`
    );
    return response.data;
  }
}

export const activityService = new ActivityService();

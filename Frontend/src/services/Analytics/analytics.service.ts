import api from "../api";

export interface IProductivityMetrics {
  todayCompleted: number;
  todayTarget: number;
  weeklyStreak: number;
  focusTime: number;
  efficiency: number;
  weeklyGoalProgress: number;
  dailyProgress: {
    completed: number;
    target: number;
    percentage: number;
  };
  weeklyStats: {
    tasksCompleted: number;
    totalFocusTime: number;
    averageTaskTime: number;
    productivityScore: number;
  };
}

export interface IAnalyticsOverview {
  totalTasks: number;
  completedTasks: number;
  totalTimeSpent: number;
  averageCompletionTime: number;
  productivityScore: number;
  teamEfficiency: number;
}

export interface IDistributionData {
  tasksByStatus: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  tasksByPriority: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  timeByCategory: {
    labels: string[];
    data: number[];
    colors: string[];
  };
}

export interface ITeamAnalytics {
  members: Array<{
    id: number;
    name: string;
    avatar?: string;
    completed: number;
    timeSpent: number;
    efficiency: number;
    tasksInProgress: number;
    averageTaskTime: number;
  }>;
  teamStats: {
    totalMembers: number;
    activeMembers: number;
    averageEfficiency: number;
    totalTasksCompleted: number;
    totalTimeSpent: number;
  };
}

export interface IAnalyticsFilters {
  workspaceId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
  period?: "day" | "week" | "month" | "quarter" | "year";
}

class AnalyticsService {
  private readonly baseUrl = "/analytics";

  async getProductivityMetrics(
    filters: IAnalyticsFilters = {}
  ): Promise<IProductivityMetrics> {
    const params = new URLSearchParams();

    if (filters.workspaceId)
      params.append("workspaceId", filters.workspaceId.toString());
    if (filters.userId) params.append("userId", filters.userId.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.period) params.append("period", filters.period);

    const response = await api.get(
      `${this.baseUrl}/productivity?${params.toString()}`
    );
    return response.data;
  }

  async getAnalyticsOverview(
    filters: IAnalyticsFilters = {}
  ): Promise<IAnalyticsOverview> {
    const params = new URLSearchParams();

    if (filters.workspaceId)
      params.append("workspaceId", filters.workspaceId.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.period) params.append("period", filters.period);

    const response = await api.get(
      `${this.baseUrl}/overview?${params.toString()}`
    );
    return response.data;
  }

  async getDistributionData(
    filters: IAnalyticsFilters = {}
  ): Promise<IDistributionData> {
    const params = new URLSearchParams();

    if (filters.workspaceId)
      params.append("workspaceId", filters.workspaceId.toString());
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.period) params.append("period", filters.period);

    const response = await api.get(
      `${this.baseUrl}/distribution?${params.toString()}`
    );
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();

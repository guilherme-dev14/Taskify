import api from "../api";

export interface ITaskHistory {
  id: string;
  fieldChanged: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  changedAt: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ITaskHistoryResponse {
  content: ITaskHistory[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const taskHistoryService = {
  async getTaskHistory(taskId: string): Promise<ITaskHistory[]> {
    const response = await api.get(`/tasks/${taskId}/history`);
    return response.data;
  },

  async getTaskHistoryPaginated(
    taskId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "changedAt",
    sortDir: "asc" | "desc" = "desc"
  ): Promise<ITaskHistoryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    const response = await api.get(
      `/tasks/${taskId}/history/paginated?${params.toString()}`
    );
    return response.data;
  },

  async getWorkspaceHistory(
    workspaceId: number,
    page: number = 0,
    size: number = 20,
    sortBy: string = "changedAt",
    sortDir: "asc" | "desc" = "desc"
  ): Promise<ITaskHistoryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    const response = await api.get(
      `/workspace/${workspaceId}/history?${params.toString()}`
    );
    return response.data;
  },

  async clearTaskHistory(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/history`);
  },

  async clearWorkspaceHistory(workspaceId: number): Promise<void> {
    await api.delete(`/workspace/${workspaceId}/history`);
  },
};
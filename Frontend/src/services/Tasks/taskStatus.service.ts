import api from "../api";
import type { ITaskStatus } from "../../types/task.types";

export interface ICreateTaskStatusRequest {
  name: string;
  color: string;
  workspaceId: number;
}

export interface IUpdateTaskStatusRequest {
  id: number;
  name?: string;
  color?: string;
  order?: number;
}

class TaskStatusService {
  async getStatusesForWorkspace(
    workspaceId: string | number
  ): Promise<ITaskStatus[]> {
    const response = await api.get(`/workspaces/${workspaceId}/statuses`);
    return response.data;
  }

  async createStatus(data: ICreateTaskStatusRequest): Promise<ITaskStatus> {
    const { workspaceId, ...rest } = data;
    const response = await api.post(
      `/workspaces/${workspaceId}/statuses`,
      rest
    );
    return response.data;
  }

  async updateStatus(
    workspaceId: string | number,
    statusId: number,
    data: IUpdateTaskStatusRequest
  ): Promise<ITaskStatus> {
    const response = await api.put(
      `/workspaces/${workspaceId}/statuses/${statusId}`,
      data
    );
    return response.data;
  }

  async deleteStatus(
    workspaceId: string | number,
    statusId: number
  ): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/statuses/${statusId}`);
  }
}

export const taskStatusService = new TaskStatusService();

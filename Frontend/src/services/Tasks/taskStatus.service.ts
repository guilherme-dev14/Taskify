// Frontend/src/services/TaskStatus/taskStatus.service.ts
import api from "../api";

export interface ITaskStatus {
  id: number;
  name: string;
  color: string;
  order?: number;
}

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
  private readonly baseUrl = "/workspaces";

  async getStatusesForWorkspace(workspaceId: number): Promise<ITaskStatus[]> {
    try {
      const response = await api.get(`workspaces/${workspaceId}/statuses`);
      return response.data;
    } catch (error) {
      console.error("Error fetching statuses:", error);
      throw error;
    }
  }

  async createStatus(
    workspaceId: number,
    data: Omit<ICreateTaskStatusRequest, "workspaceId">
  ): Promise<ITaskStatus> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${workspaceId}/statuses`,
        {
          ...data,
          workspaceId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating status:", error);
      throw error;
    }
  }

  async updateStatus(
    workspaceId: number,
    statusId: number,
    data: Omit<IUpdateTaskStatusRequest, "id">
  ): Promise<ITaskStatus> {
    try {
      const response = await api.put(
        `${this.baseUrl}/${workspaceId}/statuses/${statusId}`,
        {
          ...data,
          id: statusId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }

  async deleteStatus(workspaceId: number, statusId: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${workspaceId}/statuses/${statusId}`);
    } catch (error) {
      console.error("Error deleting status:", error);
      throw error;
    }
  }

  async reorderStatuses(
    workspaceId: number,
    statuses: { id: number; order: number }[]
  ): Promise<void> {
    try {
      // Batch update the order of all statuses
      const updatePromises = statuses.map((status) =>
        this.updateStatus(workspaceId, status.id, { order: status.order })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering statuses:", error);
      throw error;
    }
  }
}

export const taskStatusService = new TaskStatusService();

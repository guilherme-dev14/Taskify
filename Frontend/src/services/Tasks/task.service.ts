import api from "../api";
import type {
  ITask,
  ITasksResponse,
  ITaskFilters,
  ICreateTaskRequest,
  IUpdateTaskRequest,
} from "../../types/task.types";

export interface IDashboardStats {
  totalTasks: number;
  toDoToday: number;
  inProgress: number;
  overdue: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completedTasksEstimatedHours: number;
  estimatedVsActualRatio: number;
}

export const taskService = {
  async getAllTasks(filters?: ITaskFilters): Promise<ITasksResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const url = `/tasks?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  async getTaskById(id: string): Promise<ITask> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async getDashboardStats(): Promise<IDashboardStats> {
    const response = await api.get("/tasks/dashboard/stats");
    return response.data;
  },

  async createTask(task: ICreateTaskRequest): Promise<ITask> {
    const formData = new FormData();

    formData.append("title", task.title);
    formData.append("description", task.description);
    formData.append("priority", task.priority);
    if (task.dueDate) {
      formData.append("dueDate", task.dueDate);
    }
    formData.append("workspaceId", task.workspaceId.toString());
    task.categoryIds.forEach((id) =>
      formData.append("categoryIds", id.toString())
    );

    if (task.statusId) {
      formData.append("statusId", task.statusId.toString());
    }

    if (task.attachments) {
      task.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.post("/tasks", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  async updateTask(id: string, updates: IUpdateTaskRequest): Promise<ITask> {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getTasksByStatus(
    statusId: string,
    workspaceId?: string,
    year?: number,
    month?: number
  ): Promise<ITask[]> {
    const params: Record<string, string> = { statusId };
    if (workspaceId) {
      params.workspaceId = workspaceId;
    }
    if (year) {
      params.year = year.toString();
    }
    if (month) {
      params.month = month.toString();
    }

    const response = await api.get(`/tasks/kanban`, { params });
    return response.data;
  },

  async getWorkspaceTasks(
    workspaceId: number,
    filters?: {
      page?: number;
      size?: number;
      sort?: string;
      direction?: "ASC" | "DESC";
      statusId?: number;
      priority?: ITask["priority"];
    }
  ): Promise<ITasksResponse> {
    const params = new URLSearchParams({
      page: (filters?.page ?? 0).toString(),
      size: (filters?.size ?? 10).toString(),
      sort: filters?.sort ?? "createdAt",
      direction: filters?.direction ?? "DESC",
    });

    if (filters?.statusId) params.append("status", filters.statusId.toString());
    if (filters?.priority) params.append("priority", filters.priority);

    const url = `/tasks/workspace/${workspaceId}?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  async getWorkspaceTasksList(
    workspaceId: number,
    filters?: {
      statusId?: number;
      priority?: ITask["priority"];
    }
  ): Promise<ITask[]> {
    const params = new URLSearchParams();
    if (filters?.statusId) params.append("status", filters.statusId.toString());
    if (filters?.priority) params.append("priority", filters.priority);

    const url = `/tasks/workspace/${workspaceId}/list?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  // Subtask Management
  async createSubtask(
    parentId: string,
    subtaskData: Omit<ICreateTaskRequest, "parentTaskId">
  ): Promise<ITask> {
    const response = await api.post(`/tasks/${parentId}/subtasks`, {
      ...subtaskData,
      parentTaskId: parentId,
    });
    return response.data;
  },

  async getSubtasks(parentId: string): Promise<ITask[]> {
    const response = await api.get(`/tasks/${parentId}/subtasks`);
    return response.data;
  },

  async getParentTask(subtaskId: string): Promise<ITask> {
    const response = await api.get(`/tasks/${subtaskId}/parent`);
    return response.data;
  },

  async convertToSubtask(taskId: string, parentId: string): Promise<void> {
    await api.put(`/tasks/${taskId}/convert-to-subtask/${parentId}`);
  },

  async promoteToMainTask(subtaskId: string): Promise<void> {
    await api.put(`/tasks/${subtaskId}/promote-to-main-task`);
  },

  // Bulk Operations
  async bulkUpdateTasks(
    taskIds: string[],
    updates: Partial<IUpdateTaskRequest>
  ): Promise<ITask[]> {
    const response = await api.put("/tasks/bulk-update", {
      taskIds,
      updates,
    });
    return response.data;
  },

  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    await api.delete("/tasks/bulk-delete", { data: taskIds });
  },

  async cloneTask(taskId: string): Promise<ITask> {
    const response = await api.post(`/tasks/${taskId}/clone`);
    return response.data;
  },

  // Calendar integration
  async getTasksForDateRange(
    startDate: string,
    endDate: string,
    workspaceId?: number,
    statusId?: number
  ): Promise<ITask[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    if (workspaceId) params.append("workspaceId", workspaceId.toString());
    if (statusId) params.append("status", statusId.toString());

    const response = await api.get(`/tasks/calendar?${params.toString()}`);
    return response.data;
  },
};

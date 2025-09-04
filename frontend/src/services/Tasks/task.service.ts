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
    console.log("🌐 API URL being called:", url);
    console.log("🔧 Params object:", Object.fromEntries(params.entries()));
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
    const response = await api.post("/tasks", task);
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
    status: string,
    workspaceId?: string
  ): Promise<ITask[]> {
    const params: Record<string, string> = { status };
    if (workspaceId) {
      params.workspaceId = workspaceId;
    }

    const response = await api.get(`/tasks/kanban`, {
      params,
    });
    return response.data;
  },

  // Workspace-wide task methods
  async getWorkspaceTasks(
    workspaceId: number,
    filters?: {
      page?: number;
      size?: number;
      sort?: string;
      direction?: 'ASC' | 'DESC';
      status?: ITask['status'];
      priority?: ITask['priority'];
    }
  ): Promise<ITasksResponse> {
    const params = new URLSearchParams({
      page: (filters?.page ?? 0).toString(),
      size: (filters?.size ?? 10).toString(),
      sort: filters?.sort ?? 'createdAt',
      direction: filters?.direction ?? 'DESC'
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const url = `/tasks/workspace/${workspaceId}?${params.toString()}`;
    console.log("🌐 Workspace tasks API URL:", url);
    const response = await api.get(url);
    return response.data;
  },

  async getWorkspaceTasksList(
    workspaceId: number,
    filters?: {
      status?: ITask['status'];
      priority?: ITask['priority'];
    }
  ): Promise<ITask[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const url = `/tasks/workspace/${workspaceId}/list?${params.toString()}`;
    console.log("🌐 Workspace tasks list API URL:", url);
    const response = await api.get(url);
    return response.data;
  },
};

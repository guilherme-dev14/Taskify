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
  async getTasks(filters?: ITaskFilters): Promise<ITasksResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/task?${params.toString()}`);
    return response.data;
  },

  async getTaskById(id: string): Promise<ITask> {
    const response = await api.get(`/task/${id}`);
    return response.data;
  },

  async getDashboardStats(): Promise<IDashboardStats> {
    const response = await api.get("/task/dashboard/stats");
    return response.data;
  },

  async createTask(task: ICreateTaskRequest): Promise<ITask> {
    const response = await api.post("/task", task);
    return response.data;
  },

  async updateTask(id: string, updates: IUpdateTaskRequest): Promise<ITask> {
    const response = await api.put(`/task/${id}`, updates);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/task/${id}`);
  },
};

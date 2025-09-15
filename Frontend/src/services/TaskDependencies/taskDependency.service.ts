import api from "../api";
import type { ITask } from "../../types/task.types";

export interface ITaskDependency {
  id: string;
  dependentTask: ITask;
  dependsOnTask: ITask;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ICreateTaskDependencyRequest {
  dependentTaskId: string;
  dependsOnTaskId: string;
}

export const taskDependencyService = {
  async createTaskDependency(
    data: ICreateTaskDependencyRequest
  ): Promise<ITaskDependency> {
    const response = await api.post("/task-dependencies", data);
    return response.data;
  },

  async getTaskDependencies(taskId: string): Promise<ITaskDependency[]> {
    const response = await api.get(`/task-dependencies/task/${taskId}/dependencies`);
    return response.data;
  },

  async getTasksDependingOn(taskId: string): Promise<ITaskDependency[]> {
    const response = await api.get(`/task-dependencies/task/${taskId}/dependent-tasks`);
    return response.data;
  },

  async removeTaskDependency(dependencyId: string): Promise<void> {
    await api.delete(`/task-dependencies/${dependencyId}`);
  },

  async canStartTask(taskId: string): Promise<boolean> {
    const response = await api.get(`/task-dependencies/task/${taskId}/can-start`);
    return response.data;
  },

  async getBlockingTasks(taskId: string): Promise<ITask[]> {
    const response = await api.get(`/task-dependencies/task/${taskId}/blocking-tasks`);
    return response.data;
  },
};
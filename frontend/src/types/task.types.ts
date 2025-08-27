export interface ITask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "completed" | "overdue";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  assigneeId?: string;
  createdById: string;
  categories: string[];
}

export interface ICreateTaskRequest {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  workspaceId: number;
  assigneeId?: number;
  categoryIds: number[];
}

export interface IUpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  assigneeId?: string;
  categories?: string[];
}

export interface ITaskFilters {
  workspaceId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ITasksResponse {
  tasks: ITask[];
  total: number;
  page: number;
  totalPages: number;
}

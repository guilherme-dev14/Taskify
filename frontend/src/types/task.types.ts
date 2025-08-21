export interface ITask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  assigneeId?: string;
  createdById: string;
  tags: string[];
  attachments?: ITaskAttachment[];
}

export interface ITaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ICreateTaskRequest {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  workspaceId: string;
  assigneeId?: string;
  tags: string[];
}

export interface IUpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
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
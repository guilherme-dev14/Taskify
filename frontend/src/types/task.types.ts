export interface ITask {
  id: string;
  title: string;
  description: string;
  notes?: string;
  status: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  categories: string[];
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  attachments?: {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    contentType: string;
    uploadedAt: string;
  }[];
}

export interface ICreateTaskRequest {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  workspaceId: number;
  assigneeId?: number;
  categoryIds: number[];
  status?: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  attachments?: File[];
}

export interface IUpdateTaskRequest {
  title?: string;
  description?: string;
  notes?: string;
  status?: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  assignedToId?: number | null;
  categoryIds?: number[];
}
export interface ITaskFilters {
  page: number;
  size: number;
  workspaceId?: number;
  status?: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sortBy: "createdAt" | "updatedAt";
  sortDir: "asc" | "desc";
}

export interface ITasksResponse {
  content: ITask[];
  totalElements: number;
  page: number;
  totalPages: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

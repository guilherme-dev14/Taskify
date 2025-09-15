export interface ITask {
  id: string;
  title: string;
  description: string;
  notes?: string;
  status: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  workspace: { id: number; name: string };
  categories: string[];
  assignedTo?: {
    id: number;
    username: string;
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
  checklist?: {
    id: number;
    text: string;
    completed: boolean;
    orderIndex: number;
    assignee?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    dueDate?: string;
  }[];
}

export interface ICreateTaskRequest {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  estimatedHours?: number;
  actualHours?: number;
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
  estimatedHours?: number | null;
  actualHours?: number | null;
  workspaceId?: number | null;
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

export interface ITaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type:
    | "FINISH_TO_START"
    | "START_TO_START"
    | "FINISH_TO_FINISH"
    | "START_TO_FINISH";
  dependentTask: {
    id: string;
    title: string;
    status: string;
  };
}

export interface ITimeTracking {
  id: string;
  task: {
    id: string;
    title: string;
    status: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  };
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  formattedDuration: string;
  currentDuration: number;
}

export interface ITimeTrackingSummary {
  totalMinutes: number;
  formattedTotalTime: string;
  sessionsCount: number;
  activeSessionsCount: number;
}

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  assigneeId?: string;
  dueDate?: string;
}

export interface ITaskTemplate {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  defaultEstimatedHours?: number;
  defaultTags?: string[];
  defaultChecklist?: Omit<IChecklistItem, "id" | "completed">[];
  categoryIds?: number[];
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSubtaskRequest {
  parentTaskId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeId?: number;
}

export interface ICreateDependencyRequest {
  taskId: string;
  dependsOnTaskId: string;
  type:
    | "FINISH_TO_START"
    | "START_TO_START"
    | "FINISH_TO_FINISH"
    | "START_TO_FINISH";
}

export interface ITimeTrackingRequest {
  taskId: number;
  description?: string;
}

export interface IBulkTaskOperationRequest {
  taskIds: number[];
  status?: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedToId?: number;
  categoryIds?: number[];
}

export interface IUpdateChecklistRequest {
  items: Array<{
    id?: string;
    text: string;
    completed: boolean;
    order: number;
    assigneeId?: string;
    dueDate?: string;
  }>;
}

export interface ITaskFromTemplateRequest {
  templateId: string;
  title?: string;
  description?: string;
  dueDate?: string;
  assigneeId?: number;
  workspaceId: number;
  customFields?: Record<string, unknown>;
}

export interface IAdvancedTaskFilters extends ITaskFilters {
  assigneeId?: number;
  parentTaskId?: string;
  hasSubtasks?: boolean;
  tags?: string[];
  estimatedHoursMin?: number;
  estimatedHoursMax?: number;
  progressMin?: number;
  progressMax?: number;
  templateId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdBy?: number;
}

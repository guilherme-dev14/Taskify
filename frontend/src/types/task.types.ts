import { IUserSummary } from './user.types';

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
  assignedTo?: IUserSummary;
  parentTaskId?: string;
  subtasks?: ITask[];
  dependencies?: ITaskDependency[];
  timeTracking?: ITimeTracking;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  progress?: number; // 0-100
  templateId?: string;
  checklist?: IChecklistItem[];
  customFields?: Record<string, any>;
  attachmentCount?: number;
  commentCount?: number;
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

// Advanced task feature interfaces
export interface ITaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'FINISH_TO_START' | 'START_TO_START' | 'FINISH_TO_FINISH' | 'START_TO_FINISH';
  dependentTask: {
    id: string;
    title: string;
    status: string;
  };
}

export interface ITimeTracking {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  description?: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
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
  defaultChecklist?: Omit<IChecklistItem, 'id' | 'completed'>[];
  categoryIds?: number[];
  customFields?: Record<string, any>;
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
  type: 'FINISH_TO_START' | 'START_TO_START' | 'FINISH_TO_FINISH' | 'START_TO_FINISH';
}

export interface ITimeTrackingRequest {
  taskId: string;
  description?: string;
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
  customFields?: Record<string, any>;
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

import api from '../api';
import { 
  type ITask,
  type ITaskDependency,
  type ITimeTracking,
  type ITaskTemplate,
  type ICreateSubtaskRequest,
  type ICreateDependencyRequest,
  type ITimeTrackingRequest,
  type IUpdateChecklistRequest,
  type ITaskFromTemplateRequest,
  type IAdvancedTaskFilters,
  type ITasksResponse
} from '../../types/task.types';

export const advancedTaskService = {
  // Subtask management
  createSubtask: async (request: ICreateSubtaskRequest): Promise<ITask> => {
    const response = await api.post('/tasks/subtask', request);
    return response.data;
  },

  getSubtasks: async (parentTaskId: string): Promise<ITask[]> => {
    const response = await api.get(`/tasks/${parentTaskId}/subtasks`);
    return response.data;
  },

  convertToSubtask: async (taskId: string, parentTaskId: string): Promise<ITask> => {
    const response = await api.patch(`/tasks/${taskId}/convert-to-subtask`, {
      parentTaskId
    });
    return response.data;
  },

  convertToMainTask: async (taskId: string): Promise<ITask> => {
    const response = await api.patch(`/tasks/${taskId}/convert-to-main-task`);
    return response.data;
  },

  // Task dependencies
  createDependency: async (request: ICreateDependencyRequest): Promise<ITaskDependency> => {
    const response = await api.post('/tasks/dependencies', request);
    return response.data;
  },

  getDependencies: async (taskId: string): Promise<ITaskDependency[]> => {
    const response = await api.get(`/tasks/${taskId}/dependencies`);
    return response.data;
  },

  removeDependency: async (dependencyId: string): Promise<void> => {
    await api.delete(`/tasks/dependencies/${dependencyId}`);
  },

  getBlockedTasks: async (taskId: string): Promise<ITask[]> => {
    const response = await api.get(`/tasks/${taskId}/blocked-tasks`);
    return response.data;
  },

  // Time tracking
  startTimeTracking: async (request: ITimeTrackingRequest): Promise<ITimeTracking> => {
    const response = await api.post('/tasks/time-tracking/start', request);
    return response.data;
  },

  stopTimeTracking: async (timeTrackingId: string): Promise<ITimeTracking> => {
    const response = await api.patch(`/tasks/time-tracking/${timeTrackingId}/stop`);
    return response.data;
  },

  getTimeTrackingEntries: async (taskId: string): Promise<ITimeTracking[]> => {
    const response = await api.get(`/tasks/${taskId}/time-tracking`);
    return response.data;
  },

  updateTimeTracking: async (
    timeTrackingId: string, 
    updates: Partial<Omit<ITimeTracking, 'id' | 'userId' | 'user'>>
  ): Promise<ITimeTracking> => {
    const response = await api.patch(`/tasks/time-tracking/${timeTrackingId}`, updates);
    return response.data;
  },

  deleteTimeTracking: async (timeTrackingId: string): Promise<void> => {
    await api.delete(`/tasks/time-tracking/${timeTrackingId}`);
  },

  getTotalTimeSpent: async (taskId: string): Promise<number> => {
    const response = await api.get(`/tasks/${taskId}/total-time`);
    return response.data.totalMinutes;
  },

  // Checklist management
  updateChecklist: async (taskId: string, request: IUpdateChecklistRequest): Promise<ITask> => {
    const response = await api.patch(`/tasks/${taskId}/checklist`, request);
    return response.data;
  },

  // Task templates
  createTemplate: async (template: Omit<ITaskTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITaskTemplate> => {
    const response = await api.post('/tasks/templates', template);
    return response.data;
  },

  getTemplates: async (workspaceId: string): Promise<ITaskTemplate[]> => {
    const response = await api.get(`/tasks/templates?workspaceId=${workspaceId}`);
    return response.data;
  },

  getTemplate: async (templateId: string): Promise<ITaskTemplate> => {
    const response = await api.get(`/tasks/templates/${templateId}`);
    return response.data;
  },

  updateTemplate: async (templateId: string, updates: Partial<ITaskTemplate>): Promise<ITaskTemplate> => {
    const response = await api.patch(`/tasks/templates/${templateId}`, updates);
    return response.data;
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    await api.delete(`/tasks/templates/${templateId}`);
  },

  createTaskFromTemplate: async (request: ITaskFromTemplateRequest): Promise<ITask> => {
    const response = await api.post('/tasks/from-template', request);
    return response.data;
  },

  // Advanced search and filtering
  searchTasks: async (filters: IAdvancedTaskFilters): Promise<ITasksResponse> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      size: filters.size.toString(),
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    });

    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && key !== 'page' && key !== 'size' && key !== 'sortBy' && key !== 'sortDir') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/tasks/advanced-search?${params.toString()}`);
    return response.data;
  },

  // Progress tracking
  updateProgress: async (taskId: string, progress: number): Promise<ITask> => {
    const response = await api.patch(`/tasks/${taskId}/progress`, { progress });
    return response.data;
  },

  // Task linking and relationships
  linkTasks: async (taskId: string, relatedTaskId: string, relationshipType: string): Promise<void> => {
    await api.post('/tasks/link', {
      taskId,
      relatedTaskId,
      relationshipType
    });
  },

  unlinkTasks: async (taskId: string, relatedTaskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/unlink/${relatedTaskId}`);
  },

  getRelatedTasks: async (taskId: string): Promise<ITask[]> => {
    const response = await api.get(`/tasks/${taskId}/related`);
    return response.data;
  },

  // Bulk operations
  bulkUpdateTasks: async (taskIds: string[], updates: Partial<ITask>): Promise<ITask[]> => {
    const response = await api.patch('/tasks/bulk-update', {
      taskIds,
      updates
    });
    return response.data;
  },

  bulkDeleteTasks: async (taskIds: string[]): Promise<void> => {
    await api.delete('/tasks/bulk-delete', {
      data: { taskIds }
    });
  },

  // Estimates and actuals
  updateEstimate: async (taskId: string, estimatedHours: number): Promise<ITask> => {
    const response = await api.patch(`/tasks/${taskId}/estimate`, { estimatedHours });
    return response.data;
  },

  // Tags management
  addTag: async (taskId: string, tag: string): Promise<ITask> => {
    const response = await api.post(`/tasks/${taskId}/tags`, { tag });
    return response.data;
  },

  removeTag: async (taskId: string, tag: string): Promise<ITask> => {
    const response = await api.delete(`/tasks/${taskId}/tags/${encodeURIComponent(tag)}`);
    return response.data;
  },

  getPopularTags: async (workspaceId: string): Promise<string[]> => {
    const response = await api.get(`/tasks/tags/popular?workspaceId=${workspaceId}`);
    return response.data;
  },

  // Custom fields
  updateCustomFields: async (taskId: string, customFields: Record<string, any>): Promise<ITask> => {
    const response = await api.patch(`/tasks/${taskId}/custom-fields`, { customFields });
    return response.data;
  }
};
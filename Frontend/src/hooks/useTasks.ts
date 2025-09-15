/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useTaskStore,
  type TaskFilters,
  type Task,
} from "../stores/task.store";
import { useWebSocketEvent } from "./useWebSocket";
import api from "../services/api";

const taskAPI = {
  getTasks: async (filters: TaskFilters = {}, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (filters.workspaceId)
      params.append("workspaceId", filters.workspaceId.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.assignedTo)
      params.append("assignedTo", filters.assignedTo.toString());
    if (filters.search) params.append("search", filters.search);
    params.append("page", page.toString());
    params.append("size", size.toString());

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    const response = await api.post(`/tasks`, task);
    return response.data;
  },

  updateTask: async (id: number, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  bulkUpdateTasks: async (
    taskIds: number[],
    updates: Partial<Task>
  ): Promise<Task[]> => {
    const response = await api.put(`/tasks/bulk-update`, {
      taskIds,
      updates,
    });
    return response.data;
  },

  bulkDeleteTasks: async (taskIds: number[]): Promise<void> => {
    await api.delete(`/tasks/bulk-delete`, {
      data: taskIds,
    });
  },

  getDashboardStats: async () => {
    const response = await api.get(`/tasks/dashboard/stats`);
    return response.data;
  },

  getKanbanTasks: async (workspaceId: number) => {
    const response = await api.get(`/tasks/workspace/${workspaceId}/list`);
    return response.data;
  },

  cloneTask: async (id: number): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/clone`);
    return response.data;
  },

  createSubtask: async (
    parentId: number,
    subtask: Partial<Task>
  ): Promise<Task> => {
    const response = await api.post(`/tasks/${parentId}/subtasks`, subtask);
    return response.data;
  },

  getSubtasks: async (parentId: number): Promise<Task[]> => {
    const response = await api.get(`/tasks/${parentId}/subtasks`);
    return response.data;
  },

  convertToSubtask: async (taskId: number, parentId: number): Promise<void> => {
    await api.put(`/tasks/${taskId}/convert-to-subtask/${parentId}`);
  },

  promoteToMainTask: async (subtaskId: number): Promise<void> => {
    await api.put(`/tasks/${subtaskId}/promote-to-main-task`);
  },
};

export const useTasks = (filters: TaskFilters = {}, options = {}) => {
  const { setTasks, setLoading, setError } = useTaskStore();

  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await taskAPI.getTasks(filters);
        setTasks(data.content || data);

        // WebSocket subscription handled in components

        return data;
      } catch (error: any) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useTask = (id: number, options = {}) => {
  const { setCurrentTask } = useTaskStore();

  useWebSocketEvent(
    "task:updated",
    (updatedTask: any) => {
      if (updatedTask.id === id) {
        setCurrentTask(updatedTask as Task);
      }
    },
    [id]
  );

  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const task = await taskAPI.getTask(id);
      setCurrentTask(task);
      return task;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  return useMutation({
    mutationFn: taskAPI.createTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const optimisticTask = {
        ...newTask,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
      } as Task;

      addTask(optimisticTask);

      return { optimisticTask };
    },
    onSuccess: (createdTask, _variables, context) => {
      const { addTask, removeTask } = useTaskStore.getState();
      if (context?.optimisticTask) {
        removeTask(context.optimisticTask.id);
      }
      addTask(createdTask);

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (_error, _variables, context) => {
      if (context?.optimisticTask) {
        const { removeTask } = useTaskStore.getState();
        removeTask(context.optimisticTask.id);
      }
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { updateTask, optimisticUpdate, revertOptimisticUpdate } =
    useTaskStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) =>
      taskAPI.updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["task", id] });

      const previousTask = queryClient.getQueryData<Task>(["task", id]);

      optimisticUpdate(id, updates);

      return { previousTask };
    },
    onSuccess: (updatedTask) => {
      updateTask(updatedTask.id, updatedTask);
      queryClient.setQueryData(["task", updatedTask.id], updatedTask);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (_error, { id }, context) => {
      if (context?.previousTask) {
        revertOptimisticUpdate(id, context.previousTask);
        queryClient.setQueryData(["task", id], context.previousTask);
      }
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { removeTask } = useTaskStore();

  return useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: (_, taskId) => {
      removeTask(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useTaskStore();

  return useMutation({
    mutationFn: ({
      taskIds,
      updates,
    }: {
      taskIds: number[];
      updates: Partial<Task>;
    }) => taskAPI.bulkUpdateTasks(taskIds, updates),
    onSuccess: (updatedTasks) => {
      updatedTasks.forEach((task) => updateTask(task.id, task));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();
  const { removeTask } = useTaskStore();

  return useMutation({
    mutationFn: taskAPI.bulkDeleteTasks,
    onSuccess: (_, taskIds) => {
      taskIds.forEach((id) => removeTask(Number(id)));
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useDashboardStats = () => {
  const { setStats } = useTaskStore();

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const stats = await taskAPI.getDashboardStats();
      setStats(stats);
      return stats;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
};

export const useKanbanTasks = (workspaceId: number) => {
  useWebSocketEvent("task:created", () => {});

  useWebSocketEvent("task:updated", () => {});

  useWebSocketEvent("task:deleted", () => {});

  return useQuery({
    queryKey: ["kanban-tasks", workspaceId],
    queryFn: async () => {
      const tasks = await taskAPI.getKanbanTasks(workspaceId);
      return tasks;
    },
    enabled: !!workspaceId,
    staleTime: 30 * 1000,
  });
};

export const useCloneTask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  return useMutation({
    mutationFn: taskAPI.cloneTask,
    onSuccess: (clonedTask) => {
      addTask(clonedTask);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useSubtasks = (parentId: number) => {
  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: () => taskAPI.getSubtasks(parentId),
    enabled: !!parentId,
  });
};

export const useCreateSubtask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  return useMutation({
    mutationFn: ({
      parentId,
      subtask,
    }: {
      parentId: number;
      subtask: Partial<Task>;
    }) => taskAPI.createSubtask(parentId, subtask),
    onSuccess: (newSubtask, { parentId }) => {
      addTask(newSubtask);
      queryClient.invalidateQueries({ queryKey: ["subtasks", parentId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

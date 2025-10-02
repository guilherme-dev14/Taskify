import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ITaskStatus } from "../types/task.types";

export interface Task {
  comments: string;
  id: number;
  title: string;
  description?: string;
  notes?: string;
  status: ITaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  completionPercentage?: number;
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  workspace: {
    id: number;
    name: string;
  };
  categories: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  tags: string[];
  parentTask?: {
    id: number;
    title: string;
  };
  subtasks: Task[];
  dependencies: Array<{
    id: string;
    dependsOnTask: {
      id: number;
      title: string;
      status: string;
    };
  }>;
  checklist: Array<{
    id: string;
    title: string;
    completed: boolean;
    orderIndex: number;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
  }>;
  timeTrackingEntries: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    isActive: boolean;
  }>;
}

export interface TaskFilters {
  workspaceId?: number;
  status?: Task["status"];
  priority?: Task["priority"];
  assignedTo?: number;
  dueDate?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  search?: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<Task["priority"], number>;
  averageCompletionTime: number;
  productivityTrend: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
}

interface TaskState {
  tasks: Task[];
  selectedTasks: number[];
  currentTask: Task | null;
  filters: TaskFilters;
  viewType: "list" | "kanban" | "calendar" | "tree";
  sortBy:
    | "createdAt"
    | "updatedAt"
    | "dueDate"
    | "priority"
    | "status"
    | "title";
  sortOrder: "asc" | "desc";
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  stats: TaskStats | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  removeTask: (id: number) => void;
  setCurrentTask: (task: Task | null) => void;
  setSelectedTasks: (taskIds: number[]) => void;
  toggleTaskSelection: (taskId: number) => void;
  clearSelectedTasks: () => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setViewType: (viewType: TaskState["viewType"]) => void;
  setSorting: (
    sortBy: TaskState["sortBy"],
    sortOrder: TaskState["sortOrder"]
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStats: (stats: TaskStats) => void;
  optimisticUpdate: (id: number, updates: Partial<Task>) => void;
  revertOptimisticUpdate: (id: number, originalTask: Task) => void;

  handleTaskUpdate: (updatedTask: Task) => void;
  handleTaskDeleted: (taskId: number) => void;
  handleTaskCreated: (newTask: Task) => void;

  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: Task["status"]) => Task[];
  getOverdueTasks: () => Task[];
  getTasksByPriority: (priority: Task["priority"]) => Task[];
  getSubtasks: (parentId: number) => Task[];
  getTaskDependencies: (taskId: number) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTasks: [],
      currentTask: null,
      filters: {},
      viewType: "list",
      sortBy: "createdAt",
      sortOrder: "desc",
      isLoading: false,
      error: null,
      lastUpdated: null,
      stats: null,

      setTasks: (tasks) =>
        set({
          tasks,
          lastUpdated: new Date().toISOString(),
          error: null,
        }),

      addTask: (task) =>
        set((state) => ({
          tasks: [task, ...state.tasks],
          lastUpdated: new Date().toISOString(),
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
          currentTask:
            state.currentTask?.id === id
              ? { ...state.currentTask, ...updates }
              : state.currentTask,
          lastUpdated: new Date().toISOString(),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          selectedTasks: state.selectedTasks.filter((taskId) => taskId !== id),
          currentTask: state.currentTask?.id === id ? null : state.currentTask,
          lastUpdated: new Date().toISOString(),
        })),

      setCurrentTask: (task) => set({ currentTask: task }),

      setSelectedTasks: (taskIds) => set({ selectedTasks: taskIds }),

      toggleTaskSelection: (taskId) =>
        set((state) => ({
          selectedTasks: state.selectedTasks.includes(taskId)
            ? state.selectedTasks.filter((id) => id !== taskId)
            : [...state.selectedTasks, taskId],
        })),

      clearSelectedTasks: () => set({ selectedTasks: [] }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () => set({ filters: {} }),

      setViewType: (viewType) => set({ viewType }),

      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setStats: (stats) => set({ stats }),

      optimisticUpdate: (id, updates) => get().updateTask(id, updates),

      revertOptimisticUpdate: (id, originalTask) =>
        get().updateTask(id, originalTask),

      handleTaskUpdate: (updatedTask) =>
        get().updateTask(updatedTask.id, updatedTask),

      handleTaskDeleted: (taskId) => get().removeTask(taskId),

      handleTaskCreated: (newTask) => get().addTask(newTask),

      getFilteredTasks: () => {
        const { tasks, filters, sortBy, sortOrder } = get();
        let filtered = [...tasks];

        if (filters.workspaceId) {
          filtered = filtered.filter(
            (task) => task.workspace.id === filters.workspaceId
          );
        }
        if (filters.status) {
          filtered = filtered.filter((task) => task.status === filters.status);
        }
        if (filters.priority) {
          filtered = filtered.filter(
            (task) => task.priority === filters.priority
          );
        }
        if (filters.assignedTo) {
          filtered = filtered.filter(
            (task) => task.assignedTo?.id === filters.assignedTo
          );
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (task) =>
              task.title.toLowerCase().includes(search) ||
              task.description?.toLowerCase().includes(search) ||
              task.tags.some((tag) => tag.toLowerCase().includes(search))
          );
        }
        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter((task) =>
            filters.tags!.some((tag) => task.tags.includes(tag))
          );
        }
        if (filters.dueDate?.start) {
          filtered = filtered.filter(
            (task) => task.dueDate && task.dueDate >= filters.dueDate!.start!
          );
        }
        if (filters.dueDate?.end) {
          filtered = filtered.filter(
            (task) => task.dueDate && task.dueDate <= filters.dueDate!.end!
          );
        }

        filtered.sort((a, b) => {
          let aValue: string | ITaskStatus | undefined = a[sortBy];
          let bValue: string | ITaskStatus | undefined = b[sortBy];

          if (sortBy === "priority") {
            const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
          }

          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return sortOrder === "asc" ? 1 : -1;
          if (bValue === undefined) return sortOrder === "asc" ? -1 : 1;
          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

        return filtered;
      },

      getTasksByStatus: (status) =>
        get().tasks.filter((task) => task.status === status),

      getOverdueTasks: () => {
        const now = new Date().toISOString();
        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.dueDate < now &&
            task.status.name !== "COMPLETED" &&
            task.status.name !== "CANCELLED"
        );
      },

      getTasksByPriority: (priority) =>
        get().tasks.filter((task) => task.priority === priority),

      getSubtasks: (parentId) =>
        get().tasks.filter((task) => task.parentTask?.id === parentId),

      getTaskDependencies: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return [];

        return task.dependencies
          .map((dep) => get().tasks.find((t) => t.id === dep.dependsOnTask.id))
          .filter(Boolean) as Task[];
      },
    }),
    {
      name: "task-store",
      partialize: (state) => ({
        filters: state.filters,
        viewType: state.viewType,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

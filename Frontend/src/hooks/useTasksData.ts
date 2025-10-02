/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { taskService } from "../services/Tasks/task.service";
import { workspaceService } from "../services/Workspace/workspace.service";
import { getOperationErrorInfo } from "../utils/errorHandler";
import type { ITask, ITaskFilters, ITasksResponse } from "../types/task.types";
import type { IWorkspaceName } from "../types/workspace.types";
import type { ErrorInfo } from "../utils/errorHandler";

type WorkspaceOption = IWorkspaceName & { color?: string };

export function useTasksData() {
  const [tasksResponse, setTasksResponse] = useState<ITasksResponse | null>(
    null
  );
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState<string | number>(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadTasks();
  }, [currentPage, selectedWorkspace, statusFilter, priorityFilter, debouncedSearchTerm]);

  const loadWorkspaces = async () => {
    try {
      const workspacesData = await workspaceService.getWorkspacesFromUserList();
      const allWorkspaceOption: WorkspaceOption = {
        id: "all",
        name: "All Tasks",
        color: "gray",
      };
      const coloredWorkspaces = workspacesData.map((ws) => ({
        ...ws,
        color: "blue",
      }));
      setWorkspaces([allWorkspaceOption, ...coloredWorkspaces]);
    } catch (error) {
      setErrorInfo(getOperationErrorInfo("load", error));
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setErrorInfo(null);

      const filters: Partial<ITaskFilters> = {
        page: currentPage - 1,
        size: 6,
        workspaceId:
          selectedWorkspace !== "all" ? Number(selectedWorkspace) : undefined,
        statusId: statusFilter !== "all" ? Number(statusFilter) : undefined,
        priority:
          priorityFilter !== "all"
            ? (priorityFilter as ITask["priority"])
            : undefined,
      };

      // If a specific workspace is selected, fetch tasks from that workspace
      // Otherwise, fetch all tasks from all user workspaces
      const response = filters.workspaceId
        ? await taskService.getWorkspaceTasks(filters.workspaceId, {
            page: filters.page,
            size: filters.size,
            statusId: filters.statusId,
            priority: filters.priority,
          })
        : await taskService.getAllTasks(filters as ITaskFilters);

      setTasksResponse(response);
    } catch (error) {
      setErrorInfo(getOperationErrorInfo("load", error));
      setTasksResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const allTasks = tasksResponse?.content || [];
    if (!debouncedSearchTerm) {
      return allTasks;
    }
    const search = debouncedSearchTerm.toLowerCase();
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
    );
  }, [tasksResponse, debouncedSearchTerm]);

  return {
    tasks: filteredTasks,
    workspaces,
    isLoading,
    errorInfo,
    setErrorInfo,
    currentPage,
    setCurrentPage,
    totalPages: tasksResponse?.totalPages ?? 1,
    selectedWorkspace,
    setSelectedWorkspace,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    loadTasks,
    loadWorkspaces,
  };
}

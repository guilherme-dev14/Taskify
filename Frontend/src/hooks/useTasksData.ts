/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { taskService } from "../services/Tasks/task.service";
import { workspaceService } from "../services/Workspace/workspace.service";
import { getOperationErrorInfo } from "../utils/errorHandler";
import type { ITaskFilters, ITasksResponse } from "../types/task.types";
import type { IWorkspaceName } from "../types/workspace.types";
import type { ErrorInfo } from "../utils/errorHandler";

// Define um tipo para as opções de workspace, incluindo "All Tasks"
type WorkspaceOption = IWorkspaceName & { color?: string };

export function useTasksData() {
  const [tasksResponse, setTasksResponse] = useState<ITasksResponse | null>(
    null
  );
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  // Estados para filtros
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | number>(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Efeito para carregar os workspaces uma vez
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Efeito para debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efeito para recarregar as tarefas quando os filtros ou a página mudam
  useEffect(() => {
    loadTasks();
  }, [
    selectedWorkspace,
    currentPage,
    statusFilter,
    priorityFilter,
    debouncedSearchTerm,
  ]);

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

      const workspaceIdValue =
        selectedWorkspace !== "all" ? Number(selectedWorkspace) : undefined;

      // Monta os filtros para a API
      const filters: Partial<ITaskFilters> = {
        page: currentPage - 1,
        size: 6,
        workspaceId: workspaceIdValue,
        sortBy: "createdAt",
        sortDir: "desc",
        // Adicionaremos busca e outros filtros aqui quando a API suportar
      };

      const response = await taskService.getAllTasks(filters as ITaskFilters);

      setTasksResponse(response);
    } catch (error) {
      setErrorInfo(getOperationErrorInfo("load", error));
      setTasksResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra as tarefas no lado do cliente com base no que a API já retornou
  const filteredTasks = useMemo(() => {
    const tasks = tasksResponse?.content || [];
    // A API já deve estar fazendo o filtro principal.
    // Podemos adicionar filtros de cliente adicionais se necessário.
    return tasks;
  }, [tasksResponse]);

  return {
    // Estado e Setters
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
    // Funções
    loadTasks,
    loadWorkspaces,
  };
}

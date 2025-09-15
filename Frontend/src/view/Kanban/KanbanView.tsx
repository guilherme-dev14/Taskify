import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { ICreateTaskRequest, ITask } from "../../types/task.types";
import type { IWorkspaceName } from "../../types/workspace.types";
import { taskService } from "../../services/Tasks/task.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { NewTaskModal } from "../../components/Modals/NewTask";
import { formatDate } from "../../utils/dateUtils";

interface Column {
  id: string;
  title: string;
  tasks: ITask[];
  color: string;
}

interface WorkspaceOption extends IWorkspaceName {
  id: number | string; // Permitir 'all' como ID
}

const initialColumns: Column[] = [
  { id: "NEW", title: "New", color: "blue", tasks: [] },
  { id: "IN_PROGRESS", title: "In Progress", color: "yellow", tasks: [] },
  { id: "COMPLETED", title: "Completed", color: "green", tasks: [] },
  { id: "CANCELLED", title: "Cancelled", color: "red", tasks: [] },
];

const KanbanView: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [draggedTask, setDraggedTask] = useState<ITask | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<number | undefined>(
    undefined
  );
  const [modalColumnStatus, setModalColumnStatus] = useState<string>("NEW");
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadWorkspaces = useCallback(async () => {
    try {
      const userWorkspaces = await workspaceService.getWorkspacesFromUserList();
      setWorkspaces([{ id: "all", name: "All Workspaces" }, ...userWorkspaces]);
    } catch (error) {
      console.error("Error loading workspaces:", error);
      setWorkspaces([{ id: "all", name: "All Workspaces" }]);
    }
  }, []);

  const handleCreateTask = async (taskData: ICreateTaskRequest) => {
    try {
      await taskService.createTask(taskData);
      loadAllTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleOpenNewTaskModal = (columnStatus: string) => {
    const currentWorkspaceId =
      selectedWorkspace !== "all" ? Number(selectedWorkspace) : undefined;
    setModalWorkspaceId(currentWorkspaceId);
    setModalColumnStatus(columnStatus);
    setIsNewTaskModalOpen(true);
  };

  const handleCloseNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
    setModalWorkspaceId(undefined);
    setModalColumnStatus("NEW");
  };

  const loadTasksForColumn = async (
    status: string,
    workspaceId?: string,
    year?: number,
    month?: number
  ) => {
    try {
      const tasks = await taskService.getTasksByStatus(
        status,
        workspaceId,
        year,
        month
      );
      return tasks;
    } catch (error) {
      console.error(`Error loading tasks for status ${status}:`, error);
      return [];
    }
  };

  const loadAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const workspaceIdToUse =
        selectedWorkspace === "all" ? undefined : selectedWorkspace;
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [newTasks, inProgressTasks, completedTasks, cancelledTasks] =
        await Promise.all([
          loadTasksForColumn("NEW", workspaceIdToUse, year, month),
          loadTasksForColumn("IN_PROGRESS", workspaceIdToUse, year, month),
          loadTasksForColumn("COMPLETED", workspaceIdToUse, year, month),
          loadTasksForColumn("CANCELLED", workspaceIdToUse, year, month),
        ]);

      setColumns([
        { ...initialColumns[0], tasks: newTasks },
        { ...initialColumns[1], tasks: inProgressTasks },
        { ...initialColumns[2], tasks: completedTasks },
        { ...initialColumns[3], tasks: cancelledTasks },
      ]);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace, currentDate]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    loadAllTasks();
  }, [loadAllTasks]);

  const getPriorityColor = (priority: ITask["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "MEDIUM":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      case "LOW":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  const getPriorityBadgeColor = (priority: ITask["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getColumnHeaderColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300";
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300";
      case "green":
        return "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300";
      case "red":
        return "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    }
  };

  const handleDragStart = (task: ITask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.status === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const previousColumns = columns;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
      }));

      const targetColumn = newColumns.find((col) => col.id === targetColumnId);

      if (targetColumn) {
        const updatedTask = {
          ...draggedTask,
          status: targetColumnId as ITask["status"],
        };
        targetColumn.tasks.push(updatedTask);
      }
      return newColumns;
    });

    setDraggedTask(null);

    try {
      await taskService.updateTask(draggedTask.id, {
        status: targetColumnId as ITask["status"],
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      setColumns(previousColumns);
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + direction,
        1
      );
      return newDate;
    });
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Kanban Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize e gira o seu fluxo de trabalho com drag and drop
          </p>
        </motion.div>

        {/* Barra de Filtros e Navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Navegador de Mês */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white w-48 text-center">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Filtro de Workspace e Pesquisa */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Seletor de Workspace */}
            <div className="relative w-full sm:w-56">
              <button
                onClick={() =>
                  setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
                }
                className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {workspaces?.find(
                      (w) => w.id.toString() === selectedWorkspace
                    )?.name || "Select Workspace"}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    isWorkspaceDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {isWorkspaceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {workspaces?.map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          setSelectedWorkspace(workspace.id.toString());
                          setIsWorkspaceDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {workspace.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pesquisa */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Estado de Carregamento */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">
                A carregar tarefas...
              </p>
            </div>
          </motion.div>
        ) : (
          /* Kanban Board */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-6 overflow-x-auto pb-6"
          >
            {filteredColumns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Cabeçalho da Coluna */}
                <div
                  className={`rounded-t-lg p-4 ${getColumnHeaderColor(
                    column.color
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold bg-white/30 px-2 py-1 rounded-full">
                        {column.tasks.length}
                      </span>
                      <button
                        onClick={() => handleOpenNewTaskModal(column.id)}
                        className="opacity-75 hover:opacity-100"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tarefas */}
                <div className="space-y-3 min-h-[200px] bg-gray-100 dark:bg-gray-800/50 p-4 rounded-b-lg">
                  <AnimatePresence>
                    {column.tasks.map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: 0.3,
                          delay: taskIndex * 0.05,
                        }}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={`p-4 rounded-lg border-l-4 cursor-move hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${getPriorityColor(
                          task.priority
                        )} ${draggedTask?.id === task.id ? "opacity-50" : ""}`}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-3">
                          {task.title || "Untitled"}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {task.priority && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    onClick={() => handleOpenNewTaskModal(column.id)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar uma tarefa
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseNewTaskModal}
          onSubmit={handleCreateTask}
          initialStatus={
            modalColumnStatus as
              | "NEW"
              | "IN_PROGRESS"
              | "COMPLETED"
              | "CANCELLED"
          }
          initialWorkspaceId={modalWorkspaceId}
        />
      </div>
    </div>
  );
};

export default KanbanView;

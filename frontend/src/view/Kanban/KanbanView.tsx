import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import type { ICreateTaskRequest, ITask } from "../../types/task.types";
import type { IWorkspaceName } from "../../types/workspace.types";
import { taskService } from "../../services/Tasks/task.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { NewTaskModal } from "../../components/Modals/NewTask";

interface Column {
  id: string;
  title: string;
  tasks: ITask[];
  color: string;
}

interface Column {
  id: string;
  title: string;
  tasks: ITask[];
  color: string;
}

interface WorkspaceWithColor extends IWorkspaceName {
  color: string;
}

const initialColumns: Column[] = [
  {
    id: "NEW",
    title: "New",
    color: "blue",
    tasks: [],
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "yellow",
    tasks: [],
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "green",
    tasks: [],
  },
  {
    id: "CANCELLED",
    title: "Cancelled",
    color: "red",
    tasks: [],
  },
];

const KanbanView: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const [draggedTask, setDraggedTask] = useState<ITask | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithColor[]>([]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string>("NEW");
  const loadWorkspaces = useCallback(async () => {
    const workspaceColors = [
      "blue",
      "purple",
      "green",
      "orange",
      "pink",
      "indigo",
      "red",
    ];

    try {
      const userWorkspaces = await workspaceService.getWorkspacesFromUser();

      const workspacesWithColor: WorkspaceWithColor[] = [
        { id: 0, name: "All Workspaces", color: "gray" },
        ...userWorkspaces.map((workspace, index) => ({
          ...workspace,
          color: workspaceColors[index % workspaceColors.length],
        })),
      ];

      setWorkspaces(workspacesWithColor);
    } catch (error) {
      console.error("Error loading workspaces:", error);
      setWorkspaces([{ id: 0, name: "All Workspaces", color: "gray" }]);
    }
  }, []);
  const handleCreateTask = async (taskData: ICreateTaskRequest) => {
    try {
      await taskService.createTask(taskData);
      loadAllTasks();
      loadWorkspaces();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  const loadTasksForColumn = async (status: string, workspaceId?: string) => {
    try {
      const tasks = await taskService.getTasksByStatus(status, workspaceId);
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

      const [newTasks, inProgressTasks, completedTasks, cancelledTasks] =
        await Promise.all([
          loadTasksForColumn("NEW", workspaceIdToUse),
          loadTasksForColumn("IN_PROGRESS", workspaceIdToUse),
          loadTasksForColumn("COMPLETED", workspaceIdToUse),
          loadTasksForColumn("CANCELLED", workspaceIdToUse),
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
  }, [selectedWorkspace]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0) {
      loadAllTasks();
    }
  }, [loadAllTasks, workspaces.length]);

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
      case "gray":
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300";
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300";
      case "green":
        return "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300";
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

    if (!draggedTask) return;

    const sourceColumnId = draggedTask.status;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    try {
      await taskService.updateTask(draggedTask.id, {
        status: targetColumnId as
          | "NEW"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "CANCELLED",
      });

      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
        }));

        const targetColumn = newColumns.find(
          (col) => col.id === targetColumnId
        );
        if (targetColumn) {
          const updatedTask = {
            ...draggedTask,
            status: targetColumnId as
              | "NEW"
              | "IN_PROGRESS"
              | "COMPLETED"
              | "CANCELLED",
          };
          targetColumn.tasks.push(updatedTask);
        }

        return newColumns;
      });
    } catch (error) {
      console.error("Error updating task status:", error);

      await loadAllTasks();
    } finally {
      setDraggedTask(null);
    }
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }),
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
            Visualize and manage your workflow with drag and drop
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-xs">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              <BuildingOfficeIcon className="w-4 h-4" />
              Workspace
            </label>

            <div className="relative">
              <button
                onClick={() =>
                  setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
                }
                className="w-full px-4 py-3 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {workspaces?.find((w) => w.id === Number(selectedWorkspace))
                      ?.name || "Select Workspace"}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300 ${
                    isWorkspaceDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isWorkspaceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 overflow-hidden"
                  >
                    {workspaces?.map((workspace, index) => (
                      <motion.button
                        key={workspace.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setSelectedWorkspace(workspace.id.toString());
                          setIsWorkspaceDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 flex items-center gap-3 group ${
                          Number(selectedWorkspace) === workspace.id
                            ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            Number(selectedWorkspace) === workspace.id
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-125"
                              : "bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400"
                          }`}
                        ></div>
                        <span className="font-medium">{workspace.name}</span>
                        {Number(selectedWorkspace) === workspace.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading tasks...
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
            {filteredColumns.map((column, columnIndex) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div
                  className={`rounded-lg p-4 mb-4 ${getColumnHeaderColor(
                    column.color
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-75">
                        {column.tasks.length}
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedColumnStatus(column.id);
                          setIsNewTaskModalOpen(true);
                        }}
                        className="opacity-75 hover:opacity-100"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {column.tasks.map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: columnIndex * 0.1 + taskIndex * 0.05,
                        }}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={`
                        p-4 rounded-lg border-l-4 cursor-move hover:shadow-lg transition-all duration-200
                        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                        ${getPriorityColor(task.priority)}
                        ${draggedTask?.id === task.id ? "opacity-50" : ""}
                      `}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {task.title || "Untitled"}
                          </h4>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Categories */}
                        {task.categories && task.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.categories.map((category) => (
                              <span
                                key={category}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Task Footer */}
                        <div className="flex items-center justify-between">
                          {task.priority && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(
                                task.priority
                              )}`}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            {task.dueDate && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Task Button */}
                  <button
                    onClick={() => {
                      setSelectedColumnStatus(column.id);
                      setIsNewTaskModalOpen(true);
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add a task
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          initialStatus={selectedColumnStatus as "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"}
        />
      </div>
    </div>
  );
};

export default KanbanView;

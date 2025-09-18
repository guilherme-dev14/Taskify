import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import type { ITask, ITaskFilters, ITaskStatus } from "../../types/task.types";

type WorkspaceOption = { id: string | number; name: string };
import { taskService } from "../../services/Tasks/task.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { NewTaskModal } from "../../components/Modals/NewTask";
import { TaskDetailsModal } from "../../components/Modals/TaskDetails";
import { formatDate } from "../../utils/dateUtils";
import type { ICreateTaskRequest } from "../../types/task.types";
import {
  getOperationErrorInfo,
  type ErrorInfo,
} from "../../utils/errorHandler";
import { ErrorNotification } from "../../components/UI/ErrorNotification";
import { UserAvatar } from "../../components/UI/UserAvatar";
import { ShareWorkspaceModal } from "../../components/Modals/ShareWorkspace";
import { JoinWorkspaceModal } from "../../components/Modals/JoinWorkspace";
import { LiveCursors } from "../../components/Presence/LiveCursors";
import { TypingIndicator } from "../../components/Presence/TypingIndicator";
import { OnlineIndicator } from "../../components/Presence/OnlineIndicator";
import { useWebSocketEvent } from "../../hooks/useWebSocket";
import { useWorkspaceSharing } from "../../hooks/useWorkspaceSharing";
const TasksView: React.FC = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | number>(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [allTasks, setAllTasks] = useState<ITask[]>([]);
  const [workspaces, setWorkspaces] = useState<
    (WorkspaceOption & { color?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<number | undefined>(
    undefined
  );
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [workspaceStatuses] = useState<ITaskStatus[]>([]);

  const [typingUsers, setTypingUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [onlineUsers, setOnlineUsers] = useState<
    Array<{ id: string; name: string; lastSeen: string }>
  >([]);

  const workspaceSharing = useWorkspaceSharing(
    selectedWorkspace !== "all" && typeof selectedWorkspace === "number"
      ? selectedWorkspace
      : typeof selectedWorkspace === "string"
      ? parseInt(selectedWorkspace)
      : 0,
    isShareModalOpen
  );

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useWebSocketEvent(
    "user:online",
    (data: { userId: string; userName: string }) => {
      setOnlineUsers((prev) => {
        const existing = prev.find((user) => user.id === data.userId);
        if (existing) return prev;
        return [
          ...prev,
          {
            id: data.userId,
            name: data.userName,
            lastSeen: new Date().toISOString(),
          },
        ];
      });
    }
  );

  useWebSocketEvent("user:offline", (userId: string) => {
    setOnlineUsers((prev) => prev.filter((user) => user.id !== userId));
  });

  useWebSocketEvent(
    "user:typing",
    (data: { userId: string; userName: string; taskId?: string }) => {
      setTypingUsers((prev) => {
        const existing = prev.find((user) => user.id === data.userId);
        if (existing) return prev;
        return [...prev, { id: data.userId, name: data.userName }];
      });

      setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((user) => user.id !== data.userId)
        );
      }, 3000);
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, debouncedSearchTerm]);

  const loadWorkspaces = async () => {
    try {
      const workspacesData = await workspaceService.getWorkspacesFromUserList();
      const allWorkspace = { id: "all", name: "All Tasks", color: "gray" };

      const workspacesWithColors = workspacesData.map((ws) => ({
        ...ws,
        color: "blue",
      }));
      setWorkspaces([allWorkspace, ...workspacesWithColors]);
    } catch (error) {
      console.error("Error loading workspaces:", error);
      setErrorInfo(getOperationErrorInfo("load", error));
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setErrorInfo(null);

      const workspaceIdValue =
        selectedWorkspace !== "all"
          ? typeof selectedWorkspace === "string"
            ? parseInt(selectedWorkspace)
            : selectedWorkspace
          : undefined;

      const filters: ITaskFilters = {
        page: currentPage - 1,
        size: 6,
        workspaceId: workspaceIdValue,
        sortBy: "createdAt",
        sortDir: "desc",
      };

      const response = workspaceIdValue
        ? await taskService.getWorkspaceTasks(workspaceIdValue, {
            page: filters.page,
            size: filters.size,
            sort: filters.sortBy,
            direction: filters.sortDir === "desc" ? "DESC" : "ASC",
          })
        : await taskService.getAllTasks(filters);
      setAllTasks(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setErrorInfo(getOperationErrorInfo("load", error));
      setAllTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: ICreateTaskRequest) => {
    try {
      await taskService.createTask(taskData);
      loadTasks();
      loadWorkspaces();
    } catch (error) {
      console.error("Error creating task:", error);
      setErrorInfo(getOperationErrorInfo("create", error));
    }
  };

  const handleOpenNewTaskModal = () => {
    const currentWorkspaceId =
      selectedWorkspace !== "all" ? Number(selectedWorkspace) : undefined;
    setModalWorkspaceId(currentWorkspaceId);
    setIsNewTaskModalOpen(true);
  };

  const handleCloseNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
    setModalWorkspaceId(undefined);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailsModalOpen(true);
  };

  const handleTaskUpdate = () => {
    loadTasks();
  };

  const handleDeleteClick = (task: ITask, event: React.MouseEvent) => {
    event.stopPropagation();
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await taskService.deleteTask(taskToDelete.id);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      setErrorInfo(getOperationErrorInfo("delete", error));
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const getStatusIcon = (status: ITaskStatus) => {
    const statusName = status.name.toUpperCase();
    if (statusName === "COMPLETED" || statusName === "DONE") {
      return <CheckCircleIconSolid className="w-5 h-5 text-green-500" />;
    }
    return (
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: status.color }}
      />
    );
  };

  const getStatusText = (status: ITaskStatus) => {
    return status.name;
  };

  const filteredTasks = useMemo(() => {
    let filtered = allTasks;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.status?.id.toString() === statusFilter
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (debouncedSearchTerm) {
      const searchTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((task) => {
        const title = task.title?.toLowerCase() || "";
        const description = task.description?.toLowerCase() || "";
        return title.includes(searchTerm) || description.includes(searchTerm);
      });
    }

    return filtered;
  }, [allTasks, statusFilter, priorityFilter, debouncedSearchTerm]);

  const getPriorityColor = (priority: ITask["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
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

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 relative">
      {/* Live Cursors for real-time collaboration */}
      <LiveCursors
        workspaceId={
          selectedWorkspace !== "all" ? selectedWorkspace.toString() : undefined
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and organize your tasks efficiently
              </p>
            </div>

            {/* Online Users Indicator */}
            {selectedWorkspace !== "all" && onlineUsers.length > 0 && (
              <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 dark:border-gray-700/50">
                <OnlineIndicator isOnline={true} size="md" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {onlineUsers.length} online
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {onlineUsers
                      .slice(0, 3)
                      .map((user) => user.name)
                      .join(", ")}
                    {onlineUsers.length > 3 &&
                      ` +${onlineUsers.length - 3} more`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Modern Workspace Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-end justify-between">
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
                      {workspaces?.find((w) => w.id === selectedWorkspace)
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
                            setSelectedWorkspace(workspace.id);
                            setIsWorkspaceDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 flex items-center gap-3 group ${
                            selectedWorkspace === workspace.id
                              ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              selectedWorkspace === workspace.id
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-125"
                                : "bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400"
                            }`}
                          ></div>
                          <span className="font-medium">{workspace.name}</span>
                          {selectedWorkspace === workspace.id && (
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

              {/* Collaboration Buttons */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                  title="Join a shared workspace"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Join Workspace
                </button>
                {selectedWorkspace !== "all" && (
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                    title="Share this workspace"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1 flex gap-2">
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
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>

          {/* Add Task Button */}
          <button
            onClick={handleOpenNewTaskModal}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Add Task
          </button>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      disabled={selectedWorkspace === "all"}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    >
                      <option value="all">All Statuses</option>
                      {workspaceStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Tasks Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTasks?.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleTaskClick(task.id)}
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getStatusText(task.status)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(task, e)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="Delete task"
                    >
                      <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                    </button>
                  </div>

                  {/* Task Content */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {task.description}
                    </p>
                  </div>

                  {/* Task Meta */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                        Due {formatDate(task.dueDate)}
                      </span>
                    </div>

                    {/* User Avatar and Attachments */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          user={task.assignedTo || task.creator}
                          size="sm"
                        />
                        {(task.assignedTo || task.creator) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.assignedTo ? "Assigned to" : "Created by"}{" "}
                            {(task.assignedTo || task.creator)?.firstName}{" "}
                            {(task.assignedTo || task.creator)?.lastName}
                          </span>
                        )}
                      </div>

                      {/* Attachment indicator */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span>{task.attachments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredTasks?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or create a new task.
            </p>
            <button
              onClick={handleOpenNewTaskModal}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Create Your First Task
            </button>
          </motion.div>
        )}

        {/* New Task Modal */}
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseNewTaskModal}
          onSubmit={handleCreateTask}
          initialWorkspaceId={modalWorkspaceId}
        />

        {/* Task Details Modal */}
        {selectedTaskId && (
          <TaskDetailsModal
            isOpen={isTaskDetailsModalOpen}
            onClose={() => {
              setIsTaskDetailsModalOpen(false);
              setSelectedTaskId(null);
            }}
            taskId={selectedTaskId}
            onTaskUpdate={handleTaskUpdate}
          />
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && taskToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleDeleteCancel}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Delete Task
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete "{taskToDelete.title}"? This
                    action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteCancel}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Workspace Modal */}
        {selectedWorkspace !== "all" && (
          <ShareWorkspaceModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            workspaceId={
              typeof selectedWorkspace === "string"
                ? parseInt(selectedWorkspace)
                : selectedWorkspace
            }
            workspaceName={
              workspaces?.find((w) => w.id === selectedWorkspace)?.name || ""
            }
            inviteCode={workspaceSharing.inviteCode}
            members={workspaceSharing.members}
            onInviteUser={workspaceSharing.inviteUser}
            onRegenerateInviteCode={workspaceSharing.regenerateInviteCode}
            onUpdateMemberRole={workspaceSharing.updateMemberRole}
            onRemoveMember={workspaceSharing.removeMember}
          />
        )}

        {/* Join Workspace Modal */}
        <JoinWorkspaceModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onSubmit={async () => {
            loadWorkspaces();
            loadTasks();
            setIsJoinModalOpen(false);
          }}
        />

        {/* Error Notification */}
        <ErrorNotification
          errorInfo={errorInfo}
          onClose={() => setErrorInfo(null)}
        />

        {/* Typing Indicator */}
        {selectedWorkspace !== "all" && typingUsers.length > 0 && (
          <div className="fixed bottom-20 left-6 z-30">
            <TypingIndicator
              users={typingUsers}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;

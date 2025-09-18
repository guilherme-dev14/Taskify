/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { taskService } from "../../services/Tasks/task.service";
import { TaskCard } from "../../components/Tasks/TaskCard";
import { UserAvatarGroup } from "../../components/UI/UserAvatarBubble";
import { type ITask, type ITasksResponse } from "../../types/task.types";
import { type IUserSummary } from "../../types/user.types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface WorkspaceTasksViewProps {
  workspaceId: number;
  workspaceName?: string;
}

export const WorkspaceTasksView: React.FC<WorkspaceTasksViewProps> = ({
  workspaceId,
  workspaceName = "Workspace",
}) => {
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    status: undefined as ITask["status"] | undefined,
    priority: undefined as ITask["priority"] | undefined,
    sort: "createdAt",
    direction: "DESC" as "ASC" | "DESC",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults] = useState<ITask[]>([]);

  const {
    data: tasksResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<ITasksResponse>({
    queryKey: ["workspace-tasks", workspaceId, filters],
    queryFn: () => taskService.getWorkspaceTasks(workspaceId, filters),
    enabled: !!workspaceId,
  });

  const tasks = tasksResponse?.content || [];
  const totalTasks = tasksResponse?.totalElements || 0;

  const assignees = React.useMemo(() => {
    const uniqueAssignees = new Map<number, IUserSummary>();
    tasks.forEach((task) => {
      if (task.assignedTo) {
        uniqueAssignees.set(task.assignedTo.id, task.assignedTo);
      }
    });
    return Array.from(uniqueAssignees.values());
  }, [tasks]);

  const filteredTasks = React.useMemo(() => {
    if (searchResults.length > 0) return searchResults;

    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignedTo?.firstName?.toLowerCase().includes(query) ||
        task.assignedTo?.lastName?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery, searchResults]);

  const handleStatusFilter = (status: ITask["status"] | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 0 }));
  };

  const handlePriorityFilter = (priority: ITask["priority"] | undefined) => {
    setFilters((prev) => ({ ...prev, priority, page: 0 }));
  };

  const handleTaskStatusChange = () => {
    refetch();
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Error loading workspace tasks
          </p>
          <button
            onClick={() => refetch()}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {workspaceName} Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalTasks} total tasks • {assignees.length} contributors
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Contributors */}
          {assignees.length > 0 && (
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-gray-500" />
              <UserAvatarGroup users={assignees} maxVisible={5} />
            </div>
          )}

          <button className="btn-primary flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filters.status ? String(filters.status) : ""}
              onChange={(e) =>
                handleStatusFilter(
                  (e.target.value as unknown as ITask["status"]) || undefined
                )
              }
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <select
            value={filters.priority || ""}
            onChange={(e) =>
              handlePriorityFilter(
                (e.target.value as ITask["priority"]) || undefined
              )
            }
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No tasks match your search"
                : "No tasks in this workspace yet"}
            </div>
            {!searchQuery && (
              <button className="mt-4 btn-primary">Create First Task</button>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      {tasksResponse && !tasksResponse.last && filteredTasks.length > 0 && (
        <div className="text-center">
          <button onClick={handleLoadMore} className="btn-secondary">
            Load More Tasks
          </button>
        </div>
      )}

      {/* Summary */}
      {filteredTasks.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredTasks.filter((t) => t.status === "NEW").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                New
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredTasks.filter((t) => t.status === "IN_PROGRESS").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredTasks.filter((t) => t.status === "COMPLETED").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {filteredTasks.filter((t) => t.priority === "URGENT").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Urgent
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useTasksData } from "../../hooks/useTasksData";
import { taskService } from "../../services/Tasks/task.service";
import { useWebSocketEvent } from "../../hooks/useWebSocket";
import { useWorkspaceSharing } from "../../hooks/useWorkspaceSharing";
import { TasksHeader } from "../../components/Tasks/TaskHeader";
import { TaskFilters } from "../../components/Tasks/TaskFilters";
import { TaskList } from "../../components/Tasks/TaskList";
import { NewTaskModal } from "../../components/Modals/NewTask";
import { TaskDetailsModal } from "../../components/Modals/TaskDetails";
import { ShareWorkspaceModal } from "../../components/Modals/ShareWorkspace";
import { JoinWorkspaceModal } from "../../components/Modals/JoinWorkspace";
import { ErrorNotification } from "../../components/UI/ErrorNotification";
import { LiveCursors } from "../../components/Presence/LiveCursors";
import type { ITask, ITaskStatus } from "../../types/task.types";
import type { ICreateTaskRequest } from "../../types/task.types";

const TasksView: React.FC = () => {
  const {
    tasks,
    workspaces,
    isLoading,
    errorInfo,
    setErrorInfo,
    currentPage,
    setCurrentPage,
    totalPages,
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
  } = useTasksData();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<
    number | undefined
  >();
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const workspaceIdAsNumber =
    selectedWorkspace !== "all" ? Number(selectedWorkspace) : 0;
  const workspaceSharing = useWorkspaceSharing(
    workspaceIdAsNumber,
    isShareModalOpen
  );
  useWebSocketEvent(
    "user:online",
    (data: { userId: string; userName: string }) => {
      setOnlineUsers((prev) =>
        prev.find((user) => user.id === data.userId)
          ? prev
          : [...prev, { id: data.userId, name: data.userName }]
      );
    }
  );
  useWebSocketEvent("user:offline", (userId: string) => {
    setOnlineUsers((prev) => prev.filter((user) => user.id !== userId));
  });

  const handleCreateTask = async (taskData: ICreateTaskRequest) => {
    try {
      await taskService.createTask(taskData);
      loadTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleOpenNewTaskModal = () => {
    setModalWorkspaceId(
      selectedWorkspace !== "all" ? Number(selectedWorkspace) : undefined
    );
    setIsNewTaskModalOpen(true);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailsModalOpen(true);
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
    }
  };

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

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 relative">
      <LiveCursors
        workspaceId={
          selectedWorkspace !== "all" ? String(selectedWorkspace) : undefined
        }
      />

      <div className="max-w-7xl mx-auto">
        <TasksHeader
          onlineUsers={onlineUsers}
          selectedWorkspaceId={selectedWorkspace}
        />

        <TaskFilters
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onWorkspaceChange={setSelectedWorkspace}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onAddNewTask={handleOpenNewTaskModal}
        />

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onTaskClick={handleTaskClick}
          onDeleteClick={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          getPriorityColor={getPriorityColor}
          getStatusIcon={getStatusIcon}
        />

        {/* Modais */}
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          initialWorkspaceId={modalWorkspaceId}
        />

        {selectedTaskId && (
          <TaskDetailsModal
            isOpen={isTaskDetailsModalOpen}
            onClose={() => setIsTaskDetailsModalOpen(false)}
            taskId={selectedTaskId}
            onTaskUpdate={loadTasks}
          />
        )}

        <AnimatePresence>
          {isDeleteModalOpen && taskToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsDeleteModalOpen(false)}
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
                      onClick={() => setIsDeleteModalOpen(false)}
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

        {/* Modais de Workspace */}
        {selectedWorkspace !== "all" && (
          <ShareWorkspaceModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            workspaceId={workspaceIdAsNumber}
            workspaceName={
              workspaces.find((w) => w.id === selectedWorkspace)?.name || ""
            }
            {...workspaceSharing}
          />
        )}
        <JoinWorkspaceModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onSubmit={async () => {
            loadWorkspaces();
            loadTasks();
            setIsJoinModalOpen(false);
          }}
        />

        <ErrorNotification
          errorInfo={errorInfo}
          onClose={() => setErrorInfo(null)}
        />
      </div>
    </div>
  );
};

export default TasksView;

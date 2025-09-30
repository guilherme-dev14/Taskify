import React from "react";
import { motion } from "framer-motion";
import type { ITask } from "../../types/task.types";
import { UserAvatar } from "../UI/UserAvatar";
import { TrashIcon } from "@heroicons/react/24/outline";

interface TaskListProps {
  tasks: ITask[];
  isLoading: boolean;
  onTaskClick: (taskId: string) => void;
  onDeleteClick: (task: ITask, event: React.MouseEvent) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getPriorityColor: (priority: ITask["priority"]) => string;
  getStatusIcon: (status: ITask["status"]) => React.ReactNode;
}

export const TaskList: React.FC<TaskListProps> = (props) => {
  const {
    tasks,
    isLoading,
    onTaskClick,
    onDeleteClick,
    currentPage,
    totalPages,
    onPageChange,
    getPriorityColor,
    getStatusIcon,
  } = props;

  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onTaskClick(task.id)}
          >
            {/* Task Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {task.status.name}
                </span>
              </div>
              <button
                onClick={(e) => onDeleteClick(task, e)}
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
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    user={task.assignedTo || task.creator}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
        </motion.div>
      )}
    </>
  );
};

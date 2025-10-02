import React from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "../../stores/task.store";
import { formatDistanceToNow } from "date-fns";

interface EnhancedTaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  onStartTimer?: () => void;
  onMarkComplete?: () => void;
  className?: string;
}

const EnhancedTaskCard: React.FC<EnhancedTaskCardProps> = ({
  task,
  isSelected = false,
  onSelect,
  onClick,
  onStartTimer,
  onMarkComplete,
  className = "",
}) => {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "border-red-500 bg-red-50 dark:bg-red-900/10";
      case "HIGH":
        return "border-orange-500 bg-orange-50 dark:bg-orange-900/10";
      case "MEDIUM":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "border-green-500 bg-green-50 dark:bg-green-900/10";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "NEW":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      case "COMPLETED":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "CANCELLED":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED";
  const hasActiveTimer = task.timeTrackingEntries.some(
    (entry) => entry.isActive
  );
  const completedChecklistItems = task.checklist.filter(
    (item) => item.completed
  ).length;
  const checklistProgress =
    task.checklist.length > 0
      ? Math.round((completedChecklistItems / task.checklist.length) * 100)
      : 0;

  return (
    <motion.div
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200
        hover:shadow-md hover:scale-[1.02] cursor-pointer
        ${
          isSelected
            ? "border-blue-500 shadow-md"
            : "border-gray-200 dark:border-gray-700"
        }
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      layout
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      )}

      {/* Priority Indicator */}
      <div
        className={`absolute top-0 left-0 w-full h-1 rounded-t-lg ${
          getPriorityColor(task.priority).split(" ")[0]
        }`}
      />

      {/* Active Timer Badge */}
      {hasActiveTimer && (
        <motion.div
          className="absolute -top-2 -right-2 z-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>ACTIVE</span>
          </div>
        </motion.div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
              {task.title}
            </h3>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status.replace("_", " ")}
              </span>

              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex-shrink-0 ml-3">
            <div className="w-12 h-12 relative">
              <svg
                className="w-12 h-12 transform -rotate-90"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${task.progress * 1.25} 125`}
                  className={
                    task.status === "COMPLETED"
                      ? "text-green-500"
                      : "text-blue-500"
                  }
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                {task.status === "COMPLETED" ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {task.progress}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Checklist Progress */}
        {task.checklist.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Checklist Progress
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {completedChecklistItems}/{task.checklist.length}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${checklistProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-3">
            {/* Assignee */}
            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-[10px] text-white font-semibold leading-none">
                    {task.assignedTo.firstName?.charAt(0) ||
                      task.assignedTo.username.charAt(0)}
                  </span>
                </div>
                <span>
                  {task.assignedTo.firstName || task.assignedTo.username}
                </span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`flex items-center space-x-1 ${
                  isOverdue ? "text-red-500" : ""
                }`}
              >
                <CalendarDaysIcon className="w-4 h-4" />
                <span>
                  {isOverdue && (
                    <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                  )}
                  {formatDistanceToNow(new Date(task.dueDate), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Time Tracking */}
          {task.timeTrackingEntries.length > 0 && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>
                {Math.round(
                  task.timeTrackingEntries.reduce(
                    (total, entry) => total + (entry.duration || 0),
                    0
                  ) / 60
                )}
                h
              </span>
            </div>
          )}
        </div>

        {/* Indicators Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Attachment Indicator */}
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <PaperClipIcon className="w-4 h-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Comments Indicator */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* Dependencies Indicator */}
            {task.dependencies.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-orange-500 dark:text-orange-400">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Blocked</span>
              </div>
            )}

            {/* Subtasks Indicator */}
            {task.subtasks.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {
                  task.subtasks.filter(
                    (subtask) => subtask.status === "COMPLETED"
                  ).length
                }
                /{task.subtasks.length} subtasks
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {task.status !== "COMPLETED" && onStartTimer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTimer();
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                title="Start Timer"
              >
                <PlayIcon className="w-4 h-4" />
              </button>
            )}

            {task.status !== "COMPLETED" && onMarkComplete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkComplete();
                }}
                className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded transition-colors"
                title="Mark Complete"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{task.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Actions Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
        initial={false}
      >
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all">
            <PlayIcon className="w-4 h-4 text-blue-600" />
          </button>
          <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedTaskCard;

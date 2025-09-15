import React from "react";
import { motion } from "framer-motion";
import { UserAvatarBubble } from "../UI/UserAvatarBubble";
import {
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "../../stores/task.store";
import { formatDate as formatDateUtil } from "../../utils/dateUtils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
  className?: string;
}

const priorityColors = {
  LOW: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
  MEDIUM: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
  HIGH: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
  URGENT: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
};

const statusColors = {
  NEW: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  IN_PROGRESS:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(date);
};

const isOverdue = (dueDate: string, status: Task["status"]) => {
  if (status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(dueDate) < new Date();
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  className = "",
}) => {
  const taskIsOverdue = task.dueDate && isOverdue(task.dueDate, task.status);

  const handleStatusClick = (
    e: React.MouseEvent,
    newStatus: Task["status"]
  ) => {
    e.stopPropagation();
    onStatusChange?.(task.id.toString(), newStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        group cursor-pointer 
        bg-white dark:bg-gray-800 
        border-l-4 ${priorityColors[task.priority]}
        rounded-lg shadow-sm hover:shadow-md 
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`
            ml-3 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
            ${statusColors[task.status]}
          `}
          >
            {task.status.replace("_", " ")}
          </span>
        </div>

        {/* Task Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`flex items-center space-x-1 ${
                  taskIsOverdue ? "text-red-500 dark:text-red-400" : ""
                }`}
              >
                {taskIsOverdue ? (
                  <ExclamationTriangleIcon className="w-4 h-4" />
                ) : (
                  <CalendarIcon className="w-4 h-4" />
                )}
                <span className={taskIsOverdue ? "font-medium" : ""}>
                  {typeof task.dueDate === 'string' ? formatDate(task.dueDate) : formatDate(task.dueDate.toISOString())}
                </span>
              </div>
            )}

            {/* Progress */}
            {task.progress !== undefined && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{task.progress}%</span>
              </div>
            )}

            {/* Comments - Show if comments exist (comments is a string) */}
            {task.comments && task.comments.trim().length > 0 && (
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>1</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <PaperClipIcon className="w-4 h-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assigned User */}
          <div className="flex items-center space-x-2">
            {task.assignedTo && (
              <UserAvatarBubble 
                user={{
                  ...task.assignedTo,
                  firstName: task.assignedTo.firstName || '',
                  lastName: task.assignedTo.lastName || '',
                  profilePictureUrl: task.assignedTo.avatar
                }} 
                size="sm" 
                showTooltip 
              />
            )}

            {/* Quick Status Actions */}
            {task.status !== "COMPLETED" && (
              <button
                onClick={(e) => handleStatusClick(e, "COMPLETED")}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600"
                title="Mark as completed"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                +{task.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Categories */}
        {task.categories && task.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
                style={category.color ? { backgroundColor: category.color + '20', color: category.color } : {}}
              >
                {category.name}
              </span>
            ))}
            {task.categories.length > 2 && (
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-md">
                +{task.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

import React from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "../../stores/task.store";
import { formatDistanceToNow } from "date-fns";

interface OverdueTasksAlertProps {
  tasks: Task[];
  onDismiss?: () => void;
  onViewTask?: (taskId: number) => void;
}

const OverdueTasksAlert: React.FC<OverdueTasksAlertProps> = ({
  tasks,
  onDismiss,
  onViewTask,
}) => {
  if (!tasks || tasks.length === 0) return null;

  const criticalTasks = tasks.filter(
    (task) => task.priority === "URGENT" || task.priority === "HIGH"
  );

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getOverdueDays = (dueDate: string) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <motion.div
      className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              {tasks.length} Overdue Task{tasks.length > 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {criticalTasks.length > 0
                ? `${criticalTasks.length} critical priority task${
                    criticalTasks.length > 1 ? "s" : ""
                  } need immediate attention`
                : "These tasks are past their due date and need attention"}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Overdue Tasks List */}
      <div className="mt-4 space-y-3">
        {tasks.slice(0, 3).map((task, index) => {
          const overdueDays = getOverdueDays(task.dueDate!);

          return (
            <motion.div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onViewTask?.(task.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h4>

                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>
                        Due{" "}
                        {task.dueDate &&
                          formatDistanceToNow(new Date(task.dueDate), {
                            addSuffix: true,
                          })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {overdueDays} day{overdueDays > 1 ? "s" : ""} overdue
                      </span>
                    </div>

                    {task.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {task.assignedTo.firstName?.charAt(0) ||
                              task.assignedTo.username.charAt(0)}
                          </span>
                        </div>
                        <span>
                          {task.assignedTo.firstName ||
                            task.assignedTo.username}
                        </span>
                      </div>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="ml-4 flex-shrink-0">
                  <div className="w-16 h-16 relative">
                    {/* Progress Circle */}
                    <svg
                      className="w-16 h-16 transform -rotate-90"
                      viewBox="0 0 64 64"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${task.progress * 1.75} 175`}
                        className="text-red-500 dark:text-red-400"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show More Tasks */}
      {tasks.length > 3 && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
            View all {tasks.length} overdue tasks
          </button>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="mt-6 flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>Review Overdue Tasks</span>
        </button>

        <button className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
          Reschedule All
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OverdueTasksAlert;

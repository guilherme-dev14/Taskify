import React from "react";
import { motion } from "framer-motion";
import { UserAvatarBubble } from "../UI/UserAvatarBubble";
import {
  CalendarIcon,
  ClockIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { ITask, ITaskStatus } from "../../types/task.types"; // Importe os novos tipos

interface TaskCardProps {
  task: ITask;
  onClick?: () => void;
  onStatusChange?: (taskId: string, statusId: number) => void;
  className?: string;
}

const priorityColors = {
  LOW: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
  MEDIUM: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
  HIGH: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
  URGENT: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
};

const formatDate = (dateString: string | Date): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString();
};

const isOverdue = (dueDate: string, status: ITaskStatus) => {
  // CORREÇÃO: Verifica o nome do status para determinar se a tarefa está concluída
  if (
    status.name.toUpperCase() === "COMPLETED" ||
    status.name.toUpperCase() === "CANCELLED"
  )
    return false;
  return new Date(dueDate) < new Date();
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  className = "",
}) => {
  // CORREÇÃO: Garante que o status não seja nulo antes de usar
  const taskIsOverdue =
    task.dueDate && task.status && isOverdue(task.dueDate, task.status);

  const handleStatusClick = (
    e: React.MouseEvent,
    newStatusId: number // Agora recebe o ID do status
  ) => {
    e.stopPropagation();
    onStatusChange?.(task.id.toString(), newStatusId);
  };

  // Encontre o ID do status "COMPLETED" para a ação rápida (pode vir de um contexto/store no futuro)
  // Por agora, vamos assumir que não temos essa informação e desabilitar a ação rápida.
  // Para reabilitar, você precisaria buscar os status do workspace e encontrar o ID do "COMPLETED".
  const completedStatusId = undefined;

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

          {/* Status Badge Dinâmico */}
          {task.status && (
            <span
              className="ml-3 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
              style={{
                backgroundColor: `${task.status.color}25`, // Adiciona opacidade
                color: task.status.color,
              }}
            >
              {task.status.name}
            </span>
          )}
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
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}

            {/* Progress */}
            {task.progress !== undefined && task.progress > 0 && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{task.progress}%</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && (
              <div className="flex items-center space-x-1">
                <PaperClipIcon className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Assigned User */}
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {task.assignedTo && (
              <UserAvatarBubble user={task.assignedTo} size="sm" showTooltip />
            )}

            {/* Quick Status Actions */}
            {completedStatusId &&
              task.status?.name.toUpperCase() !== "COMPLETED" && (
                <button
                  onClick={(e) => handleStatusClick(e, completedStatusId)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600"
                  title="Mark as completed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

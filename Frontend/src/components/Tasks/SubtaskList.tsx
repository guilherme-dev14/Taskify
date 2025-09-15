import React, { useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { advancedTaskService } from "../../services/Tasks/advancedTask.service";
import { taskService } from "../../services/Tasks/task.service";
import type { ITask, ICreateSubtaskRequest } from "../../types/task.types";
import { formatDate } from "../../utils/dateUtils";

interface SubtaskListProps {
  parentTask: ITask;
  className?: string;
}

interface NewSubtaskFormProps {
  parentTaskId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

function NewSubtaskForm({
  parentTaskId,
  onCancel,
  onSuccess,
}: NewSubtaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: ICreateSubtaskRequest) =>
      advancedTaskService.createSubtask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      parentTaskId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-50 rounded-lg space-y-3"
    >
      <div>
        <input
          type="text"
          placeholder="Subtask title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>

      <div>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between">
        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="URGENT">Urgent</option>
        </select>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || createMutation.isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "Creating..." : "Create Subtask"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function SubtaskList({ parentTask, className = "" }: SubtaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: subtasks = [], isLoading } = useQuery({
    queryKey: ["subtasks", parentTask.id],
    queryFn: () => advancedTaskService.getSubtasks(parentTask.id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: ITask["status"];
    }) => taskService.updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", parentTask.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 bg-red-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "LOW":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string, completed: boolean = false) => {
    if (status === "COMPLETED" || completed) {
      return <CheckCircleIconSolid className="h-5 w-5 text-green-600" />;
    }
    return (
      <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-green-600 cursor-pointer" />
    );
  };

  const handleStatusToggle = (subtask: ITask) => {
    const newStatus = subtask.status === "COMPLETED" ? "NEW" : "COMPLETED";
    updateStatusMutation.mutate({ taskId: subtask.id, status: newStatus });
  };

  const completedCount = subtasks.filter(
    (subtask) => subtask.status === "COMPLETED"
  ).length;
  const progressPercentage =
    subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  if (subtasks.length === 0 && !showNewForm) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add subtask</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
          <span>
            Subtasks ({completedCount}/{subtasks.length})
          </span>
        </button>

        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* New subtask form */}
      {showNewForm && (
        <NewSubtaskForm
          parentTaskId={parentTask.id}
          onCancel={() => setShowNewForm(false)}
          onSuccess={() => setShowNewForm(false)}
        />
      )}

      {/* Subtasks list */}
      {isExpanded && (
        <div className="space-y-2 ml-4 border-l-2 border-gray-100 pl-4">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  subtask.status === "COMPLETED"
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => handleStatusToggle(subtask)}
                  disabled={updateStatusMutation.isPending}
                >
                  {getStatusIcon(subtask.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium ${
                      subtask.status === "COMPLETED"
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {subtask.title}
                  </h4>

                  {subtask.description && (
                    <p
                      className={`text-xs mt-1 ${
                        subtask.status === "COMPLETED"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {subtask.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                        subtask.priority
                      )}`}
                    >
                      {subtask.priority}
                    </span>

                    {subtask.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(subtask.dueDate)}
                      </span>
                    )}

                    {subtask.assignedTo && (
                      <span className="text-xs text-gray-500">
                        @{subtask.assignedTo.username}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

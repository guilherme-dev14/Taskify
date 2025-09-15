import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { advancedTaskService } from "../../services/Tasks/advancedTask.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import type { IBulkTaskOperationRequest } from "../../types/task.types";
import type { IWorkspaceMemberResponse } from "../../types/workspace.types";

interface BulkOperationsBarProps {
  selectedTasks: string[];
  onClearSelection: () => void;
  onOperationComplete: () => void;
  workspaceId?: number;
}

export const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedTasks,
  onClearSelection,
  onOperationComplete,
  workspaceId,
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<IWorkspaceMemberResponse[]>([]);
  
  const [updateForm, setUpdateForm] = useState({
    status: "",
    priority: "",
    assignedToId: "",
  });

  useEffect(() => {
    if (workspaceId && showUpdateModal) {
      loadWorkspaceMembers();
    }
  }, [workspaceId, showUpdateModal]);

  const loadWorkspaceMembers = async () => {
    if (!workspaceId) return;
    try {
      const workspaceMembers = await workspaceService.getWorkspaceMembers(workspaceId);
      setMembers(workspaceMembers);
    } catch (error) {
      console.error("Failed to load workspace members:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.length} task(s)? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const taskIds = selectedTasks.map(id => parseInt(id));
      await advancedTaskService.bulkDeleteTasks(taskIds);
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      console.error("Failed to delete tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    setIsLoading(true);
    try {
      const request: IBulkTaskOperationRequest = {
        taskIds: selectedTasks.map(id => parseInt(id)),
      };

      if (updateForm.status) {
        request.status = updateForm.status as any;
      }
      if (updateForm.priority) {
        request.priority = updateForm.priority as any;
      }
      if (updateForm.assignedToId) {
        request.assignedToId = parseInt(updateForm.assignedToId);
      }

      await advancedTaskService.bulkUpdateTasks(request);
      onOperationComplete();
      onClearSelection();
      setShowUpdateModal(false);
      setUpdateForm({ status: "", priority: "", assignedToId: "" });
    } catch (error) {
      console.error("Failed to update tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <ClockIcon className="w-4 h-4" />;
      case "CANCELLED":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-purple-600 bg-purple-50";
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (selectedTasks.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    {selectedTasks.length}
                  </span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpdateModal(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Update
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClearSelection}
                  className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowUpdateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update {selectedTasks.length} Task{selectedTasks.length !== 1 ? 's' : ''}
                </h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status (optional)
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Keep current</option>
                    <option value="NEW">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {updateForm.status && (
                    <div className={`flex items-center gap-2 mt-2 text-sm ${getStatusColor(updateForm.status)}`}>
                      {getStatusIcon(updateForm.status)}
                      <span>
                        {updateForm.status === "NEW" ? "To Do" : 
                         updateForm.status === "IN_PROGRESS" ? "In Progress" :
                         updateForm.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority (optional)
                  </label>
                  <select
                    value={updateForm.priority}
                    onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Keep current</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  {updateForm.priority && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(updateForm.priority)}`}>
                        {updateForm.priority}
                      </span>
                    </div>
                  )}
                </div>

                {/* Assignee */}
                {workspaceId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assignee (optional)
                    </label>
                    <select
                      value={updateForm.assignedToId}
                      onChange={(e) => setUpdateForm({ ...updateForm, assignedToId: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Keep current</option>
                      <option value="unassign">Unassign</option>
                      {members.map((member) => (
                        <option key={member.user.id} value={member.user.id.toString()}>
                          {member.user.firstName} {member.user.lastName} ({member.user.username})
                        </option>
                      ))}
                    </select>
                    {updateForm.assignedToId && updateForm.assignedToId !== "unassign" && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <UserIcon className="w-4 h-4" />
                        <span>
                          {members.find(m => m.user.id.toString() === updateForm.assignedToId)
                            ? `${members.find(m => m.user.id.toString() === updateForm.assignedToId)?.user.firstName} ${members.find(m => m.user.id.toString() === updateForm.assignedToId)?.user.lastName}`
                            : "Selected user"}
                        </span>
                      </div>
                    )}
                    {updateForm.assignedToId === "unassign" && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <UserIcon className="w-4 h-4" />
                        <span>Will be unassigned</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  disabled={isLoading || (!updateForm.status && !updateForm.priority && !updateForm.assignedToId)}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update Tasks"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
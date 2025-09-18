/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  taskStatusService,
  type ICreateTaskStatusRequest,
  type IUpdateTaskStatusRequest,
} from "../../services/Tasks/taskStatus.service";
import type { ITaskStatus } from "../../types/task.types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../hooks/useToast";

interface StatusManagementProps {
  workspaceId: number;
}

export const StatusManagement: React.FC<StatusManagementProps> = ({
  workspaceId,
}) => {
  const [statuses, setStatuses] = useState<ITaskStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#CCCCCC");
  const { toast } = useToast();

  useEffect(() => {
    fetchStatuses();
  }, [workspaceId]);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const data = await taskStatusService.getStatusesForWorkspace(workspaceId);
      setStatuses(data as ITaskStatus[]);
    } catch (error) {
      toast.error("Error", "Could not load statuses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatusName.trim()) {
      toast.warning("Validation", "Status name cannot be empty.");
      return;
    }
    try {
      const request: ICreateTaskStatusRequest = {
        name: newStatusName,
        color: newStatusColor,
        workspaceId: workspaceId,
      };
      await taskStatusService.createStatus(request.workspaceId, {
        name: request.name,
        color: request.color,
      });
      toast.success("Success", "New status created!");
      setNewStatusName("");
      setNewStatusColor("#CCCCCC");
      fetchStatuses();
    } catch (error) {
      toast.error("Error", "Failed to create status.");
    }
  };

  const handleUpdateStatus = async (status: IUpdateTaskStatusRequest) => {
    try {
      await taskStatusService.updateStatus(workspaceId, status.id, status);
      toast.success("Success", "Status updated!");
      setEditingStatusId(null);
      fetchStatuses();
    } catch (error) {
      toast.error("Error", "Failed to update status.");
    }
  };

  const handleDeleteStatus = async (statusId: number) => {
    if (window.confirm("Are you sure? Deleting a status cannot be undone.")) {
      try {
        await taskStatusService.deleteStatus(workspaceId, statusId);
        toast.success("Success", "Status deleted.");
        fetchStatuses();
      } catch (error: unknown) {
        toast.error(
          "Error",
          (error as any).response?.data ||
            "Failed to delete status. It might be in use."
        );
      }
    }
  };

  const EditableStatusRow = ({ status }: { status: ITaskStatus }) => {
    const [name, setName] = useState(status.name);
    const [color, setColor] = useState(status.color);
    const isEditing = editingStatusId === status.id;

    const onSave = () => {
      handleUpdateStatus({ id: status.id, name, color });
    };

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={!isEditing}
            className="w-8 h-8 rounded border-none cursor-pointer disabled:cursor-not-allowed"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className="font-medium bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="p-2 text-green-600 hover:bg-green-100 rounded-full"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setEditingStatusId(null)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditingStatusId(status.id)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteStatus(status.id)}
                className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div>Loading statuses...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Manage Task Statuses
      </h3>
      <div className="space-y-2">
        {statuses.map((status) => (
          <EditableStatusRow key={status.id} status={status} />
        ))}
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed">
        <input
          type="color"
          value={newStatusColor}
          onChange={(e) => setNewStatusColor(e.target.value)}
          className="w-8 h-8 rounded"
        />
        <input
          type="text"
          value={newStatusName}
          onChange={(e) => setNewStatusName(e.target.value)}
          placeholder="New status name"
          className="flex-grow p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
        />
        <button
          onClick={handleCreateStatus}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

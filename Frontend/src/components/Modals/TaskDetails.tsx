/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  SparklesIcon,
  UserCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  FlagIcon as FlagIconSolid,
} from "@heroicons/react/24/solid";
import type { ITask, IUpdateTaskRequest } from "../../types/task.types";
import { taskService } from "../../services/Tasks/task.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { attachmentService } from "../../services/Attachments/attachment.service";
import { checklistService } from "../../services/Checklist/checklist.service";
import type { IWorkspaceMemberResponse } from "../../types/workspace.types";
import { formatDate, formatLongDate, formatDateTime } from "../../utils/dateUtils";
import { TimeTrackingPanel } from "../TimeTracking/TimeTrackingPanel";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onTaskUpdate?: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  taskId,
  onTaskUpdate,
}) => {
  const [task, setTask] = useState<ITask | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "notes" | "timetracking"
  >("details");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    dueDate: "",
    estimatedHours: "",
    actualHours: "",
    notes: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [, setIsVisible] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<
    IWorkspaceMemberResponse[]
  >([]);
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(
    null
  );
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [newChecklistItem, setNewChecklistItem] = useState<string>("");
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskDetails();
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, taskId]);

  const loadTaskDetails = async () => {
    try {
      setIsLoading(true);
      const taskDetails = await taskService.getTaskById(taskId);
      setTask(taskDetails);
      const formData = {
        title: taskDetails.title || "",
        description: taskDetails.description || "",
        status: taskDetails.status || "",
        priority: taskDetails.priority || "",
        dueDate: taskDetails.dueDate ? taskDetails.dueDate.split("T")[0] : "",
        estimatedHours: taskDetails.estimatedHours?.toString() || "",
        actualHours: taskDetails.actualHours?.toString() || "",
        notes: taskDetails.notes || "",
      };
      setEditForm(formData);
      setSelectedAssignee(taskDetails.assignedTo?.id || null);
      
      // Store initial workspace info to find ID later
      const initialWorkspace = taskDetails.workspace;

      // Load user workspaces first
      const loadWorkspaces = async () => {
        try {
          const workspacesResponse = await workspaceService.getWorkspacesFromUser();
          // Check if response has content property (paginated response)
          const workspacesArray = workspacesResponse?.content || workspacesResponse;
          setUserWorkspaces(Array.isArray(workspacesArray) ? workspacesArray : []);
          
          // Find the correct workspace ID by matching name
          if (initialWorkspace && Array.isArray(workspacesArray)) {
            const matchingWorkspace = workspacesArray.find(ws => 
              ws.name === initialWorkspace.name
            );
            if (matchingWorkspace) {
              setSelectedWorkspaceId(matchingWorkspace.id as number);
            }
          }
          
          return workspacesArray;
        } catch (error) {
          console.error("Error loading user workspaces:", error);
          setUserWorkspaces([]);
          return [];
        }
      };

      // Load workspace members after getting the workspace ID
      const loadWorkspaceMembers = async (workspaceId?: number) => {
        const idToUse = workspaceId || taskDetails.workspace?.id;
        
        if (idToUse) {
          try {
            const members = await workspaceService.getWorkspaceMembers(idToUse);
            setWorkspaceMembers(members);
            return members;
          } catch (error) {
            console.error("Error loading workspace members:", error);
            setWorkspaceMembers([]);
            return [];
          }
        } else {
          setWorkspaceMembers([]);
          return [];
        }
      };

      // Load workspaces first, then members with the found ID
      const workspaces = await loadWorkspaces();
      
      // Find workspace ID from loaded workspaces if not found before
      let workspaceIdForMembers: number | undefined = undefined;
      if (initialWorkspace && Array.isArray(workspaces)) {
        const matchingWorkspace = workspaces.find(ws => 
          ws.name === initialWorkspace.name
        );
        workspaceIdForMembers = matchingWorkspace?.id as number;
      }
      
      await loadWorkspaceMembers(workspaceIdForMembers);

      setHasChanges(false);
    } catch (error) {
      console.error("Error loading task details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSave = useCallback(async () => {
    if (!task || !hasChanges || isSaving) return;

    try {
      setIsSaving(true);
      const updateData: Partial<IUpdateTaskRequest> = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status as ITask["status"],
        priority: editForm.priority as ITask["priority"],
        dueDate: editForm.dueDate ? `${editForm.dueDate}T00:00:00` : null,
        notes: editForm.notes,
      };

      // Only add fields if they have valid values
      if (editForm.estimatedHours !== "") {
        updateData.estimatedHours = parseInt(editForm.estimatedHours);
      }
      
      if (editForm.actualHours !== "") {
        updateData.actualHours = parseInt(editForm.actualHours);
      }
      
      if (selectedAssignee !== null) {
        updateData.assignedToId = selectedAssignee;
      }
      
      if (selectedWorkspaceId !== null) {
        updateData.workspaceId = selectedWorkspaceId;
      }

      console.log("DEBUG - selectedAssignee:", selectedAssignee);
      console.log("DEBUG - selectedWorkspaceId:", selectedWorkspaceId);
      console.log("DEBUG - Final updateData:", updateData);

      await taskService.updateTask(task.id, updateData);

      setHasChanges(false);
      setLastSaved(new Date());
      onTaskUpdate?.();
    } catch (error) {
      console.error("Error auto-saving task:", error);
    } finally {
      setIsSaving(false);
    }
  }, [task, editForm, hasChanges, isSaving, onTaskUpdate]);

  const handleFormChange = useCallback(
    (field: string, value: string) => {
      setEditForm((prev) => ({ ...prev, [field]: value }));
      setHasChanges(true);

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Use longer delay for numeric fields to avoid saving partial input
      const isNumericField = field === 'estimatedHours' || field === 'actualHours';
      const delay = isNumericField ? 8000 : 5000;
      
      autoSaveTimeoutRef.current = setTimeout(autoSave, delay);
    },
    [autoSave]
  );

  const handleAssigneeChange = useCallback(
    (assigneeId: number | null) => {
      setSelectedAssignee(assigneeId);
      setHasChanges(true);

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, 5000);
    },
    [autoSave]
  );

  const handleWorkspaceChange = useCallback(
    async (workspaceId: number | null) => {
      setSelectedWorkspaceId(workspaceId);
      // Only reset assignee if it's actually a different workspace
      const currentAssignee = selectedAssignee;
      setSelectedAssignee(null); // Reset assignee when workspace changes
      setHasChanges(true);

      // Load new workspace members
      if (workspaceId) {
        try {
          const members = await workspaceService.getWorkspaceMembers(
            workspaceId
          );
          setWorkspaceMembers(members);
          
          // Check if current assignee is still valid in the new workspace
          if (currentAssignee && members.some(member => member.user.id === currentAssignee)) {
            setSelectedAssignee(currentAssignee);
          }
        } catch (error) {
          console.error("Error loading workspace members:", error);
          setWorkspaceMembers([]);
        }
      } else {
        setWorkspaceMembers([]);
      }

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, 5000);
    },
    [autoSave, selectedAssignee]
  );

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!task) return;

      setUploadingFiles(true);
      const fileArray = Array.from(files);

      try {
        for (const file of fileArray) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          await attachmentService.uploadAttachment(
            { file, taskId: task.id },
            (progress) => {
              setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
            }
          );

          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }

        // Reload task to get updated attachments
        await loadTaskDetails();
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setUploadingFiles(false);
        setUploadProgress({});
      }
    },
    [task, loadTaskDetails]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDeleteAttachment = useCallback(
    async (attachmentId: string) => {
      try {
        await attachmentService.deleteAttachment(attachmentId);
        await loadTaskDetails(); // Reload to update attachments
      } catch (error) {
        console.error("Error deleting attachment:", error);
      }
    },
    [loadTaskDetails]
  );

  const handleAddChecklistItem = useCallback(async () => {
    if (!task || !newChecklistItem.trim()) return;

    try {
      await checklistService.addChecklistItem(task.id, {
        text: newChecklistItem.trim(),
      });
      setNewChecklistItem("");
      await loadTaskDetails(); // Reload to update checklist
    } catch (error) {
      console.error("Error adding checklist item:", error);
    }
  }, [task, newChecklistItem, loadTaskDetails]);

  const handleToggleChecklistItem = useCallback(
    async (itemId: number) => {
      try {
        await checklistService.toggleChecklistItem(itemId);
        await loadTaskDetails(); // Reload to update checklist
      } catch (error) {
        console.error("Error toggling checklist item:", error);
      }
    },
    [loadTaskDetails]
  );

  const handleDeleteChecklistItem = useCallback(
    async (itemId: number) => {
      try {
        await checklistService.deleteChecklistItem(itemId);
        await loadTaskDetails(); // Reload to update checklist
      } catch (error) {
        console.error("Error deleting checklist item:", error);
      }
    },
    [loadTaskDetails]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        setIsEditing((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && task) {
          autoSave();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault();
        setActiveTab("details");
      } else if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault();
        setActiveTab("notes");
      } else if ((e.metaKey || e.ctrlKey) && e.key === "3") {
        e.preventDefault();
        setActiveTab("timetracking");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasChanges, autoSave, task, onClose]);

  const handleClose = useCallback(async () => {
    if (hasChanges && task) {
      await autoSave();
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setIsEditing(false);
    setHasChanges(false);
    onClose();
  }, [hasChanges, task, autoSave, onClose]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  };

  const getStatusConfig = (status: ITask["status"]) => {
    switch (status) {
      case "COMPLETED":
        return {
          icon: <CheckCircleIconSolid className="w-5 h-5" />,
          color: "text-green-500",
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-800 dark:text-green-300",
          label: "Completed",
        };
      case "IN_PROGRESS":
        return {
          icon: <ClockIcon className="w-5 h-5" />,
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-300",
          label: "In Progress",
        };
      case "CANCELLED":
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          color: "text-red-500",
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-300",
          label: "Cancelled",
        };
      default:
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          color: "text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-800 dark:text-gray-300",
          label: "New",
        };
    }
  };

  const getPriorityConfig = (priority: ITask["priority"]) => {
    switch (priority) {
      case "URGENT":
        return {
          color:
            "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25",
          icon: <FlagIconSolid className="w-4 h-4" />,
        };
      case "HIGH":
        return {
          color:
            "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25",
          icon: <FlagIconSolid className="w-4 h-4" />,
        };
      case "MEDIUM":
        return {
          color:
            "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25",
          icon: <FlagIconSolid className="w-4 h-4" />,
        };
      case "LOW":
        return {
          color:
            "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25",
          icon: <FlagIconSolid className="w-4 h-4" />,
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
          icon: <FlagIconSolid className="w-4 h-4" />,
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-white/20 dark:border-gray-700/50 mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2 sm:gap-4">
              {task && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`p-3 rounded-2xl ${
                    getStatusConfig(task.status).bg
                  }`}
                >
                  <div className={getStatusConfig(task.status).color}>
                    {getStatusConfig(task.status).icon}
                  </div>
                </motion.div>
              )}
              <div>
                <motion.h2
                  className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Task Details
                </motion.h2>
                {lastSaved && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Saved {formatDateTime(lastSaved)}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              {/* Auto-save indicator */}
              <AnimatePresence>
                {isSaving && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-full"
                  >
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Saving...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditToggle}
                className={`p-3 rounded-2xl transition-all duration-200 ${
                  isEditing
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {isEditing ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <PencilIcon className="w-5 h-5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-all duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="relative flex border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 overflow-x-auto">
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab("details")}
              className={`relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === "details"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <DocumentTextIcon className="w-5 h-5" />
              Details
              {activeTab === "details" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab("notes")}
              className={`relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === "notes"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <BookOpenIcon className="w-5 h-5" />
              Notes
              <motion.div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              {activeTab === "notes" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab("timetracking")}
              className={`relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === "timetracking"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <ClockIcon className="w-5 h-5" />
              Time Tracking
              {activeTab === "timetracking" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>

          {/* Content */}
          <div className="relative overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)] md:max-h-[calc(85vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center p-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                />
              </div>
            ) : task ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-6 md:p-8"
              >
                {activeTab === "details" ? (
                  <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Title */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <SparklesIcon className="w-4 h-4" />
                        Title
                      </label>
                      {isEditing ? (
                        <motion.input
                          ref={titleInputRef}
                          initial={{ scale: 0.98 }}
                          animate={{ scale: 1 }}
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            handleFormChange("title", e.target.value)
                          }
                          className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium backdrop-blur-sm"
                          placeholder="Enter task title..."
                        />
                      ) : (
                        <motion.h3
                          className="text-2xl font-bold text-gray-900 dark:text-white p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                          whileHover={{ scale: 1.01 }}
                        >
                          {task.title}
                        </motion.h3>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <DocumentTextIcon className="w-4 h-4" />
                        Description
                      </label>
                      {isEditing ? (
                        <motion.textarea
                          initial={{ scale: 0.98 }}
                          animate={{ scale: 1 }}
                          value={editForm.description}
                          onChange={(e) =>
                            handleFormChange("description", e.target.value)
                          }
                          rows={4}
                          className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm resize-none"
                          placeholder="Describe the task..."
                        />
                      ) : (
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 min-h-[120px]">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {task.description || "No description provided"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status and Priority Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <CheckCircleIcon className="w-4 h-4" />
                          Status
                        </label>
                        {isEditing ? (
                          <motion.select
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            value={editForm.status}
                            onChange={(e) =>
                              handleFormChange("status", e.target.value)
                            }
                            className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                          >
                            <option value="NEW">New</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </motion.select>
                        ) : (
                          <motion.div
                            className={`flex items-center gap-3 p-4 rounded-2xl ${
                              getStatusConfig(task.status).bg
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className={getStatusConfig(task.status).color}>
                              {getStatusConfig(task.status).icon}
                            </div>
                            <span
                              className={`font-semibold ${
                                getStatusConfig(task.status).text
                              }`}
                            >
                              {getStatusConfig(task.status).label}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <FlagIconSolid className="w-4 h-4" />
                          Priority
                        </label>
                        {isEditing ? (
                          <motion.select
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            value={editForm.priority}
                            onChange={(e) =>
                              handleFormChange("priority", e.target.value)
                            }
                            className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </motion.select>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${
                              getPriorityConfig(task.priority).color
                            }`}
                          >
                            {getPriorityConfig(task.priority).icon}
                            {task.priority}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <CalendarIcon className="w-4 h-4" />
                        Due Date
                      </label>
                      {isEditing ? (
                        <motion.input
                          initial={{ scale: 0.98 }}
                          animate={{ scale: 1 }}
                          type="date"
                          value={editForm.dueDate}
                          onChange={(e) =>
                            handleFormChange("dueDate", e.target.value)
                          }
                          className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                        />
                      ) : (
                        <motion.div
                          className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                          whileHover={{ scale: 1.01 }}
                        >
                          <CalendarIcon className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {task.dueDate
                              ? formatLongDate(task.dueDate)
                              : "No due date set"}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Workspace */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        Workspace
                      </label>
                      {isEditing ? (
                        <motion.select
                          initial={{ scale: 0.98 }}
                          animate={{ scale: 1 }}
                          value={selectedWorkspaceId || ""}
                          onChange={(e) =>
                            handleWorkspaceChange(
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                        >
                          <option value="">Select Workspace</option>
                          {Array.isArray(userWorkspaces) && userWorkspaces.map((workspace) => (
                            <option key={workspace.id} value={workspace.id}>
                              {workspace.name}
                            </option>
                          ))}
                        </motion.select>
                      ) : (
                        <motion.div
                          className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                          whileHover={{ scale: 1.01 }}
                        >
                          <BuildingOfficeIcon className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {task.workspace?.name || "No workspace assigned"}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Hours Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <ClockIcon className="w-4 h-4" />
                          Estimated Hours
                        </label>
                        {isEditing ? (
                          <motion.input
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            type="number"
                            min="0"
                            step="0.5"
                            value={editForm.estimatedHours}
                            onChange={(e) =>
                              handleFormChange("estimatedHours", e.target.value)
                            }
                            onBlur={() => {
                              if (hasChanges) {
                                if (autoSaveTimeoutRef.current) {
                                  clearTimeout(autoSaveTimeoutRef.current);
                                }
                                autoSave();
                              }
                            }}
                            className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                            placeholder="Hours"
                          />
                        ) : (
                          <motion.div
                            className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                            whileHover={{ scale: 1.01 }}
                          >
                            <ClockIcon className="w-5 h-5 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {task.estimatedHours
                                ? `${task.estimatedHours}h estimated`
                                : "No estimation"}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <ClockIcon className="w-4 h-4" />
                          Actual Hours
                        </label>
                        {isEditing ? (
                          <motion.input
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            type="number"
                            min="0"
                            step="0.5"
                            value={editForm.actualHours}
                            onChange={(e) =>
                              handleFormChange("actualHours", e.target.value)
                            }
                            onBlur={() => {
                              if (hasChanges) {
                                if (autoSaveTimeoutRef.current) {
                                  clearTimeout(autoSaveTimeoutRef.current);
                                }
                                autoSave();
                              }
                            }}
                            className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                            placeholder="Hours"
                          />
                        ) : (
                          <motion.div
                            className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                            whileHover={{ scale: 1.01 }}
                          >
                            <ClockIcon className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {task.actualHours
                                ? `${task.actualHours}h actual`
                                : "No time logged"}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Assigned User */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <UserCircleIcon className="w-4 h-4" />
                        Assigned To
                      </label>
                      {isEditing ? (
                        <motion.select
                          initial={{ scale: 0.98 }}
                          animate={{ scale: 1 }}
                          value={selectedAssignee || ""}
                          onChange={(e) =>
                            handleAssigneeChange(
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                        >
                          <option value="">Unassigned</option>
                          {workspaceMembers.map((member) => (
                            <option key={member.user.id} value={member.user.id}>
                              {member.user.firstName} {member.user.lastName} (
                              {member.user.email})
                            </option>
                          ))}
                        </motion.select>
                      ) : (
                        <motion.div
                          className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                          whileHover={{ scale: 1.01 }}
                        >
                          {task.assignedTo ? (
                            <>
                              {task.assignedTo.avatar ? (
                                <img
                                  src={task.assignedTo.avatar}
                                  alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                              )}
                              <div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {task.assignedTo.firstName}{" "}
                                  {task.assignedTo.lastName}
                                </span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {task.assignedTo.email}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <UserCircleIcon className="w-8 h-8 text-gray-400" />
                              <span className="text-gray-500 dark:text-gray-400 font-medium">
                                Unassigned
                              </span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Attachments */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <DocumentTextIcon className="w-4 h-4" />
                        Attachments ({task.attachments?.length || 0})
                      </label>

                      {/* File Upload Area */}
                      <motion.div
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            handleFileUpload(files);
                          }
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleFileUpload(e.target.files);
                            }
                          }}
                        />

                        {uploadingFiles ? (
                          <div className="space-y-2">
                            <ArrowPathIcon className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Uploading files...
                            </p>
                            {Object.entries(uploadProgress).map(
                              ([filename, progress]) => (
                                <div
                                  key={filename}
                                  className="w-full bg-gray-200 rounded-full h-2"
                                >
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {filename}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div>
                            <DocumentTextIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Drop files here or{" "}
                              <button
                                onClick={handleFileSelect}
                                className="text-blue-500 hover:text-blue-600 font-medium"
                              >
                                browse
                              </button>
                            </p>
                            <p className="text-xs text-gray-500">
                              Maximum file size: 10MB
                            </p>
                          </div>
                        )}
                      </motion.div>

                      {/* Attachments List */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="space-y-2">
                          {task.attachments.map((attachment) => (
                            <motion.div
                              key={attachment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {attachmentService.getFileTypeIcon(
                                    attachment.contentType
                                  )}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {attachment.originalName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {attachmentService.formatFileSize(
                                      attachment.size
                                    )}{" "}
                                    •{" "}
                                    {formatDate(attachment.uploadedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    attachmentService.downloadAttachment(
                                      attachment.id
                                    )
                                  }
                                  className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                {isEditing && (
                                  <button
                                    onClick={() =>
                                      handleDeleteAttachment(attachment.id)
                                    }
                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeTab === "notes" ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <motion.h3
                        className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3"
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                      >
                        <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                        Notes
                      </motion.h3>
                    </div>

                    <motion.div
                      initial={{ scale: 0.98 }}
                      animate={{ scale: 1 }}
                      className="relative"
                    >
                      <textarea
                        value={editForm.notes}
                        onChange={(e) =>
                          handleFormChange("notes", e.target.value)
                        }
                        rows={10}
                        placeholder=" Start writing your notes here... 
Document your thoughts, research, and progress"
                        className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 font-mono text-sm sm:text-base leading-relaxed backdrop-blur-sm resize-none shadow-inner"
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500">
                        {editForm.notes.length} characters
                      </div>
                    </motion.div>

                    {!editForm.notes && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 space-y-4"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <BookOpenIcon className="w-16 h-16 mx-auto text-purple-300 dark:text-purple-600" />
                        </motion.div>
                        <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                          Your digital notebook awaits
                        </h4>
                        <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                          Click above to start documenting thoughts, research,
                          progress updates, or anything related to this task.
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <TimeTrackingPanel taskId={taskId} />
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>

          {/* Status Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <UserCircleIcon className="w-4 h-4" />
                  <span>Auto-save enabled</span>
                </div>
                {hasChanges && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span>Unsaved changes</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

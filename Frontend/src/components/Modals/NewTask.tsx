import React, { useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  FolderIcon,
  TagIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import type { ICreateTaskRequest } from "../../types/task.types";
import type { IWorkspaceName } from "../../types/workspace.types";
import type { ICategoryResponse } from "../../types/category.types";

import {
  taskStatusService,
  type ITaskStatus,
} from "../../services/Tasks/taskStatus.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { categoryService } from "../../services/Category/category.service";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: ICreateTaskRequest, attachments: File[]) => void;
  initialStatusId?: number;
  initialWorkspaceId?: number;
  initialDate?: Date;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialStatusId,
  initialWorkspaceId,
  initialDate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState<number | null>(
    initialWorkspaceId || null
  );
  const [statusId, setStatusId] = useState<number | null>(
    initialStatusId || null
  );
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number | null>(null);
  const [actualHours, setActualHours] = useState<number | null>(null);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [workspaces, setWorkspaces] = useState<IWorkspaceName[]>([]);
  const [statuses, setStatuses] = useState<ITaskStatus[]>([]);
  const [categories, setCategories] = useState<ICategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await workspaceService.getWorkspacesFromUserList();
      setWorkspaces(data);
      if (!initialWorkspaceId && data.length > 0) {
        setWorkspaceId(Number(data[0].id));
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    }
  }, [initialWorkspaceId]);

  const loadStatuses = useCallback(
    async (wsId: number) => {
      try {
        const data = await taskStatusService.getStatusesForWorkspace(wsId);
        setStatuses(data);
        if (!initialStatusId && data.length > 0) {
          setStatusId(data[0].id);
        } else if (initialStatusId) {
          setStatusId(initialStatusId);
        }
      } catch (error) {
        console.error("Error loading statuses:", error);
        setStatuses([]);
      }
    },
    [initialStatusId]
  );

  const loadCategories = useCallback(async (wsId: number) => {
    setIsLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategoriesFromWorkspace(
        wsId.toString()
      );
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // --- EFEITOS (useEffect) ---
  useEffect(() => {
    if (isOpen) {
      loadWorkspaces();
      if (initialDate) {
        const date = new Date(initialDate);
        setDueDate(date.toLocaleDateString().slice(0, 16));
      }
    }
  }, [isOpen, loadWorkspaces, initialDate]);

  useEffect(() => {
    if (workspaceId) {
      loadStatuses(workspaceId);
      loadCategories(workspaceId);
    } else {
      setStatuses([]);
      setCategories([]);
    }
  }, [workspaceId, loadStatuses, loadCategories]);

  // --- HANDLERS DE FORMULÁRIO E CATEGORIAS ---
  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorkspaceId = Number(e.target.value);
    setWorkspaceId(newWorkspaceId);
    // Reseta status e categorias ao trocar de workspace
    setStatusId(null);
    setCategoryIds([]);
  };

  const createAndAddCategory = async () => {
    if (!newCategoryName.trim() || !workspaceId) return;
    try {
      const newCategory = await categoryService.createCategory({
        name: newCategoryName.trim(),
        description: "",
        workspaceId: workspaceId.toString(),
      });
      setCategories((prev) => [...prev, newCategory]);
      setCategoryIds((prev) => [...prev, parseInt(newCategory.id)]);
      setNewCategoryName("");
      setShowNewCategoryForm(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // --- HANDLERS DE ANEXOS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // --- VALIDAÇÃO E SUBMISSÃO ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!workspaceId) newErrors.workspace = "Workspace is required";
    if (!statusId) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !workspaceId || !statusId) return;

    setLoading(true);

    const taskData: ICreateTaskRequest = {
      title,
      description: description || "",
      workspaceId,
      statusId,
      priority,
      dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : null,
      estimatedHours: estimatedHours || undefined,
      actualHours: actualHours || undefined,
      categoryIds: categoryIds.length > 0 ? categoryIds : [],
    };

    try {
      await onSubmit(taskData, attachments);
      handleClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LIMPEZA E RESET ---
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setWorkspaceId(initialWorkspaceId || null);
    setStatusId(initialStatusId || null);
    setPriority("MEDIUM");
    setDueDate("");
    setEstimatedHours(null);
    setActualHours(null);
    setCategoryIds([]);
    setAttachments([]);
    setErrors({});
    setShowNewCategoryForm(false);
    setNewCategoryName("");
    onClose();
  };

  // --- FUNÇÕES AUXILIARES E ESTILOS ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const priorityClasses = {
    LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    MEDIUM:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    URGENT:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* The overlay (background) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Wrapper to center the modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* The modal panel itself */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Create New Task
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Add a new task to your workflow
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </Dialog.Title>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 max-h-[70vh] overflow-y-auto pr-4"
                >
                  {/* O RESTO DO SEU FORMULÁRIO PERMANECE EXATAMENTE O MESMO AQUI */}
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.title
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter task title..."
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Add a description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Workspace */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FolderIcon className="w-4 h-4" />
                          Workspace *
                        </span>
                      </label>
                      <select
                        value={workspaceId || ""}
                        onChange={handleWorkspaceChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.workspace
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        disabled={!!initialWorkspaceId}
                      >
                        <option value="">Select workspace</option>
                        {workspaces.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name}
                          </option>
                        ))}
                      </select>
                      {errors.workspace && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.workspace}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status *
                      </label>
                      <select
                        value={statusId || ""}
                        onChange={(e) => setStatusId(Number(e.target.value))}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.status
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        disabled={!workspaceId}
                      >
                        <option value="">Select status</option>
                        {statuses.map((status) => (
                          <option
                            key={status.id}
                            value={status.id}
                            style={{ color: status.color }}
                          >
                            {status.name}
                          </option>
                        ))}
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FlagIcon className="w-4 h-4" />
                          Priority
                        </span>
                      </label>
                      <div className="flex gap-2">
                        {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map(
                          (p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                priority === p
                                  ? priorityClasses[p]
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Due Date
                        </span>
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Estimated Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          Estimated Hours
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={estimatedHours || ""}
                        onChange={(e) =>
                          setEstimatedHours(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 4.5"
                      />
                    </div>
                    {/* Actual Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          Actual Hours
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={actualHours || ""}
                        onChange={(e) =>
                          setActualHours(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  {workspaceId && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <span className="flex items-center gap-2">
                            <TagIcon className="w-4 h-4" />
                            Categories
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewCategoryForm(!showNewCategoryForm)
                          }
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          + New Category
                        </button>
                      </div>
                      {showNewCategoryForm && (
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name..."
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                          />
                          <button
                            type="button"
                            onClick={createAndAddCategory}
                            disabled={!newCategoryName.trim()}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      )}
                      {isLoadingCategories ? (
                        <p>Loading categories...</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleCategory(parseInt(cat.id))}
                              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                                categoryIds.includes(parseInt(cat.id))
                                  ? "bg-blue-100 text-blue-800 border-blue-200 ring-2 ring-blue-500"
                                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <PaperClipIcon className="w-4 h-4" />
                        Attachments
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <label className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Click to upload files
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Max 10MB each
                      </p>
                    </div>
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm"
                          >
                            <p className="truncate max-w-xs">
                              {file.name}{" "}
                              <span className="text-gray-500">
                                ({formatFileSize(file.size)})
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? "Creating..." : "Create Task"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { workspaceService } from "../../services/Workspace/workspace.service";
import type { IWorkspaceName } from "../../types/workspace.types";
import type { ICategoryResponse } from "../../types/category.types";
import type { ICreateTaskRequest } from "../../types/task.types";
import { categoryService } from "../../services/Category/category.service";

export interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (taskData: ICreateTaskRequest) => void;
}

export interface NewTaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  categoryIds: string[];
  workspaceId: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<NewTaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    categoryIds: [],
    workspaceId: "",
  });

  const [workspaces, setWorkspaces] = useState<IWorkspaceName[]>([]);
  const [categories, setCategories] = useState<ICategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workspaceId) {
      alert("Please select a workspace");
      return;
    }
    onSubmit?.({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      workspaceId: formData.workspaceId,
      categories: formData.categoryIds,
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      categoryIds: [],
      workspaceId: "",
    });
    setNewCategoryName("");
    setShowNewCategoryForm(false);
    onClose();
  };

  const createAndAddCategory = async () => {
    if (!newCategoryName.trim() || !formData.workspaceId) return;

    try {
      const newCategory = await categoryService.createCategory({
        name: newCategoryName.trim(),
        description: "",
        workspaceId: formData.workspaceId,
      });

      setCategories((prev) => [...prev, newCategory]);
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, newCategory.id],
      });
      setNewCategoryName("");
      setShowNewCategoryForm(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const isSelected = formData.categoryIds.includes(categoryId);
    setFormData({
      ...formData,
      categoryIds: isSelected
        ? formData.categoryIds.filter((id) => id !== categoryId)
        : [...formData.categoryIds, categoryId],
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      createAndAddCategory();
    }
  };

  useEffect(() => {
    if (formData.workspaceId) {
      loadCategories(formData.workspaceId);
    } else {
      setCategories([]);
    }
  }, [formData.workspaceId]);

  const loadWorkspaces = React.useCallback(async () => {
    try {
      const workspaces = await workspaceService.getWorkspacesFromUser();
      setWorkspaces(workspaces);

      if (!formData.workspaceId && workspaces.length > 0) {
        setFormData((prev) => ({
          ...prev,
          workspaceId: workspaces[0].id,
        }));
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    }
  }, [formData.workspaceId]);

  useEffect(() => {
    if (isOpen) {
      loadWorkspaces();
    }
  }, [isOpen, loadWorkspaces]);

  const loadCategories = async (workspaceId: string) => {
    setIsLoadingCategories(true);
    try {
      const categories = await categoryService.getAllCategoriesFromWorkspace(
        workspaceId
      );
      setCategories(categories);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const selectedCategories = categories.filter((cat) =>
    formData.categoryIds.includes(cat.id)
  );

  const priorityColors = {
    low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    medium:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
    high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create New Task
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Add a new task to your workflow
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Workspace Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workspace *
                  </label>
                  <select
                    required
                    value={formData.workspaceId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workspaceId: e.target.value,
                        categoryIds: [],
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a workspace...</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter task title..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your task..."
                  />
                </div>

                {/* Priority and Due Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "medium", "high"] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority })}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            formData.priority === priority
                              ? priorityColors[priority]
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Categories */}
                {formData.workspaceId && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Categories
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

                    {/* Selected Categories */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedCategories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                          >
                            {category.name}
                            <button
                              type="button"
                              onClick={() => toggleCategory(category.id)}
                              className="ml-2 text-blue-800/80 hover:text-blue-800 dark:text-blue-300/80 dark:hover:text-blue-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* New Category Form */}
                    {showNewCategoryForm && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-3">
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyUp={handleKeyPress}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            placeholder="Category name..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={createAndAddCategory}
                            disabled={!newCategoryName.trim()}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Create & Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewCategoryForm(false)}
                            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Available Categories */}
                    {isLoadingCategories ? (
                      <div className="text-center py-4 text-gray-500">
                        Loading categories...
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                              formData.categoryIds.includes(category.id)
                                ? "bg-blue-100 text-blue-800 border-blue-200 ring-2 ring-blue-500 scale-105 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:scale-105 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                            }`}
                          >
                            {category.name}
                            {formData.categoryIds.includes(category.id) && (
                              <span className="ml-1">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No categories in this workspace. Create one above!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.workspaceId || !formData.title.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

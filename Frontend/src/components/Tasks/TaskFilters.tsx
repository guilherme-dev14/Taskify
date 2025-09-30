import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface WorkspaceOption {
  id: string | number;
  name: string;
  color?: string;
}

interface TaskFiltersProps {
  workspaces: WorkspaceOption[];
  selectedWorkspace: string | number;
  onWorkspaceChange: (id: string | number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  onAddNewTask: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = (props) => {
  const {
    workspaces,
    selectedWorkspace,
    onWorkspaceChange,
    searchTerm,
    onSearchChange,
    onAddNewTask,
  } = props;

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  return (
    <>
      {/* Modern Workspace Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-xs">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            <BuildingOfficeIcon className="w-4 h-4" />
            Workspace
          </label>

          <div className="relative">
            <button
              onClick={() =>
                setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
              }
              className="w-full px-4 py-3 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {workspaces?.find((w) => w.id === selectedWorkspace)?.name ||
                    "Select Workspace"}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300 ${
                  isWorkspaceDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isWorkspaceDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 overflow-hidden"
                >
                  {workspaces?.map((workspace, index) => (
                    <motion.button
                      key={workspace.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onWorkspaceChange(workspace.id);
                        setIsWorkspaceDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 flex items-center gap-3 group ${
                        selectedWorkspace === workspace.id
                          ? "bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          selectedWorkspace === workspace.id
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-125"
                            : "bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400"
                        }`}
                      ></div>
                      <span className="font-medium">{workspace.name}</span>
                      {selectedWorkspace === workspace.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Search and Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={onAddNewTask}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Add Task
        </button>
      </motion.div>
    </>
  );
};

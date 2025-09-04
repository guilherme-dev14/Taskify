import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  PlayIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useHotkeys } from "react-hotkeys-hook";

interface QuickActionsToolbarProps {
  onCreateTask?: () => void;
  onStartTimer?: () => void;
  onViewReports?: () => void;
  onOpenSettings?: () => void;
  onGlobalSearch?: () => void;
}

const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onCreateTask,
  onStartTimer,
  onViewReports,
  onOpenSettings,
  onGlobalSearch,
}) => {
  const [, setIsCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts
  useHotkeys("ctrl+n,cmd+n", (e) => {
    e.preventDefault();
    onCreateTask?.();
  });

  useHotkeys("ctrl+k,cmd+k", (e) => {
    e.preventDefault();
    setIsCommandPaletteOpen(true);
    onGlobalSearch?.();
  });

  useHotkeys("ctrl+shift+t,cmd+shift+t", (e) => {
    e.preventDefault();
    onStartTimer?.();
  });

  const actions = [
    {
      id: "create-task",
      label: "Create Task",
      shortcut: "⌘N",
      icon: PlusIcon,
      onClick: onCreateTask,
      className: "bg-blue-600 hover:bg-blue-700 text-white",
      primary: true,
    },
    {
      id: "start-timer",
      label: "Start Timer",
      shortcut: "⌘⇧T",
      icon: PlayIcon,
      onClick: onStartTimer,
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
      id: "global-search",
      label: "Search",
      shortcut: "⌘K",
      icon: MagnifyingGlassIcon,
      onClick: onGlobalSearch,
      className: "bg-gray-600 hover:bg-gray-700 text-white",
    },
    {
      id: "view-reports",
      label: "Reports",
      icon: ChartBarIcon,
      onClick: onViewReports,
      className: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Cog6ToothIcon,
      onClick: onOpenSettings,
      className: "bg-gray-600 hover:bg-gray-700 text-white",
    },
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Use keyboard shortcuts for faster access
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;

          return (
            <motion.button
              key={action.id}
              onClick={action.onClick}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg
                transition-all duration-200 transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${action.className}
                ${
                  action.primary ? "px-6 py-3 text-base font-medium" : "text-sm"
                }
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconComponent
                className={`${action.primary ? "w-5 h-5" : "w-4 h-4"}`}
              />
              <span>{action.label}</span>

              {action.shortcut && (
                <kbd className="ml-2 px-2 py-1 text-xs bg-black/10 rounded border border-white/20">
                  {action.shortcut}
                </kbd>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              12
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Active Tasks
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              3h 45m
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Today's Time
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              8
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Completed
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              2
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Overdue
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActionsToolbar;

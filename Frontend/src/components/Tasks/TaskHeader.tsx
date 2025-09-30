import React from "react";
import { motion } from "framer-motion";
import { OnlineIndicator } from "../Presence/OnlineIndicator";

interface OnlineUser {
  id: string;
  name: string;
}

interface TasksHeaderProps {
  onlineUsers: OnlineUser[];
  selectedWorkspaceId: string | number;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  onlineUsers,
  selectedWorkspaceId,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize your tasks efficiently
          </p>
        </div>

        {/* Online Users Indicator */}
        {selectedWorkspaceId !== "all" && onlineUsers.length > 0 && (
          <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 dark:border-gray-700/50">
            <OnlineIndicator isOnline={true} size="md" />
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {onlineUsers.length} online
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {onlineUsers
                  .slice(0, 3)
                  .map((user) => user.name)
                  .join(", ")}
                {onlineUsers.length > 3 && ` +${onlineUsers.length - 3} more`}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

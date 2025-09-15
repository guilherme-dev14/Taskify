import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useWebSocket } from "../../hooks/useWebSocket";
import {
  useUserActivities,
  useActivityUpdates,
  useClearUserActivities,
} from "../../hooks/useActivity";
import { useAuth } from "../../hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

import type { IActivityItem } from "../../services/Activity/activity.service";

const ActivityFeed: React.FC = () => {
  const { isConnected } = useWebSocket();
  const { user } = useAuth();

  const {
    data: activitiesResponse,
    isLoading,
    error,
    refetch,
  } = useUserActivities(user?.id || 0, { size: 20 });

  const activities = activitiesResponse?.content || [];
  const clearActivitiesMutation = useClearUserActivities();

  useActivityUpdates(() => {});

  const handleClearActivities = async () => {
    if (!user?.id) return;

    try {
      await clearActivitiesMutation.mutateAsync(user.id);
    } catch (error) {
      console.error("Error clearing activities:", error);
    }
  };

  const getActivityIcon = (type: IActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return CheckCircleIcon;
      case "task_created":
        return DocumentPlusIcon;
      case "timer_started":
      case "timer_stopped":
        return ClockIcon;
      case "comment_added":
        return ChatBubbleLeftIcon;
      case "user_joined":
        return UserPlusIcon;
      case "deadline_approaching":
        return ExclamationTriangleIcon;
      default:
        return ArrowPathIcon;
    }
  };

  const getActivityColor = (type: IActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "task_created":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "timer_started":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "timer_stopped":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
      case "comment_added":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/20";
      case "user_joined":
        return "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20";
      case "deadline_approaching":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <ArrowPathIcon className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 dark:text-red-400 mb-2">
            Failed to load activities
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Activity Feed
        </h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Live Updates
            </span>
          </div>

          {activities.length > 0 && (
            <button
              onClick={handleClearActivities}
              disabled={clearActivitiesMutation.isPending}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear activities"
            >
              <TrashIcon className="w-3 h-3" />
              <span>
                {clearActivitiesMutation.isPending ? "Clearing..." : "Clear"}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Activity Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>

                  {/* User Info */}
                  <div className="flex items-center space-x-2 mt-2">
                    {activity.user.avatar ? (
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-4 h-4 rounded-full"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.user.name}
                    </span>

                    {activity.metadata?.workspaceName && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.metadata.workspaceName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <ArrowPathIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      )}

      {/* Load More Button */}
      {activities.length > 0 && (
        <motion.div
          className="pt-4 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => refetch()}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Refresh activities
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;

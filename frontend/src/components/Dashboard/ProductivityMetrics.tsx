import React from "react";
import { motion } from "framer-motion";
import {
  FireIcon,
  TrophyIcon,
  ClockIcon,
  TagIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import type { TaskStats } from "../../stores/task.store";

interface ProductivityMetricsProps {
  stats: TaskStats | null;
}

const ProductivityMetrics: React.FC<ProductivityMetricsProps> = () => {
  // Mock productivity data for demonstration
  const productivityData = {
    todayCompleted: 8,
    todayTarget: 10,
    weeklyStreak: 5,
    focusTime: 4.5, // hours
    efficiency: 92,
    weeklyGoalProgress: 78,
  };

  const metrics = [
    {
      title: "Daily Progress",
      value: `${productivityData.todayCompleted}/${productivityData.todayTarget}`,
      subtext: "tasks completed",
      icon: TagIcon,
      progress:
        (productivityData.todayCompleted / productivityData.todayTarget) * 100,
      color: "blue",
      trend: "+2 from yesterday",
    },
    {
      title: "Weekly Streak",
      value: productivityData.weeklyStreak,
      subtext: "days productive",
      icon: FireIcon,
      color: "orange",
      trend: "🔥 On fire!",
    },
    {
      title: "Focus Time",
      value: `${productivityData.focusTime}h`,
      subtext: "deep work today",
      icon: ClockIcon,
      color: "green",
      trend: "+30min from avg",
    },
    {
      title: "Efficiency",
      value: `${productivityData.efficiency}%`,
      subtext: "task completion",
      icon: TrophyIcon,
      progress: productivityData.efficiency,
      color: "purple",
      trend: "+5% this week",
    },
    {
      title: "Weekly Goal",
      value: `${productivityData.weeklyGoalProgress}%`,
      subtext: "progress",
      icon: ArrowTrendingUpIcon,
      progress: productivityData.weeklyGoalProgress,
      color: "indigo",
      trend: "22% ahead of schedule",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        icon: "text-blue-500",
        progress: "bg-blue-500",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-600 dark:text-orange-400",
        icon: "text-orange-500",
        progress: "bg-orange-500",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
        icon: "text-green-500",
        progress: "bg-green-500",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-600 dark:text-purple-400",
        icon: "text-purple-500",
        progress: "bg-purple-500",
      },
      indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        text: "text-indigo-600 dark:text-indigo-400",
        icon: "text-indigo-500",
        progress: "bg-indigo-500",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Productivity Metrics
        </h2>

        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View Details
        </button>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colors = getColorClasses(metric.color);

          return (
            <motion.div
              key={metric.title}
              className={`${colors.bg} rounded-lg p-4`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {metric.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metric.subtext}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {metric.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {metric.trend}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {metric.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Progress
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {Math.round(metric.progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`${colors.progress} h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <motion.div
        className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          This Week's Summary
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              34
            </div>
            <div className="text-xs text-green-500 dark:text-green-400">
              Tasks Completed
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              28.5h
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400">
              Total Focus Time
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium">
            View Detailed Analytics →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductivityMetrics;

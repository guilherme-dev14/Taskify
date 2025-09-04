import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import type { TaskStats } from "../../stores/task.store";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface TaskProgressOverviewProps {
  stats: TaskStats | null;
  isLoading?: boolean;
}

const TaskProgressOverview: React.FC<TaskProgressOverviewProps> = ({
  stats,
  isLoading,
}) => {
  const statusData = useMemo(() => {
    if (!stats) return null;

    return {
      labels: ["To Do", "In Progress", "Review", "Done"],
      datasets: [
        {
          data: [
            stats.tasksByStatus.NEW || 0,
            stats.tasksByStatus.IN_PROGRESS || 0,
            stats.tasksByStatus.REVIEW || 0,
            stats.tasksByStatus.DONE || 0,
          ],
          backgroundColor: [
            "#EF4444", // Red for To Do
            "#F59E0B", // Amber for In Progress
            "#3B82F6", // Blue for Review
            "#10B981", // Green for Done
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [stats]);

  const priorityData = useMemo(() => {
    if (!stats) return null;

    return {
      labels: ["Low", "Medium", "High", "Urgent"],
      datasets: [
        {
          label: "Tasks by Priority",
          data: [
            stats.tasksByPriority.LOW || 0,
            stats.tasksByPriority.MEDIUM || 0,
            stats.tasksByPriority.HIGH || 0,
            stats.tasksByPriority.URGENT || 0,
          ],
          backgroundColor: [
            "#10B981", // Green for Low
            "#F59E0B", // Amber for Medium
            "#EF4444", // Red for High
            "#DC2626", // Dark red for Urgent
          ],
        },
      ],
    };
  }, [stats]);

  const trendData = useMemo(() => {
    if (!stats?.productivityTrend) return null;

    const last7Days = stats.productivityTrend.slice(-7);

    return {
      labels: last7Days.map((item) =>
        new Date(item.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: "Completed Tasks",
          data: last7Days.map((item) => item.completed),
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Created Tasks",
          data: last7Days.map((item) => item.created),
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: "60%",
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: "right" as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Task Progress Overview
        </h2>

        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {completionRate}%
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Completion Rate
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalTasks}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Total Tasks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <motion.div
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            Task Status Distribution
          </h3>
          {statusData && (
            <div className="h-48 relative">
              <Doughnut data={statusData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.completedTasks}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Completed
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            Priority Distribution
          </h3>
          {priorityData && (
            <div className="h-48">
              <Bar data={priorityData} options={chartOptions} />
            </div>
          )}
        </motion.div>

        {/* Productivity Trend */}
        <motion.div
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            7-Day Productivity Trend
          </h3>
          {trendData && (
            <div className="h-48">
              <Line data={trendData} options={chartOptions} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {stats.overdueTasks}
            </div>
            <div className="text-xs text-red-500 dark:text-red-400">
              Overdue Tasks
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {stats.tasksByStatus.IN_PROGRESS || 0}
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400">
              In Progress
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {Math.round(stats.averageCompletionTime)} hrs
            </div>
            <div className="text-xs text-green-500 dark:text-green-400">
              Avg. Completion
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.tasksByPriority.URGENT || 0}
            </div>
            <div className="text-xs text-purple-500 dark:text-purple-400">
              Urgent Tasks
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskProgressOverview;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
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
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useDashboardAnalytics } from "../../hooks/useAnalytics";
import { useWebSocket } from "../../hooks/useWebSocket";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface AnalyticsDashboardProps {
  workspaceId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  workspaceId,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  const { analyticsOverview, distribution, isLoading, isError, refetchAll } =
    useDashboardAnalytics({
      workspaceId,
      period: selectedPeriod,
    });
  const { on, off, isConnected } = useWebSocket();

  const prevPeriod = useRef(selectedPeriod);
  useEffect(() => {
    if (prevPeriod.current !== selectedPeriod) {
      prevPeriod.current = selectedPeriod;
      refetchAll();
    }
  }, [selectedPeriod, refetchAll]);

  useEffect(() => {
    const handleDataUpdate = () => {
      setTimeout(() => refetchAll(), 1000);
    };

    on("task:created", handleDataUpdate);
    on("task:updated", handleDataUpdate);
    on("task:deleted", handleDataUpdate);
    on("workspace:updated", handleDataUpdate);

    return () => {
      off("task:created", handleDataUpdate);
      off("task:updated", handleDataUpdate);
      off("task:deleted", handleDataUpdate);
      off("workspace:updated", handleDataUpdate);
    };
  }, [on, off, refetchAll]);

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowPathIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to load analytics data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              There was an error loading the analytics dashboard
            </p>
            <button
              onClick={refetchAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280" },
      },
      y: {
        grid: { color: "#E5E7EB" },
        ticks: { color: "#6B7280" },
      },
    },
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>

        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex items-center mt-4">
        {change >= 0 ? (
          <ArrowUpIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="w-4 h-4 text-red-500" />
        )}
        <span
          className={`text-sm font-medium ml-1 ${
            change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          vs last {selectedPeriod}
        </span>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isConnected ? "Live Updates" : "Offline"}
              </span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive insights into your team's productivity and performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={refetchAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Tasks"
          value={analyticsOverview.data?.totalTasks || 0}
          change={12}
          icon={CheckCircleIcon}
          color="bg-blue-500"
        />

        <MetricCard
          title="Completion Rate"
          value={
            analyticsOverview.data
              ? `${(
                  (analyticsOverview.data.completedTasks /
                    analyticsOverview.data.totalTasks) *
                  100
                ).toFixed(2)}%`
              : "0%"
          }
          change={8}
          icon={ArrowTrendingUpIcon}
          color="bg-green-500"
        />

        <MetricCard
          title="Time Spent"
          value={
            analyticsOverview.data
              ? `${(analyticsOverview.data.totalTimeSpent / 60).toFixed(2)}h`
              : "0h"
          }
          change={5}
          icon={ClockIcon}
          color="bg-purple-500"
        />

        <MetricCard
          title="Team Efficiency"
          value={
            analyticsOverview.data
              ? `${Number(analyticsOverview.data.teamEfficiency).toFixed(2)}%`
              : "0%"
          }
          change={3}
          icon={UserGroupIcon}
          color="bg-indigo-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Distribution */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Status
          </h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: distribution.data?.tasksByStatus?.labels || ["No data"],
                datasets: [
                  {
                    data: distribution.data?.tasksByStatus?.data || [1],
                    backgroundColor: distribution.data?.tasksByStatus
                      ?.colors || ["#E5E7EB"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: "right" as const,
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks by Priority
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: distribution.data?.tasksByPriority?.labels || [
                  "No data",
                ],
                datasets: [
                  {
                    label: "Tasks",
                    data: distribution.data?.tasksByPriority?.data || [0],
                    backgroundColor: distribution.data?.tasksByPriority
                      ?.colors || ["#E5E7EB"],
                    borderRadius: 6,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

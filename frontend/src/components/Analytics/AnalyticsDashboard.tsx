/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
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
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useDashboardStats } from "../../hooks/useTasks";

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

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [selectedMetric, setSelectedMetric] = useState<
    "tasks" | "time" | "productivity" | "team"
  >("tasks");

  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  // Mock comprehensive analytics data
  const analyticsData = {
    overview: {
      totalTasks: 248,
      completedTasks: 186,
      totalTimeSpent: 1247, // minutes
      averageCompletionTime: 3.2, // days
      productivityScore: 87,
      teamEfficiency: 92,
    },
    trends: {
      taskCompletion: [65, 72, 68, 85, 78, 92, 88, 95, 89, 94, 91, 96],
      timeSpent: [120, 135, 110, 155, 140, 165, 158, 175, 162, 180, 172, 188],
      productivity: [78, 82, 75, 88, 85, 91, 87, 94, 90, 95, 92, 96],
    },
    distribution: {
      tasksByStatus: {
        labels: ["Completed", "In Progress", "To Do", "Blocked"],
        data: [186, 32, 24, 6],
        colors: ["#10B981", "#3B82F6", "#6B7280", "#EF4444"],
      },
      tasksByPriority: {
        labels: ["Low", "Medium", "High", "Urgent"],
        data: [98, 85, 52, 13],
        colors: ["#10B981", "#F59E0B", "#EF4444", "#DC2626"],
      },
      timeByCategory: {
        labels: ["Development", "Design", "Testing", "Meetings", "Planning"],
        data: [45, 22, 15, 12, 6],
        colors: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"],
      },
    },
    team: {
      members: [
        { name: "John Doe", completed: 42, timeSpent: 280, efficiency: 94 },
        { name: "Jane Smith", completed: 38, timeSpent: 265, efficiency: 91 },
        { name: "Mike Johnson", completed: 35, timeSpent: 245, efficiency: 89 },
        { name: "Sarah Wilson", completed: 33, timeSpent: 235, efficiency: 87 },
        { name: "David Kim", completed: 28, timeSpent: 195, efficiency: 85 },
      ],
    },
  };

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

  const trendData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Task Completion Rate",
        data: analyticsData.trends.taskCompletion,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Productivity Score",
        data: analyticsData.trends.productivity,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  if (statsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive insights into your team's productivity and performance
          </p>
        </div>

        <div className="flex items-center space-x-4">
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

          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Tasks"
          value={analyticsData.overview.totalTasks}
          change={12}
          icon={CheckCircleIcon}
          color="bg-blue-500"
        />

        <MetricCard
          title="Completion Rate"
          value={`${Math.round(
            (analyticsData.overview.completedTasks /
              analyticsData.overview.totalTasks) *
              100
          )}%`}
          change={8}
          icon={ArrowTrendingUpIcon}
          color="bg-green-500"
        />

        <MetricCard
          title="Time Tracked"
          value={`${Math.round(analyticsData.overview.totalTimeSpent / 60)}h`}
          change={15}
          icon={ClockIcon}
          color="bg-purple-500"
        />

        <MetricCard
          title="Team Efficiency"
          value={`${analyticsData.overview.teamEfficiency}%`}
          change={5}
          icon={UserGroupIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Productivity Trends */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productivity Trends
          </h3>
          <div className="h-64">
            <Line data={trendData} options={chartOptions} />
          </div>
        </motion.div>

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
                labels: analyticsData.distribution.tasksByStatus.labels,
                datasets: [
                  {
                    data: analyticsData.distribution.tasksByStatus.data,
                    backgroundColor:
                      analyticsData.distribution.tasksByStatus.colors,
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
                labels: analyticsData.distribution.tasksByPriority.labels,
                datasets: [
                  {
                    label: "Tasks",
                    data: analyticsData.distribution.tasksByPriority.data,
                    backgroundColor:
                      analyticsData.distribution.tasksByPriority.colors,
                    borderRadius: 6,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </motion.div>

        {/* Time Distribution */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Time by Category
          </h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: analyticsData.distribution.timeByCategory.labels,
                datasets: [
                  {
                    data: analyticsData.distribution.timeByCategory.data,
                    backgroundColor:
                      analyticsData.distribution.timeByCategory.colors,
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
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Team Performance */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Performance
          </h3>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Sort by:
            </span>
            <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option>Tasks Completed</option>
              <option>Time Spent</option>
              <option>Efficiency</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Team Member
                </th>
                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tasks Completed
                </th>
                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time Spent
                </th>
                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Efficiency
                </th>
                <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.team.members.map((member, index) => (
                <motion.tr
                  key={member.name}
                  className="border-b border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {member.completed}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {Math.round(member.timeSpent / 60)}h{" "}
                      {member.timeSpent % 60}m
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${member.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.efficiency}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        +5.2%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
            <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Key Insights & Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  🎯 High Performance
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Task completion rate increased by 15% this month. Team is
                  exceeding targets consistently.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  ⚠️ Attention Needed
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  6 tasks are blocked by dependencies. Consider reviewing and
                  resolving bottlenecks.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  📈 Growth Opportunity
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Development tasks take 20% longer than average. Consider
                  additional training or resources.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  ✨ Best Practice
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Teams using time tracking show 23% higher productivity.
                  Encourage adoption across all projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;

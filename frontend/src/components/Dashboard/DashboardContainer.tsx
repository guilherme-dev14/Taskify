import React from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "../../stores/task.store";
import ActivityFeed from "./ActivityFeed";
import OverdueTasksAlert from "./OverdueTasksAlert";
import ProductivityMetrics from "./ProductivityMetrics";
import AnalyticsDashboard from "../Analytics/AnalyticsDashboard";

const DashboardContainer: React.FC = () => {
  const { getOverdueTasks, stats: taskStats } = useTaskStore();

  const overdueTasks = getOverdueTasks();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's what's happening with your tasks.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <motion.div className="mb-8" variants={itemVariants}>
          <OverdueTasksAlert tasks={overdueTasks} />
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          {/* Activity Feed */}
          <ActivityFeed />

          {/* Recent Activity Timeline */}
          <AnalyticsDashboard />
        </motion.div>

        {/* Right Column */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Productivity Metrics */}
          <ProductivityMetrics stats={taskStats} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardContainer;

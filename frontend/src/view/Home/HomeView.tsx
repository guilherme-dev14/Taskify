import React from "react";
import { motion } from "framer-motion";
import TextType from "../../components/TextType";

const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Taskify
            </span>
          </h1>

          <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 h-8">
            <TextType
              text={[
                "Organize your tasks efficiently",
                "Collaborate with your team",
                "Track your progress",
                "Achieve your goals",
              ]}
              typingSpeed={80}
              pauseDuration={2000}
              textColors={["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"]}
              className="font-medium"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Tasks", value: "24", color: "blue" },
            { label: "Completed Today", value: "8", color: "green" },
            { label: "In Progress", value: "12", color: "yellow" },
            { label: "Overdue", value: "4", color: "red" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold text-${stat.color}-500`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-${stat.color}-500`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Create New Task",
                description: "Add a new task to your workflow",
                icon: "📝",
                color: "blue",
              },
              {
                title: "New Workspace",
                description: "Create a workspace for team collaboration",
                icon: "🏢",
                color: "purple",
              },
              {
                title: "View Calendar",
                description: "Check your upcoming deadlines",
                icon: "📅",
                color: "green",
              },
            ].map((action) => (
              <button
                key={action.title}
                className={`
                  p-6 rounded-lg text-left transition-all duration-300
                  bg-gradient-to-br from-${action.color}-50 to-${action.color}-100
                  dark:from-${action.color}-900/20 dark:to-${action.color}-800/20
                  border border-${action.color}-200/50 dark:border-${action.color}-700/50
                  hover:shadow-lg hover:scale-105 active:scale-95
                  group
                `}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>

          <div className="space-y-4">
            {[
              {
                action: "Completed task",
                task: "Design new landing page",
                time: "2 hours ago",
                type: "completed",
              },
              {
                action: "Created workspace",
                task: "Marketing Campaign Q1",
                time: "5 hours ago",
                type: "created",
              },
              {
                action: "Updated task",
                task: "Fix authentication bug",
                time: "1 day ago",
                type: "updated",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
              >
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                  ${
                    activity.type === "completed"
                      ? "bg-green-500"
                      : activity.type === "created"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }
                `}
                >
                  {activity.type === "completed"
                    ? "✓"
                    : activity.type === "created"
                    ? "+"
                    : "↻"}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {activity.action}{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {activity.task}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeView;

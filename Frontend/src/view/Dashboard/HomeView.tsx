import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TextType from "../../components/TextType";
import {
  taskService,
  type IDashboardStats,
} from "../../services/Tasks/task.service";
import { useNavigationStore } from "../../stores/navigation.store";
import { NewTaskModal } from "../../components/Modals/NewTask";
import type { ICreateTaskRequest } from "../../types/task.types";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { NewWorkspaceModal } from "../../components/Modals/NewWorkspace";
import { JoinWorkspaceModal } from "../../components/Modals/JoinWorkspace";
import type {
  ICreateWorkspaceRequest,
  IJoinWorkspaceRequest,
} from "../../types/workspace.types";
import DashboardContainer from "../../components/Dashboard/DashboardContainer";
import { WorkspaceInvitations } from "../../components/Notifications/WorkspaceInvitations";

const HomeView: React.FC = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const { setCurrentView } = useNavigationStore();
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isJoinWorkspaceModalOpen, setIsJoinWorkspaceModalOpen] =
    useState(false);
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsData] = await Promise.all([taskService.getDashboardStats()]);
      setStats(statsData);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };
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
                "Bellini 14",
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
            {
              label: "Total Tasks",
              value: stats?.totalTasks || 0,
              color: "blue",
            },
            {
              label: "To do Today",
              value: stats?.toDoToday || 0,
              color: "green",
            },
            {
              label: "In Progress",
              value: stats?.inProgress || 0,
              color: "yellow",
            },
            { label: "Overdue", value: stats?.overdue || 0, color: "red" },
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
                  <div className={`text-3xl font-bold text-${stat.color}-500`}>
                    {isLoadingStats ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-12"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Create New Task",
                description: "Add a new task to your workflow",
                icon: "📝",
                color: "blue",
                action: () => setIsNewTaskModalOpen(true),
              },
              {
                title: "New Workspace",
                description: "Create a workspace for team collaboration",
                icon: "🏢",
                color: "purple",
                action: () => setIsNewWorkspaceModalOpen(true),
              },
              {
                title: "Join Workspace",
                description: "Join an existing workspace with invite code",
                icon: "👥",
                color: "emerald",
                action: () => setIsJoinWorkspaceModalOpen(true),
              },
              {
                title: "View Calendar",
                description: "Check your upcoming deadlines",
                icon: "📅",
                color: "green",
                action: () => setCurrentView("calendar"),
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
                onClick={action.action}
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
      </div>
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <WorkspaceInvitations />
      </motion.div>

      <motion.div className="mt-8">
        <DashboardContainer />
      </motion.div>
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSubmit={async (taskData: ICreateTaskRequest) => {
          try {
            await taskService.createTask(taskData);
            fetchDashboardData();
          } catch (error) {
            console.error("Error creating task:", error);
            setError("Failed to create task");
          }
        }}
      />
      <NewWorkspaceModal
        isOpen={isNewWorkspaceModalOpen}
        onClose={() => setIsNewWorkspaceModalOpen(false)}
        onSubmit={async (workspaceData: ICreateWorkspaceRequest) => {
          try {
            await workspaceService.createWorkspace(workspaceData);
            fetchDashboardData();
          } catch (error) {
            console.error("Error creating workspace:", error);
            setError("Failed to create workspace");
          }
        }}
      />

      <JoinWorkspaceModal
        isOpen={isJoinWorkspaceModalOpen}
        onClose={() => setIsJoinWorkspaceModalOpen(false)}
        onSubmit={async (joinData: IJoinWorkspaceRequest) => {
          try {
            await workspaceService.joinWorkspaceByInviteCode(joinData);
            fetchDashboardData();
          } catch (error) {
            console.error("Error joining workspace:", error);
            throw error;
          }
        }}
      />
    </div>
  );
};

export default HomeView;

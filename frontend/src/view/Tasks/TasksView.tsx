import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  dueDate: string;
  workspace: string;
  assignee?: string;
}

interface Workspace {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

const mockWorkspaces: Workspace[] = [
  { id: "all", name: "All Tasks", color: "gray", taskCount: 24 },
  { id: "personal", name: "Personal", color: "blue", taskCount: 8 },
  { id: "work", name: "Work", color: "purple", taskCount: 12 },
  { id: "side-projects", name: "Side Projects", color: "green", taskCount: 4 },
];

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create a modern and responsive landing page for the product",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-01-25",
    workspace: "work",
    assignee: "John Doe",
  },
  {
    id: "2",
    title: "Fix authentication bug",
    description: "Resolve the login issue that prevents users from accessing their accounts",
    status: "todo",
    priority: "high",
    dueDate: "2024-01-23",
    workspace: "work",
  },
  {
    id: "3",
    title: "Write blog post",
    description: "Create content about the new features and improvements",
    status: "completed",
    priority: "medium",
    dueDate: "2024-01-20",
    workspace: "personal",
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Keep the API documentation up to date with recent changes",
    status: "overdue",
    priority: "medium",
    dueDate: "2024-01-18",
    workspace: "work",
  },
  {
    id: "5",
    title: "Learn new framework",
    description: "Study and practice with the latest framework for mobile development",
    status: "todo",
    priority: "low",
    dueDate: "2024-02-01",
    workspace: "personal",
  },
  {
    id: "6",
    title: "Build mobile app",
    description: "Develop the mobile version of our main application",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-02-15",
    workspace: "side-projects",
  },
];

const TasksView: React.FC = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIconSolid className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case "overdue":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const filteredTasks = mockTasks.filter((task) => {
    const matchesWorkspace = selectedWorkspace === "all" || task.workspace === selectedWorkspace;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesWorkspace && matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize your tasks efficiently
          </p>
        </motion.div>

        {/* Workspace Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {mockWorkspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    selectedWorkspace === workspace.id
                      ? `bg-${workspace.color}-500 text-white shadow-lg`
                      : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {workspace.name}
                <span className="ml-2 text-sm opacity-75">
                  {workspace.taskCount}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>

          {/* Add Task Button */}
          <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium">
            <PlusIcon className="w-5 h-5" />
            Add Task
          </button>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getStatusText(task.status)}
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              </div>

              {/* Task Content */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {task.description}
                </p>
              </div>

              {/* Task Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {task.assignee.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {task.assignee}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or create a new task.
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              Create Your First Task
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
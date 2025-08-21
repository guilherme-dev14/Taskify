import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee?: string;
  workspace: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create a modern and responsive landing page for the product",
    priority: "high",
    dueDate: "2024-01-25",
    assignee: "John Doe",
    workspace: "work",
    tags: ["Design", "Frontend"],
  },
  {
    id: "2",
    title: "Fix authentication bug",
    description: "Resolve the login issue that prevents users from accessing their accounts",
    priority: "high",
    dueDate: "2024-01-23",
    workspace: "work",
    tags: ["Bug", "Backend"],
  },
  {
    id: "3",
    title: "Write blog post",
    description: "Create content about the new features and improvements",
    priority: "medium",
    dueDate: "2024-01-20",
    assignee: "Jane Smith",
    workspace: "marketing",
    tags: ["Content", "Marketing"],
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Keep the API documentation up to date with recent changes",
    priority: "medium",
    dueDate: "2024-01-18",
    workspace: "work",
    tags: ["Documentation"],
  },
  {
    id: "5",
    title: "Review pull requests",
    description: "Code review for the new authentication system",
    priority: "high",
    dueDate: "2024-01-24",
    assignee: "Mike Johnson",
    workspace: "work",
    tags: ["Review", "Code"],
  },
  {
    id: "6",
    title: "Deploy to staging",
    description: "Deploy the latest changes to the staging environment",
    priority: "medium",
    dueDate: "2024-01-26",
    workspace: "work",
    tags: ["Deployment"],
  },
];

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "gray",
    tasks: mockTasks.filter((task) => ["1", "2"].includes(task.id)),
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "blue",
    tasks: mockTasks.filter((task) => ["3", "4"].includes(task.id)),
  },
  {
    id: "review",
    title: "Review",
    color: "yellow",
    tasks: mockTasks.filter((task) => ["5"].includes(task.id)),
  },
  {
    id: "done",
    title: "Done",
    color: "green",
    tasks: mockTasks.filter((task) => ["6"].includes(task.id)),
  },
];

const KanbanView: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const workspaces = [
    { id: "all", name: "All Workspaces", color: "gray" },
    { id: "work", name: "Work", color: "blue" },
    { id: "marketing", name: "Marketing", color: "purple" },
    { id: "personal", name: "Personal", color: "green" },
  ];

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      case "low":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  const getPriorityBadgeColor = (priority: Task["priority"]) => {
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

  const getColumnHeaderColor = (color: string) => {
    switch (color) {
      case "gray":
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300";
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300";
      case "green":
        return "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
      }));

      const targetColumn = newColumns.find((col) => col.id === targetColumnId);
      if (targetColumn) {
        targetColumn.tasks.push(draggedTask);
      }

      return newColumns;
    });

    setDraggedTask(null);
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkspace =
        selectedWorkspace === "all" || task.workspace === selectedWorkspace;
      return matchesSearch && matchesWorkspace;
    }),
  }));

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
            Kanban Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize and manage your workflow with drag and drop
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
            {workspaces.map((workspace) => (
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

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-6 overflow-x-auto pb-6"
        >
          {filteredColumns.map((column, columnIndex) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div
                className={`rounded-lg p-4 mb-4 ${getColumnHeaderColor(
                  column.color
                )}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-75">
                      {column.tasks.length}
                    </span>
                    <button className="opacity-75 hover:opacity-100">
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[200px]">
                <AnimatePresence>
                  {column.tasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: columnIndex * 0.1 + taskIndex * 0.05,
                      }}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className={`
                        p-4 rounded-lg border-l-4 cursor-move hover:shadow-lg transition-all duration-200
                        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                        ${getPriorityColor(task.priority)}
                        ${draggedTask?.id === task.id ? 'opacity-50' : ''}
                      `}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                          {task.title}
                        </h4>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Task Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Task Footer */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(
                            task.priority
                          )}`}
                        >
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {task.assignee && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {task.assignee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Task Button */}
                <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add a task
                </button>
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <div className="flex-shrink-0 w-80">
            <button className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2">
              <PlusIcon className="w-6 h-6" />
              Add Column
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KanbanView;
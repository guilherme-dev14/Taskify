import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import type {
  ICreateTaskRequest,
  ITask,
  ITaskFilters,
} from "../../types/task.types";
import type { IWorkspaceName } from "../../types/workspace.types";
import { taskService } from "../../services/Tasks/task.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import { NewTaskModal } from "../../components/Modals/NewTask";
import { TaskDetailsModal } from "../../components/Modals/TaskDetails";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  tasks: ITask[];
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<IWorkspaceName[]>([]);

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalDate, setModalDate] = useState<Date | undefined>(undefined);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<number | undefined>(
    undefined
  );
  const [selectedDayTasks, setSelectedDayTasks] = useState<ITask[]>([]);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const MAX_VISIBLE_BADGES = 3;

  const loadWorkspaces = useCallback(async () => {
    try {
      const response = await workspaceService.getWorkspacesFromUser();
      // Acessar a propriedade 'content' que contém o array
      const userWorkspaces = response.content;
      setWorkspaces([{ id: 0, name: "All Workspaces" }, ...userWorkspaces]);
    } catch (error) {
      console.error("Error loading workspaces:", error);
      setWorkspaces([{ id: 0, name: "All Workspaces" }]);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ITaskFilters = {
        page: 0,
        size: 1000,
        sortBy: "createdAt",
        sortDir: "asc",
      };

      if (selectedWorkspace !== "all") {
        filters.workspaceId = parseInt(selectedWorkspace);
      }
      if (selectedStatus !== "all") {
        filters.status = selectedStatus as
          | "NEW"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "CANCELLED";
      }
      if (selectedPriority !== "all") {
        filters.priority = selectedPriority as
          | "LOW"
          | "MEDIUM"
          | "HIGH"
          | "URGENT";
      }

      const response = filters.workspaceId 
        ? await taskService.getWorkspaceTasks(filters.workspaceId, {
            page: filters.page,
            size: filters.size,
            sort: filters.sortBy,
            direction: filters.sortDir === "desc" ? "DESC" : "ASC",
            status: filters.status,
            priority: filters.priority,
          })
        : await taskService.getAllTasks(filters);
      setTasks(response.content || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace, selectedStatus, selectedPriority]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0) {
      loadTasks();
    }
  }, [loadTasks, workspaces.length]);

  const handleCreateTask = async (taskData: ICreateTaskRequest) => {
    try {
      await taskService.createTask(taskData);
      await loadTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = (task: ITask) => {
    setSelectedTask(task);
    setIsDayModalOpen(false);
    setIsEditTaskModalOpen(true);
  };

  const handleDeleteTask = (task: ITask) => {
    setTaskToDelete(task);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await taskService.deleteTask(taskToDelete.id);
      await loadTasks();
      setIsDeleteConfirmOpen(false);
      setTaskToDelete(null);
      setIsDayModalOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const days: CalendarDay[] = [];

    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
      });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        tasks: getTasksForDate(date),
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
      });
    }

    return days;
  };

  const getTasksForDate = (date: Date): ITask[] => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: ITask["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: ITask["status"]) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedDayTasks(day.tasks);
    setIsDayModalOpen(true);
  };

  const handleNewTaskForDate = (date: Date) => {
    const currentWorkspaceId =
      selectedWorkspace !== "all" ? parseInt(selectedWorkspace) : undefined;
    setSelectedDate(date);
    setModalDate(date);
    setModalWorkspaceId(currentWorkspaceId);
    setIsNewTaskModalOpen(true);
  };

  const handleCloseNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
    setSelectedDate(null);
    setModalDate(undefined);
    setModalWorkspaceId(undefined);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const calendarDays = getCalendarDays();

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your tasks by date
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={() => handleNewTaskForDate(new Date())}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Workspace Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Workspace
                    </label>
                    <select
                      value={selectedWorkspace}
                      onChange={(e) => setSelectedWorkspace(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Workspaces</option>
                      {workspaces.slice(1).map((workspace) => (
                        <option
                          key={workspace.id}
                          value={workspace.id.toString()}
                        >
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <div
                  key={day}
                  className="p-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    relative min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 
                    hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors
                    ${
                      !day.isCurrentMonth
                        ? "bg-gray-50 dark:bg-gray-900 opacity-50"
                        : ""
                    }
                    ${isToday(day.date) ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                  `}
                  onClick={() => handleDayClick(day)}
                >
                  {/* Day Number */}
                  <div
                    className={`
                    inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full mb-2
                    ${
                      isToday(day.date)
                        ? "bg-blue-600 text-white"
                        : day.isCurrentMonth
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-600"
                    }
                  `}
                  >
                    {day.date.getDate()}
                  </div>

                  {/* Task Badges */}
                  <div className="space-y-1">
                    {day.tasks.slice(0, MAX_VISIBLE_BADGES).map((task) => (
                      <div
                        key={task.id}
                        className={`
                          px-2 py-1 rounded text-xs font-medium truncate
                          ${getPriorityColor(task.priority)}
                        `}
                        title={`${task.title} - ${task.priority} Priority`}
                      >
                        {task.title}
                      </div>
                    ))}

                    {day.tasks.length > MAX_VISIBLE_BADGES && (
                      <div className="px-2 py-1 rounded text-xs bg-gray-500 text-white font-medium">
                        +{day.tasks.length - MAX_VISIBLE_BADGES} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* New Task Modal */}
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseNewTaskModal}
          onSubmit={handleCreateTask}
          initialStatus="NEW"
          initialDate={modalDate}
          initialWorkspaceId={modalWorkspaceId}
        />

        {/* Edit Task Modal */}
        {selectedTask && (
          <TaskDetailsModal
            taskId={selectedTask.id}
            isOpen={isEditTaskModalOpen}
            onClose={() => {
              setIsEditTaskModalOpen(false);
              setSelectedTask(null);
            }}
          />
        )}

        {/* Day Tasks Modal */}
        <AnimatePresence>
          {isDayModalOpen && selectedDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsDayModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDate(selectedDate)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {selectedDayTasks.length}{" "}
                      {selectedDayTasks.length === 1 ? "task" : "tasks"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDayModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Tasks List */}
                <div className="p-6 space-y-4">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {task.description}
                        </p>
                      )}

                      {task.categories && task.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.categories.map((category, index) => (
                            <span
                              key={`${category}-${index}`}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>Workspace</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit task"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete task"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedDayTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No tasks for this date
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsDayModalOpen(false);
                      handleNewTaskForDate(selectedDate);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteConfirmOpen && taskToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Delete Task
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Are you sure you want to delete this task? This action
                    cannot be undone.
                  </p>
                </div>

                {/* Task Info */}
                <div className="p-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {taskToDelete.title}
                    </h3>
                    {taskToDelete.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {taskToDelete.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                          taskToDelete.priority
                        )}`}
                      >
                        {taskToDelete.priority}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                          taskToDelete.status
                        )}`}
                      >
                        {taskToDelete.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteTask}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Task
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarView;

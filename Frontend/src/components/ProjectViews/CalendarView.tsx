import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTasks } from "../../hooks/useTasks";
import { type Task } from "../../stores/task.store";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import "react-calendar/dist/Calendar.css";

interface CalendarViewProps {
  workspaceId: number;
  onTaskClick?: (task: Task) => void;
}

interface TasksByDate {
  [key: string]: Task[];
}

const TaskEventCard: React.FC<{ task: Task; onClick?: () => void }> = ({
  task,
  onClick,
}) => {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "HIGH":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10";
      case "MEDIUM":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED";

  return (
    <motion.div
      className={`
        p-2 mb-2 border-l-4 rounded-r-md cursor-pointer transition-all duration-200
        hover:shadow-md ${getPriorityColor(task.priority)}
        ${isOverdue ? "ring-2 ring-red-400 ring-opacity-50" : ""}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {task.title}
          </h4>

          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${
                task.status === "COMPLETED"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : task.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }
            `}
            >
              {task.status.replace("_", " ")}
            </span>

            {isOverdue && (
              <div className="flex items-center text-red-500 text-xs">
                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                Overdue
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {task.status}%
            </div>
            {task.assignedTo && (
              <div className="w-6 h-6 mt-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">
                    {task.assignedTo.firstName?.charAt(0) ||
                      task.assignedTo.username.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({
  workspaceId,
  onTaskClick,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const { data: tasks, isLoading } = useTasks({
    workspaceId: workspaceId,
  });

  const { tasksByDate, monthStats } = useMemo(() => {
    if (!tasks)
      return {
        tasksByDate: {},
        monthStats: { total: 0, completed: 0, overdue: 0 },
      };

    const tasksByDate: TasksByDate = {};
    let total = 0;
    let completed = 0;
    let overdue = 0;

    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);

    tasks.forEach((task: Task) => {
      if (task.dueDate) {
        const dueDate = parseISO(task.dueDate);

        if (dueDate >= monthStart && dueDate <= monthEnd) {
          total++;
          if (task.status === "COMPLETED") completed++;
          if (dueDate < new Date() && task.status !== "COMPLETED") overdue++;
        }

        const dateKey = format(dueDate, "yyyy-MM-dd");
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      }
    });

    return {
      tasksByDate,
      monthStats: { total, completed, overdue },
    };
  }, [tasks, calendarDate]);

  const selectedDateTasks = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return tasksByDate[dateKey] || [];
  }, [tasksByDate, selectedDate]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateKey = format(date, "yyyy-MM-dd");
    const dayTasks = tasksByDate[dateKey] || [];

    if (dayTasks.length === 0) return null;

    return (
      <div className="mt-1">
        {/* Task count indicator */}
        <div className="flex justify-center space-x-1">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className={`w-2 h-2 rounded-full ${
                task.status === "COMPLETED"
                  ? "bg-green-500"
                  : task.dueDate && new Date(task.dueDate) < new Date()
                  ? "bg-red-500"
                  : task.status === "IN_PROGRESS"
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }`}
            />
          ))}
          {dayTasks.length > 3 && (
            <span className="text-xs text-gray-600">
              +{dayTasks.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const dateKey = format(date, "yyyy-MM-dd");
    const dayTasks = tasksByDate[dateKey] || [];

    let classes = "";

    if (dayTasks.length > 0) {
      const hasOverdue = dayTasks.some(
        (task) =>
          new Date(task.dueDate!) < new Date() && task.status !== "COMPLETED"
      );
      const allCompleted = dayTasks.every(
        (task) => task.status === "COMPLETED"
      );

      if (hasOverdue) {
        classes += " calendar-overdue";
      } else if (allCompleted) {
        classes += " calendar-completed";
      } else {
        classes += " calendar-has-tasks";
      }
    }

    if (isSameDay(date, selectedDate)) {
      classes += " calendar-selected";
    }

    return classes;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Calendar View
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View tasks by due date and plan your schedule
        </p>
      </div>

      {/* Month Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthStats.total}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Tasks This Month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthStats.completed}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completed Tasks
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthStats.overdue}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Overdue Tasks
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="calendar-container">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  } else if (Array.isArray(value) && value[0] instanceof Date) {
                    setSelectedDate(value[0]);
                  }
                }}
                value={selectedDate}
                onActiveStartDateChange={({ activeStartDate }) => {
                  if (activeStartDate) {
                    setCalendarDate(activeStartDate);
                  }
                }}
                tileContent={tileContent}
                tileClassName={tileClassName}
                prevLabel={<ChevronLeftIcon className="w-4 h-4" />}
                nextLabel={<ChevronRightIcon className="w-4 h-4" />}
                className="custom-calendar"
              />
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Completed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  In Progress
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Overdue
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDateTasks.length} task
              {selectedDateTasks.length !== 1 ? "s" : ""} due
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarDaysIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks due on this date</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateTasks.map((task) => (
                  <TaskEventCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedDateTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Add task for this date
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }

        .custom-calendar .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }

        .custom-calendar .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 16px;
          font-weight: 600;
          color: inherit;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .custom-calendar .react-calendar__navigation button:hover {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .custom-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
          margin-bottom: 0.5em;
        }

        .custom-calendar .react-calendar__tile {
          max-width: 100%;
          padding: 8px 4px;
          background: none;
          text-align: center;
          line-height: 16px;
          font-size: 14px;
          border: none;
          border-radius: 8px;
          margin: 1px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 60px;
          position: relative;
        }

        .custom-calendar .react-calendar__tile:hover {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .custom-calendar .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }

        .custom-calendar .react-calendar__tile.calendar-has-tasks {
          background-color: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .custom-calendar .react-calendar__tile.calendar-completed {
          background-color: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .custom-calendar .react-calendar__tile.calendar-overdue {
          background-color: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .custom-calendar .react-calendar__tile.calendar-selected {
          background: #3b82f6 !important;
          color: white;
        }

        .dark .custom-calendar .react-calendar__navigation button {
          color: #f3f4f6;
        }

        .dark .custom-calendar .react-calendar__navigation button:hover {
          background-color: rgba(59, 130, 246, 0.2);
        }

        .dark .custom-calendar .react-calendar__tile {
          color: #f3f4f6;
        }

        .dark .custom-calendar .react-calendar__tile:hover {
          background-color: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default CalendarView;

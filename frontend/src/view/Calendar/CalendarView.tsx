import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  type: "task" | "meeting" | "event";
  priority: "low" | "medium" | "high";
  workspace: string;
  color: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    description: "Daily team synchronization meeting",
    startTime: "09:00",
    endTime: "09:30",
    date: "2024-01-22",
    type: "meeting",
    priority: "medium",
    workspace: "work",
    color: "blue",
  },
  {
    id: "2",
    title: "Design Review",
    description: "Review the new landing page designs",
    startTime: "14:00",
    endTime: "15:00",
    date: "2024-01-22",
    type: "meeting",
    priority: "high",
    workspace: "work",
    color: "purple",
  },
  {
    id: "3",
    title: "Complete Blog Post",
    description: "Finish writing the article about new features",
    startTime: "10:00",
    endTime: "12:00",
    date: "2024-01-23",
    type: "task",
    priority: "medium",
    workspace: "marketing",
    color: "green",
  },
  {
    id: "4",
    title: "Client Presentation",
    description: "Present the project progress to the client",
    startTime: "16:00",
    endTime: "17:00",
    date: "2024-01-24",
    type: "meeting",
    priority: "high",
    workspace: "work",
    color: "red",
  },
  {
    id: "5",
    title: "Code Review Session",
    description: "Review pull requests and discuss implementation",
    startTime: "11:00",
    endTime: "12:00",
    date: "2024-01-25",
    type: "meeting",
    priority: "medium",
    workspace: "work",
    color: "orange",
  },
];

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const today = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const current = new Date(startOfCalendar);

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const dayEvents = mockEvents.filter(event => event.date === dateStr);
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === currentDate.getMonth(),
        isToday: current.toDateString() === today.toDateString(),
        events: dayEvents,
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getEventColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      red: "bg-red-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
    };
    return colors[color] || "bg-gray-500";
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return <ClockIcon className="w-3 h-3" />;
      case "task":
        return <CalendarDaysIcon className="w-3 h-3" />;
      case "event":
        return <MapPinIcon className="w-3 h-3" />;
      default:
        return <CalendarDaysIcon className="w-3 h-3" />;
    }
  };

  const getTodayEvents = () => {
    const todayStr = today.toISOString().split('T')[0];
    return mockEvents.filter(event => event.date === todayStr);
  };

  const getUpcomingEvents = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return mockEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

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
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your schedule and deadlines
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            {/* Calendar Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {["month", "week", "day"].map((viewType) => (
                    <button
                      key={viewType}
                      onClick={() => setView(viewType as any)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        view === viewType
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                    </button>
                  ))}
                </div>

                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium">
                  <PlusIcon className="w-4 h-4" />
                  Add Event
                </button>
              </div>
            </motion.div>

            {/* Calendar Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              {/* Week Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50"
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
                    className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      !day.isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-900/20" : ""
                    } ${day.isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        day.isToday
                          ? "text-blue-600 dark:text-blue-400"
                          : day.isCurrentMonth
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {day.date.getDate()}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white truncate ${getEventColor(
                            event.color
                          )}`}
                          title={`${event.title} (${event.startTime} - ${event.endTime})`}
                        >
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Today's Events
              </h3>
              <div className="space-y-3">
                {getTodayEvents().length > 0 ? (
                  getTodayEvents().map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full mt-1 ${getEventColor(event.color)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No events today
                  </p>
                )}
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Events
              </h3>
              <div className="space-y-3">
                {getUpcomingEvents().slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full mt-1 ${getEventColor(event.color)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString()} at {event.startTime}
                      </p>
                    </div>
                  </div>
                ))}
                {getUpcomingEvents().length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No upcoming events
                  </p>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm text-gray-700 dark:text-gray-300">
                  Create new event
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm text-gray-700 dark:text-gray-300">
                  Schedule meeting
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm text-gray-700 dark:text-gray-300">
                  Set reminder
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm text-gray-700 dark:text-gray-300">
                  Import calendar
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
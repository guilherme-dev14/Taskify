import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useTimeFormat, useTimerControls } from "../../hooks/useTimeTracking";
import { useTimeTrackingStore } from "../../stores/timeTracking.store";
import type { TimeEntry } from "../../stores/timeTracking.store";

interface TimeTrackingWidgetProps {
  activeTimer?: TimeEntry | null;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
}

const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
  activeTimer,
  onOpenReports,
  onOpenSettings,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const { formatElapsedTime, formatDuration } = useTimeFormat();
  const {
    isRunning,
    isPaused,
    toggleTimer,
    stopTimer,
    isStarting,
    isStopping,
  } = useTimerControls();

  const { getTodaysTotalTime, getWeeksTotalTime, currentSessionStart } =
    useTimeTrackingStore();

  const todayTotal = getTodaysTotalTime();
  const weekTotal = getWeeksTotalTime();

  // Update elapsed time every second when running
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && !isPaused && currentSessionStart) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(currentSessionStart).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, currentSessionStart]);

  const getTimerDisplay = () => {
    if (activeTimer && isRunning) {
      return formatElapsedTime(elapsedTime);
    }
    return "00:00:00";
  };

  const getTimerStatus = () => {
    if (isRunning && !isPaused) return "Running";
    if (isPaused) return "Paused";
    return "Stopped";
  };

  const getStatusColor = () => {
    if (isRunning && !isPaused) return "text-green-500";
    if (isPaused) return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Time Tracking
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReports}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Timer Display */}
      <motion.div className="text-center mb-6" layout>
        <div className="relative mb-4">
          {/* Timer Circle */}
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />

            <AnimatePresence>
              {isRunning && (
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-blue-500"
                  strokeDasharray="352"
                  strokeDashoffset={352 - (elapsedTime % 60) * (352 / 60)}
                  initial={{ strokeDashoffset: 352 }}
                  animate={{
                    strokeDashoffset: 352 - (elapsedTime % 60) * (352 / 60),
                    rotate: isRunning ? 360 : 0,
                  }}
                  transition={{
                    strokeDashoffset: { duration: 0.5 },
                    rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                  }}
                  style={{ transformOrigin: "64px 64px" }}
                />
              )}
            </AnimatePresence>
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-3xl font-mono font-bold text-gray-900 dark:text-white"
              key={getTimerDisplay()}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {getTimerDisplay()}
            </motion.div>

            <div className={`text-sm font-medium mt-1 ${getStatusColor()}`}>
              {getTimerStatus()}
            </div>
          </div>
        </div>

        {/* Current Task */}
        {activeTimer && (
          <motion.div
            className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
              {activeTimer.taskTitle}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {activeTimer.workspaceName}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-3 mb-6">
        <motion.button
          onClick={toggleTimer}
          disabled={isStarting || isStopping}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
            ${
              isRunning && !isPaused
                ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl"
                : "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-105 active:scale-95
          `}
          whileTap={{ scale: 0.9 }}
        >
          {isStarting || isStopping ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRunning && !isPaused ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5 ml-0.5" />
          )}
        </motion.button>

        {isRunning && (
          <motion.button
            onClick={() => stopTimer()}
            disabled={isStopping}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileTap={{ scale: 0.9 }}
          >
            <StopIcon className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center space-x-1 mb-1">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Today
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDuration(todayTotal)}
          </div>
        </motion.div>

        <motion.div
          className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center space-x-1 mb-1">
            <ChartBarIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Week
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDuration(weekTotal)}
          </div>
        </motion.div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <motion.div
        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            ⌘
          </kbd>{" "}
          +
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">
            ⇧
          </kbd>{" "}
          +
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">
            T
          </kbd>{" "}
          to toggle timer
        </p>
      </motion.div>
    </motion.div>
  );
};

export default TimeTrackingWidget;

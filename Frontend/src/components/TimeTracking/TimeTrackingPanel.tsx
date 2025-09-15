import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Clock,
  Edit3,
  Trash2,
  Plus,
  Timer,
  Save,
  X,
} from "lucide-react";
import { advancedTaskService } from "../../services/Tasks/advancedTask.service";
import type { ITimeTracking, ITimeTrackingSummary } from "../../types/task.types";

interface TimeTrackingPanelProps {
  taskId: string;
}

interface TimeTrackingEntryProps {
  entry: ITimeTracking;
  onUpdate: () => void;
  onDelete: () => void;
}

const TimeTrackingEntry: React.FC<TimeTrackingEntryProps> = ({
  entry,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(entry.description || "");

  const handleSave = async () => {
    try {
      await advancedTaskService.updateTimeTracking(entry.id, {
        description,
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update time tracking:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      try {
        await advancedTaskService.deleteTimeTracking(entry.id);
        onDelete();
      } catch (error) {
        console.error("Failed to delete time tracking:", error);
      }
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Status indicator */}
      {entry.isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-800"></div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
            entry.isActive 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <Timer className={`w-5 h-5 ${
              entry.isActive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xl text-gray-900 dark:text-white">
                {entry.formattedDuration}
              </span>
              {entry.isActive && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Running
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              By {entry.user.firstName && entry.user.lastName 
                ? `${entry.user.firstName} ${entry.user.lastName}` 
                : entry.user.username}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit description"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="font-medium">Started:</span>
            <span>{new Date(entry.startTime).toLocaleString()}</span>
          </div>
        </div>
        {entry.endTime && (
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">Ended:</span>
              <span>{new Date(entry.endTime).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this time entry..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        entry.description && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-4 border-blue-200 dark:border-blue-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{entry.description}"
            </p>
          </div>
        )
      )}
    </div>
  );
};

export const TimeTrackingPanel: React.FC<TimeTrackingPanelProps> = ({
  taskId,
}) => {
  const [entries, setEntries] = useState<ITimeTracking[]>([]);
  const [summary, setSummary] = useState<ITimeTrackingSummary | null>(null);
  const [activeEntry, setActiveEntry] = useState<ITimeTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [timeEntries, timeSummary, activeSessions] = await Promise.all([
        advancedTaskService.getTimeTrackingEntries(taskId),
        advancedTaskService.getTotalTimeSpent(taskId),
        advancedTaskService.getActiveTimeTrackingSessions(),
      ]);

      setEntries(timeEntries);
      setSummary(timeSummary);
      
      // Find active entry for this task
      const activeForTask = activeSessions.find(
        session => session.task.id === taskId
      );
      setActiveEntry(activeForTask || null);
    } catch (error) {
      console.error("Failed to load time tracking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskId]);

  const startTracking = async () => {
    try {
      const newEntry = await advancedTaskService.startTimeTracking({
        taskId: parseInt(taskId),
        description,
      });
      setActiveEntry(newEntry);
      setDescription("");
      setShowNewEntryForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to start time tracking:", error);
    }
  };

  const stopTracking = async () => {
    if (!activeEntry) return;

    try {
      await advancedTaskService.stopTimeTracking(activeEntry.id);
      setActiveEntry(null);
      loadData();
    } catch (error) {
      console.error("Failed to stop time tracking:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Loading time tracking data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-100 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Time Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor and manage your time spent on this task</p>
          </div>
        </div>
        {summary && (
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.formattedTotalTime}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {summary.sessionsCount} session{summary.sessionsCount !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Active session control */}
      <div className={`border-2 rounded-xl p-6 transition-all duration-200 ${
        activeEntry 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'
      }`}>
        {activeEntry ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Timer className="w-7 h-7 text-green-600 dark:text-green-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Timer Running</h4>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                  Started: {new Date(activeEntry.startTime).toLocaleString()}
                </div>
                <div className="text-3xl font-bold text-green-800 dark:text-green-300">
                  {activeEntry.formattedDuration}
                </div>
              </div>
            </div>
            <button
              onClick={stopTracking}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors transform hover:scale-105"
            >
              <Pause className="w-5 h-5" />
              Stop Timer
            </button>
          </div>
        ) : (
          <div>
            {showNewEntryForm ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Start New Session</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Add an optional description and begin tracking</p>
                  </div>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on? (optional)"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  rows={2}
                />
                <div className="flex gap-3">
                  <button
                    onClick={startTracking}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors transform hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    Start Timer
                  </button>
                  <button
                    onClick={() => setShowNewEntryForm(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl mx-auto mb-4">
                  <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Ready to Track Time</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">Start a new time tracking session for this task</p>
                <button
                  onClick={() => setShowNewEntryForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors transform hover:scale-105 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Start Time Tracking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time entries list */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Entries</h4>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-4">
                <Timer className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">No time entries yet</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start tracking to see your logged time entries here
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <TimeTrackingEntry
                key={entry.id}
                entry={entry}
                onUpdate={loadData}
                onDelete={loadData}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingPanel;
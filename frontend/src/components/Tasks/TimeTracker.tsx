import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advancedTaskService } from '../../services/Tasks/advancedTask.service';
import { ITimeTracking, ITimeTrackingRequest } from '../../types/task.types';

interface TimeTrackerProps {
  taskId: string;
  className?: string;
}

interface TimeEntryProps {
  entry: ITimeTracking;
  onEdit: (entry: ITimeTracking) => void;
  onDelete: (entryId: string) => void;
}

function TimeEntry({ entry, onEdit, onDelete }: TimeEntryProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-900">
            {formatDuration(entry.duration || 0)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(entry.startTime)} • {formatTime(entry.startTime)}
            {entry.endTime && ` - ${formatTime(entry.endTime)}`}
          </div>
          <div className="text-xs text-gray-500">
            by {entry.user.firstName} {entry.user.lastName}
          </div>
        </div>
        {entry.description && (
          <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(entry)}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Edit entry"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="p-1 text-gray-400 hover:text-red-600"
          title="Delete entry"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TimeTracker({ taskId, className = '' }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<ITimeTracking | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [showEntries, setShowEntries] = useState(false);
  
  const queryClient = useQueryClient();

  // Query time tracking entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['time-tracking', taskId],
    queryFn: () => advancedTaskService.getTimeTrackingEntries(taskId)
  });

  // Query total time spent
  const { data: totalTime = 0 } = useQuery({
    queryKey: ['total-time', taskId],
    queryFn: () => advancedTaskService.getTotalTimeSpent(taskId)
  });

  // Start time tracking mutation
  const startTrackingMutation = useMutation({
    mutationFn: (data: ITimeTrackingRequest) => advancedTaskService.startTimeTracking(data),
    onSuccess: (entry) => {
      setCurrentEntry(entry);
      setIsTracking(true);
      setStartTime(new Date());
      queryClient.invalidateQueries(['time-tracking', taskId]);
    }
  });

  // Stop time tracking mutation
  const stopTrackingMutation = useMutation({
    mutationFn: (entryId: string) => advancedTaskService.stopTimeTracking(entryId),
    onSuccess: () => {
      setCurrentEntry(null);
      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');
      queryClient.invalidateQueries(['time-tracking', taskId]);
      queryClient.invalidateQueries(['total-time', taskId]);
    }
  });

  // Update time tracking mutation
  const updateTrackingMutation = useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: Partial<ITimeTracking> }) =>
      advancedTaskService.updateTimeTracking(entryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['time-tracking', taskId]);
      queryClient.invalidateQueries(['total-time', taskId]);
    }
  });

  // Delete time tracking mutation
  const deleteTrackingMutation = useMutation({
    mutationFn: advancedTaskService.deleteTimeTracking,
    onSuccess: () => {
      queryClient.invalidateQueries(['time-tracking', taskId]);
      queryClient.invalidateQueries(['total-time', taskId]);
    }
  });

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  const handleStartTracking = () => {
    startTrackingMutation.mutate({
      taskId,
      description: description.trim() || undefined
    });
  };

  const handleStopTracking = () => {
    if (currentEntry) {
      stopTrackingMutation.mutate(currentEntry.id);
    }
  };

  const handleEditEntry = (entry: ITimeTracking) => {
    const newDescription = window.prompt('Edit description:', entry.description || '');
    if (newDescription !== null) {
      updateTrackingMutation.mutate({
        entryId: entry.id,
        updates: { description: newDescription.trim() || undefined }
      });
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteTrackingMutation.mutate(entryId);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timer Controls */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          
          {isTracking ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono font-medium text-green-600">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-sm text-gray-500">tracking...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Total: {formatDuration(totalTime)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isTracking ? (
            <>
              <input
                type="text"
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleStartTracking()}
              />
              <button
                onClick={handleStartTracking}
                disabled={startTrackingMutation.isLoading}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-4 w-4" />
                <span>Start</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleStopTracking}
              disabled={stopTrackingMutation.isLoading}
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon className="h-4 w-4" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Time Entries */}
      {entries.length > 0 && (
        <div>
          <button
            onClick={() => setShowEntries(!showEntries)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              Time Entries ({entries.length})
            </span>
            <span className="text-sm text-gray-500">
              {formatDuration(totalTime)} total
            </span>
          </button>

          {showEntries && (
            <div className="mt-3 space-y-2">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 bg-gray-100 rounded-lg">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                entries.map((entry) => (
                  <TimeEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
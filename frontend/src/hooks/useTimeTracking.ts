import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTimeTrackingStore, TimeEntry, TimeReport } from '../stores/timeTracking.store';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API functions
const timeTrackingAPI = {
  startTimer: async (taskId: number, description?: string): Promise<TimeEntry> => {
    const response = await axios.post(`${API_BASE}/api/time-tracking/start`, {
      taskId,
      description,
    });
    return response.data;
  },

  stopTimer: async (): Promise<TimeEntry> => {
    const response = await axios.post(`${API_BASE}/api/time-tracking/stop`);
    return response.data;
  },

  getActiveTimer: async (): Promise<TimeEntry | null> => {
    try {
      const response = await axios.get(`${API_BASE}/api/time-tracking/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return null; // No active timer
      }
      throw error;
    }
  },

  getTimeHistory: async (page = 0, size = 20) => {
    const response = await axios.get(`${API_BASE}/api/time-tracking/history`, {
      params: { page, size }
    });
    return response.data;
  },

  getTaskTimeHistory: async (taskId: number): Promise<TimeEntry[]> => {
    const response = await axios.get(`${API_BASE}/api/time-tracking/task/${taskId}`);
    return response.data;
  },

  generateReport: async (startDate: string, endDate: string): Promise<TimeReport> => {
    const response = await axios.get(`${API_BASE}/api/time-tracking/report`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getWeeklyReport: async (): Promise<TimeReport> => {
    const response = await axios.get(`${API_BASE}/api/time-tracking/report/week`);
    return response.data;
  },

  getMonthlyReport: async (): Promise<TimeReport> => {
    const response = await axios.get(`${API_BASE}/api/time-tracking/report/month`);
    return response.data;
  },

  deleteTimeEntry: async (entryId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/api/time-tracking/${entryId}`);
  },

  exportCSV: async (startDate: string, endDate: string): Promise<string> => {
    const response = await axios.get(`${API_BASE}/api/time-tracking/export/csv`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

export const useActiveTimer = () => {
  const { 
    setActiveEntry, 
    startTimer, 
    stopTimer, 
    setLoading, 
    setError,
    isRunning 
  } = useTimeTrackingStore();

  return useQuery({
    queryKey: ['active-timer'],
    queryFn: async () => {
      setLoading(true);
      try {
        const activeTimer = await timeTrackingAPI.getActiveTimer();
        setActiveEntry(activeTimer);
        return activeTimer;
      } catch (error: any) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: isRunning ? 1000 : false, // Refetch every second when running
    staleTime: 0, // Always refetch
  });
};

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  const { 
    startTimer: startStoreTimer, 
    setActiveEntry, 
    setError 
  } = useTimeTrackingStore();

  return useMutation({
    mutationFn: ({ taskId, description }: { taskId: number; description?: string }) =>
      timeTrackingAPI.startTimer(taskId, description),
    onMutate: ({ taskId, description }) => {
      // Optimistic update
      startStoreTimer(taskId, description);
    },
    onSuccess: (timeEntry) => {
      setActiveEntry(timeEntry);
      queryClient.setQueryData(['active-timer'], timeEntry);
      queryClient.invalidateQueries({ queryKey: ['time-history'] });
    },
    onError: (error: any) => {
      setError(error.message);
      // Revert optimistic update
      const { stopTimer } = useTimeTrackingStore.getState();
      stopTimer();
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  const { 
    stopTimer: stopStoreTimer, 
    setActiveEntry, 
    addTimeEntry 
  } = useTimeTrackingStore();

  return useMutation({
    mutationFn: timeTrackingAPI.stopTimer,
    onMutate: () => {
      // Optimistic update
      stopStoreTimer();
    },
    onSuccess: (timeEntry) => {
      setActiveEntry(null);
      addTimeEntry(timeEntry);
      queryClient.setQueryData(['active-timer'], null);
      queryClient.invalidateQueries({ queryKey: ['time-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: any) => {
      const { setError } = useTimeTrackingStore.getState();
      setError(error.message);
    },
  });
};

export const useTimeHistory = (page = 0, size = 20) => {
  const { setLoading, setError } = useTimeTrackingStore();

  return useQuery({
    queryKey: ['time-history', page, size],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await timeTrackingAPI.getTimeHistory(page, size);
        return data;
      } catch (error: any) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTaskTimeHistory = (taskId: number) => {
  return useQuery({
    queryKey: ['task-time-history', taskId],
    queryFn: () => timeTrackingAPI.getTaskTimeHistory(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useWeeklyReport = () => {
  const { setWeeklyReport } = useTimeTrackingStore();

  return useQuery({
    queryKey: ['weekly-report'],
    queryFn: async () => {
      const report = await timeTrackingAPI.getWeeklyReport();
      setWeeklyReport(report);
      return report;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useMonthlyReport = () => {
  const { setMonthlyReport } = useTimeTrackingStore();

  return useQuery({
    queryKey: ['monthly-report'],
    queryFn: async () => {
      const report = await timeTrackingAPI.getMonthlyReport();
      setMonthlyReport(report);
      return report;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useCustomReport = (startDate: string, endDate: string) => {
  const { setCustomReport } = useTimeTrackingStore();

  return useQuery({
    queryKey: ['custom-report', startDate, endDate],
    queryFn: async () => {
      const report = await timeTrackingAPI.generateReport(startDate, endDate);
      setCustomReport(report);
      return report;
    },
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();
  const { deleteTimeEntry } = useTimeTrackingStore();

  return useMutation({
    mutationFn: timeTrackingAPI.deleteTimeEntry,
    onSuccess: (_, entryId) => {
      deleteTimeEntry(entryId);
      queryClient.invalidateQueries({ queryKey: ['time-history'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-report'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-report'] });
    },
  });
};

export const useExportTimeReport = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      timeTrackingAPI.exportCSV(startDate, endDate),
    onSuccess: (csvData, { startDate, endDate }) => {
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `time_report_${startDate}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Custom hook for timer controls with keyboard shortcuts
export const useTimerControls = (currentTaskId?: number) => {
  const { isRunning, isPaused } = useTimeTrackingStore();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();

  const toggleTimer = () => {
    if (isRunning) {
      stopTimer.mutate();
    } else if (currentTaskId) {
      startTimer.mutate({ taskId: currentTaskId });
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T to toggle timer
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleTimer();
      }
      
      // Ctrl/Cmd + Shift + S to stop timer
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S' && isRunning) {
        event.preventDefault();
        stopTimer.mutate();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, currentTaskId]);

  return {
    isRunning,
    isPaused,
    toggleTimer,
    startTimer: startTimer.mutate,
    stopTimer: stopTimer.mutate,
    isStarting: startTimer.isPending,
    isStopping: stopTimer.isPending,
  };
};

// Hook for time formatting utilities
export const useTimeFormat = () => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    formatDuration,
    formatElapsedTime,
  };
};
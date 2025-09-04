import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimeEntry {
  id: number;
  taskId: number;
  taskTitle: string;
  workspaceName: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  description?: string;
  isActive: boolean;
  user: {
    id: number;
    username: string;
  };
}

export interface TimeReport {
  totalMinutes: number;
  billableMinutes: number;
  entries: TimeEntry[];
  taskBreakdown: Record<string, number>;
  dailyBreakdown: Record<string, number>;
  weeklyTrend: Array<{
    week: string;
    minutes: number;
  }>;
}

export interface TimerState {
  activeEntry: TimeEntry | null;
  recentEntries: TimeEntry[];
  currentSessionStart: string | null;
  currentSessionTaskId: number | null;
  elapsedTime: number; // in seconds for real-time display
  isRunning: boolean;
  isPaused: boolean;
  
  // Report data
  weeklyReport: TimeReport | null;
  monthlyReport: TimeReport | null;
  customReport: TimeReport | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showFloatingTimer: boolean;
  timerPosition: { x: number; y: number };
  autoStopAfterMinutes: number | null;
  
  // Preferences
  preferences: {
    autoStartOnTaskSelect: boolean;
    showDesktopNotifications: boolean;
    playTimerSounds: boolean;
    trackIdleTime: boolean;
    defaultDescription: string;
  };

  // Actions
  startTimer: (taskId: number, description?: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  updateElapsedTime: () => void;
  
  // Entry management
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (id: number, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: number) => void;
  setActiveEntry: (entry: TimeEntry | null) => void;
  
  // Reports
  setWeeklyReport: (report: TimeReport) => void;
  setMonthlyReport: (report: TimeReport) => void;
  setCustomReport: (report: TimeReport) => void;
  
  // UI controls
  toggleFloatingTimer: () => void;
  setTimerPosition: (position: { x: number; y: number }) => void;
  setAutoStop: (minutes: number | null) => void;
  
  // Preferences
  updatePreferences: (prefs: Partial<TimerState['preferences']>) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // Real-time updates
  handleTimerUpdate: (entry: TimeEntry) => void;
  handleTimerStopped: (entry: TimeEntry) => void;
  
  // Computed
  getTotalTimeForTask: (taskId: number) => number;
  getTodaysTotalTime: () => number;
  getWeeksTotalTime: () => number;
  getActiveTimerDuration: () => number;
}

export const useTimeTrackingStore = create<TimerState>()(
  persist(
    (set, get) => ({
      activeEntry: null,
      recentEntries: [],
      currentSessionStart: null,
      currentSessionTaskId: null,
      elapsedTime: 0,
      isRunning: false,
      isPaused: false,
      
      weeklyReport: null,
      monthlyReport: null,
      customReport: null,
      
      isLoading: false,
      error: null,
      showFloatingTimer: true,
      timerPosition: { x: window.innerWidth - 300, y: 100 },
      autoStopAfterMinutes: null,
      
      preferences: {
        autoStartOnTaskSelect: false,
        showDesktopNotifications: true,
        playTimerSounds: true,
        trackIdleTime: true,
        defaultDescription: '',
      },

      startTimer: (taskId, description) => {
        const now = new Date().toISOString();
        set({
          currentSessionStart: now,
          currentSessionTaskId: taskId,
          elapsedTime: 0,
          isRunning: true,
          isPaused: false,
          error: null,
        });
        
        // Start the elapsed time counter
        const interval = setInterval(() => {
          const state = get();
          if (state.isRunning && !state.isPaused) {
            state.updateElapsedTime();
          } else {
            clearInterval(interval);
          }
        }, 1000);
      },

      stopTimer: () => {
        const state = get();
        if (state.currentSessionStart && state.currentSessionTaskId) {
          const duration = Math.floor(state.elapsedTime / 60); // Convert to minutes
          
          set({
            isRunning: false,
            isPaused: false,
            currentSessionStart: null,
            currentSessionTaskId: null,
            elapsedTime: 0,
          });
        }
      },

      pauseTimer: () => set({ isPaused: true }),

      resumeTimer: () => set({ isPaused: false }),

      updateElapsedTime: () => {
        const state = get();
        if (state.currentSessionStart) {
          const elapsed = Math.floor(
            (new Date().getTime() - new Date(state.currentSessionStart).getTime()) / 1000
          );
          set({ elapsedTime: elapsed });
        }
      },

      addTimeEntry: (entry) =>
        set((state) => ({
          recentEntries: [entry, ...state.recentEntries.slice(0, 19)], // Keep last 20 entries
        })),

      updateTimeEntry: (id, updates) =>
        set((state) => ({
          recentEntries: state.recentEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
          activeEntry: state.activeEntry?.id === id 
            ? { ...state.activeEntry, ...updates }
            : state.activeEntry,
        })),

      deleteTimeEntry: (id) =>
        set((state) => ({
          recentEntries: state.recentEntries.filter((entry) => entry.id !== id),
          activeEntry: state.activeEntry?.id === id ? null : state.activeEntry,
        })),

      setActiveEntry: (entry) => set({ activeEntry: entry }),

      setWeeklyReport: (report) => set({ weeklyReport: report }),
      setMonthlyReport: (report) => set({ monthlyReport: report }),
      setCustomReport: (report) => set({ customReport: report }),

      toggleFloatingTimer: () =>
        set((state) => ({ showFloatingTimer: !state.showFloatingTimer })),

      setTimerPosition: (position) => set({ timerPosition: position }),

      setAutoStop: (minutes) => set({ autoStopAfterMinutes: minutes }),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      reset: () =>
        set({
          activeEntry: null,
          recentEntries: [],
          currentSessionStart: null,
          currentSessionTaskId: null,
          elapsedTime: 0,
          isRunning: false,
          isPaused: false,
          error: null,
        }),

      // Real-time handlers
      handleTimerUpdate: (entry) => {
        set({ activeEntry: entry });
        get().addTimeEntry(entry);
      },

      handleTimerStopped: (entry) => {
        set({ activeEntry: null, isRunning: false, isPaused: false });
        get().addTimeEntry(entry);
      },

      // Computed functions
      getTotalTimeForTask: (taskId) => {
        const entries = get().recentEntries.filter(entry => entry.taskId === taskId);
        return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
      },

      getTodaysTotalTime: () => {
        const today = new Date().toISOString().split('T')[0];
        const todaysEntries = get().recentEntries.filter(entry => 
          entry.startTime.startsWith(today)
        );
        return todaysEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
      },

      getWeeksTotalTime: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoISO = weekAgo.toISOString();
        
        const weekEntries = get().recentEntries.filter(entry => 
          entry.startTime >= weekAgoISO
        );
        return weekEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
      },

      getActiveTimerDuration: () => {
        const state = get();
        if (state.isRunning && state.currentSessionStart) {
          return Math.floor(
            (new Date().getTime() - new Date(state.currentSessionStart).getTime()) / 1000
          );
        }
        return 0;
      },
    }),
    {
      name: 'time-tracking-store',
      partialize: (state) => ({
        recentEntries: state.recentEntries.slice(0, 20), // Persist only recent entries
        preferences: state.preferences,
        showFloatingTimer: state.showFloatingTimer,
        timerPosition: state.timerPosition,
        autoStopAfterMinutes: state.autoStopAfterMinutes,
      }),
    }
  )
);
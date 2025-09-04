import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon,
  EyeSlashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useTimeFormat, useTimerControls } from '../../hooks/useTimeTracking';
import { useTimeTrackingStore } from '../../stores/timeTracking.store';

const FloatingTimer: React.FC = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const { formatElapsedTime } = useTimeFormat();
  const { 
    isRunning, 
    isPaused, 
    toggleTimer, 
    stopTimer, 
    isStarting, 
    isStopping 
  } = useTimerControls();
  
  const { 
    activeEntry,
    currentSessionStart,
    showFloatingTimer,
    timerPosition,
    toggleFloatingTimer,
    setTimerPosition,
  } = useTimeTrackingStore();

  const x = useMotionValue(timerPosition.x);
  const y = useMotionValue(timerPosition.y);

  // Update elapsed time every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
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

  // Save position when dragging ends
  const handleDragEnd = () => {
    setIsDragging(false);
    setTimerPosition({ x: x.get(), y: y.get() });
  };

  const getTimerDisplay = () => {
    if (activeEntry && isRunning) {
      return formatElapsedTime(elapsedTime);
    }
    return '00:00:00';
  };

  if (!showFloatingTimer || !activeEntry) {
    return null;
  }

  return (
    <>
      {/* Drag constraints container */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-40"
      />

      <AnimatePresence>
        <motion.div
          className="fixed z-50"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          drag
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05, zIndex: 60 }}
        >
          <motion.div
            className={`
              bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
              ${isDragging ? 'shadow-3xl' : 'shadow-2xl'}
              ${isMinimized ? 'w-16' : 'w-64'}
              transition-all duration-300
              backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95
            `}
            layout
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-3 cursor-move"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <div className="flex items-center space-x-2">
                <Bars3Icon className="w-4 h-4 text-gray-400" />
                {!isMinimized && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timer
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                >
                  <EyeSlashIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={toggleFloatingTimer}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Timer Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  className="px-4 pb-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Current Task */}
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                      {activeEntry.taskTitle}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {activeEntry.workspaceName}
                    </p>
                  </div>

                  {/* Timer Display */}
                  <div className="text-center mb-4">
                    <motion.div
                      className="text-2xl font-mono font-bold text-gray-900 dark:text-white"
                      key={getTimerDisplay()}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      {getTimerDisplay()}
                    </motion.div>
                    
                    <div className={`text-xs font-medium mt-1 ${
                      isRunning && !isPaused ? 'text-green-500' : 
                      isPaused ? 'text-yellow-500' : 'text-gray-500'
                    }`}>
                      {isRunning && !isPaused ? 'Running' : 
                       isPaused ? 'Paused' : 'Stopped'}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-2">
                    <motion.button
                      onClick={toggleTimer}
                      disabled={isStarting || isStopping}
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                        ${isRunning && !isPaused
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transform hover:scale-110 active:scale-95
                      `}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isStarting || isStopping ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isRunning && !isPaused ? (
                        <PauseIcon className="w-4 h-4" />
                      ) : (
                        <PlayIcon className="w-4 h-4 ml-0.5" />
                      )}
                    </motion.button>

                    {isRunning && (
                      <motion.button
                        onClick={() => stopTimer()}
                        disabled={isStopping}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 transform hover:scale-110 active:scale-95"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <StopIcon className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized View */}
            {isMinimized && (
              <motion.div
                className="px-2 pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                    {formatElapsedTime(elapsedTime).substring(0, 5)}
                  </div>
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                    isRunning && !isPaused ? 'bg-green-500 animate-pulse' : 
                    isPaused ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
              </motion.div>
            )}

            {/* Pulse animation for active timer */}
            {isRunning && !isPaused && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-green-400 pointer-events-none"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default FloatingTimer;
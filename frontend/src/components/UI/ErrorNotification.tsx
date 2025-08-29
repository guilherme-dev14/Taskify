import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { ErrorInfo } from '../../utils/errorHandler';

interface ErrorNotificationProps {
  errorInfo: ErrorInfo | null;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  errorInfo,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  React.useEffect(() => {
    if (errorInfo && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [errorInfo, autoClose, autoCloseDelay, onClose]);

  const getIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6" />;
    }
  };

  const getColors = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800/50',
          icon: 'text-red-500 dark:text-red-400',
          title: 'text-red-800 dark:text-red-300',
          message: 'text-red-700 dark:text-red-200',
          closeBtn: 'text-red-400 hover:text-red-600 dark:hover:text-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800/50',
          icon: 'text-yellow-500 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-300',
          message: 'text-yellow-700 dark:text-yellow-200',
          closeBtn: 'text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800/50',
          icon: 'text-blue-500 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-300',
          message: 'text-blue-700 dark:text-blue-200',
          closeBtn: 'text-blue-400 hover:text-blue-600 dark:hover:text-blue-300',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800/50',
          icon: 'text-gray-500 dark:text-gray-400',
          title: 'text-gray-800 dark:text-gray-300',
          message: 'text-gray-700 dark:text-gray-200',
          closeBtn: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
        };
    }
  };

  return (
    <AnimatePresence>
      {errorInfo && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-50 max-w-md w-full mx-4"
        >
          <div className={`
            ${getColors(errorInfo.type).bg}
            ${getColors(errorInfo.type).border}
            border rounded-xl shadow-lg backdrop-blur-sm p-4
          `}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${getColors(errorInfo.type).icon}`}>
                {getIcon(errorInfo.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`
                  text-sm font-semibold mb-1
                  ${getColors(errorInfo.type).title}
                `}>
                  {errorInfo.title}
                </h4>
                <p className={`
                  text-sm leading-relaxed
                  ${getColors(errorInfo.type).message}
                `}>
                  {errorInfo.message}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className={`
                  flex-shrink-0 p-1 rounded-md transition-colors
                  ${getColors(errorInfo.type).closeBtn}
                `}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress bar for auto-close */}
            {autoClose && (
              <motion.div
                className="mt-3 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className={`h-full ${
                    errorInfo.type === 'error'
                      ? 'bg-red-400'
                      : errorInfo.type === 'warning'
                      ? 'bg-yellow-400'
                      : 'bg-blue-400'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastNotificationsProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({
  toasts,
  onRemove,
  position = "top-right",
}) => {
  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return CheckCircleIcon;
      case "error":
        return XCircleIcon;
      case "warning":
        return ExclamationTriangleIcon;
      case "info":
        return InformationCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getColors = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
          title: "text-green-800 dark:text-green-300",
          message: "text-green-700 dark:text-green-400",
          button:
            "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-300",
          message: "text-red-700 dark:text-red-400",
          button:
            "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          title: "text-yellow-800 dark:text-yellow-300",
          message: "text-yellow-700 dark:text-yellow-400",
          button:
            "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-300",
          message: "text-blue-700 dark:text-blue-400",
          button:
            "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  const ToastItem: React.FC<{ toast: Toast; index: number }> = ({
    toast,
    index,
  }) => {
    const IconComponent = getIcon(toast.type);
    const colors = getColors(toast.type);

    useEffect(() => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          onRemove(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    }, [toast.id, toast.duration]);

    const handleClose = () => {
      toast.onClose?.();
      onRemove(toast.id);
    };

    return (
      <motion.div
        key={toast.id}
        layout
        initial={{
          opacity: 0,
          y: position.includes("top") ? -50 : 50,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: position.includes("top") ? -50 : 50,
          scale: 0.95,
          transition: { duration: 0.2 },
        }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`
          w-full max-w-sm ${colors.bg} ${colors.border} border rounded-lg shadow-lg overflow-hidden
          backdrop-blur-sm mb-3 last:mb-0
        `}
        whileHover={{ scale: 1.02 }}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconComponent className={`w-5 h-5 ${colors.icon}`} />
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <div className={`text-sm font-medium ${colors.title}`}>
                {toast.title}
              </div>

              {toast.message && (
                <div className={`mt-1 text-sm ${colors.message}`}>
                  {toast.message}
                </div>
              )}

              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={toast.action.onClick}
                    className={`text-sm font-medium ${colors.button} hover:underline transition-colors`}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>

            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className={`inline-flex rounded-md p-1.5 ${colors.button} hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {toast.duration && toast.duration > 0 && (
          <motion.div
            className="h-1 bg-current opacity-20"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: toast.duration / 1000, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div
      className={`fixed z-50 ${getPositionClasses()}`}
      style={{
        maxWidth: "100vw",
        padding: position.includes("center") ? "0 1rem" : "0",
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem key={toast.id} toast={toast} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;

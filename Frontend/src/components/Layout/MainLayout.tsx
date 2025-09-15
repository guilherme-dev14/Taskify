import React from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Dock, type ViewType } from "../Dock";
import { useNavigationStore } from "../../stores/navigation.store";
import { NotificationCenter } from "../Notifications/NotificationCenter";
import ToastNotifications from "../Notifications/ToastNotifications";
import { useToast } from "../../hooks/useToast";

interface MainLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
};

const pageTransition: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
  mass: 0.8,
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentView, setCurrentView } = useNavigationStore();
  const { toasts, removeToast } = useToast();

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Header with NotificationCenter */}
      <div className="fixed top-0 right-0 z-40 p-4">
        <NotificationCenter />
      </div>

      {/* Main Content Area */}
      <div className="pb-24 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dock activeView={currentView} onViewChange={handleViewChange} />

      {/* Global Toast Notifications */}
      <ToastNotifications
        toasts={toasts}
        onRemove={removeToast}
        position="top-right"
      />
    </div>
  );
};

export default MainLayout;

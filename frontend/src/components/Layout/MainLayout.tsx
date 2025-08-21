import React from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Dock, type ViewType } from "../Dock";
import { useNavigationStore } from "../../stores/navigation.store";

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

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Main Content Area */}
      <div className="pb-24">
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
    </div>
  );
};

export default MainLayout;

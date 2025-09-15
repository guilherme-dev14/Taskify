import { useState } from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

export type ViewType =
  | "home"
  | "tasks"
  | "kanban"
  | "calendar"
  | "workspaces"
  | "settings"
  | "profile";

interface DockItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface DockProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const dockItems: DockItem[] = [
  {
    id: "home",
    label: "Home",
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ClipboardDocumentListIcon,
    iconSolid: ClipboardDocumentListIconSolid,
  },
  {
    id: "kanban",
    label: "Kanban",
    icon: Squares2X2Icon,
    iconSolid: Squares2X2IconSolid,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid,
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: BuildingOfficeIcon,
    iconSolid: BuildingOfficeIconSolid,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircleIcon,
    iconSolid: UserCircleIconSolid,
  },
];

export const Dock = ({ activeView, onViewChange }: DockProps) => {
  const [hoveredItem, setHoveredItem] = useState<ViewType | null>(null);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-6 inset-x-0 flex justify-center z-50"
    >
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl px-3 py-2 shadow-2xl">
        <div className="flex items-center space-x-2">
          {dockItems.map((item) => {
            const Icon = activeView === item.id ? item.iconSolid : item.icon;
            const isActive = activeView === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <div key={item.id} className="relative">
                <motion.button
                  onClick={() => onViewChange(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    relative p-3 rounded-xl transition-all duration-200 ease-out
                    ${
                      isActive
                        ? "bg-blue-500/20 text-blue-500 dark:bg-blue-400/20 dark:text-blue-400"
                        : "hover:bg-white/10 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    y: isHovered || isActive ? -4 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.button>

                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute bottom-full"
                  >
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-md whitespace-nowrap font-medium">
                      {item.label}
                      <div className="absolute top-full left transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Dock;

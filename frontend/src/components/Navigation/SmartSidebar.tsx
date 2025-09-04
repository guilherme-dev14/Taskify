import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNavigationStore } from '../../stores/navigation.store';
import { useWorkspaceStore } from '../../stores/workspace.store';
import { useAuthStore } from '../../services/auth.store';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view?: string;
  badge?: number;
  subItems?: NavigationItem[];
}

const SmartSidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileToggle,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['workspaces']));
  
  const { currentView, setCurrentView } = useNavigationStore();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();

  const mainNavItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      view: 'home',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: DocumentTextIcon,
      view: 'tasks',
      badge: 12, // TODO: Get from store
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
      view: 'calendar',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: ChartBarIcon,
      view: 'reports',
    },
    {
      id: 'time-tracking',
      label: 'Time Tracking',
      icon: ClockIcon,
      view: 'time-tracking',
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleNavigation = (view: string) => {
    setCurrentView(view as any);
    if (isMobileOpen) {
      onMobileToggle();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Taskify
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">T</span>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:block p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close */}
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">New Task</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {mainNavItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => item.view && handleNavigation(item.view)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                ${currentView === item.view
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              whileHover={{ x: isCollapsed ? 0 : 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${
                currentView === item.view ? 'text-blue-600 dark:text-blue-400' : ''
              }`} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1rem] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.button>
          ))}
        </div>

        {/* Workspaces Section */}
        <div className="mt-8">
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('workspaces')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <span>Workspaces</span>
              <ChevronRightIcon className={`w-4 h-4 transform transition-transform ${
                expandedSections.has('workspaces') ? 'rotate-90' : ''
              }`} />
            </button>
          )}

          <AnimatePresence>
            {(expandedSections.has('workspaces') || isCollapsed) && (
              <motion.div
                initial={!isCollapsed ? { opacity: 0, height: 0 } : false}
                animate={!isCollapsed ? { opacity: 1, height: 'auto' } : {}}
                exit={!isCollapsed ? { opacity: 0, height: 0 } : {}}
                transition={{ duration: 0.2 }}
                className="space-y-1 mt-2"
              >
                {workspaces.slice(0, 5).map((workspace) => (
                  <motion.button
                    key={workspace.id}
                    onClick={() => setCurrentWorkspace(workspace)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${currentWorkspace?.id === workspace.id
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                    whileHover={{ x: isCollapsed ? 0 : 2 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate text-sm">
                          {workspace.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {workspace.members.length}
                        </span>
                      </>
                    )}
                  </motion.button>
                ))}

                {/* Add Workspace Button */}
                <button
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                  `}
                >
                  <PlusIcon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm">Add Workspace</span>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Items */}
        {!isCollapsed && (
          <div className="mt-8">
            <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Recent
            </div>
            <div className="space-y-1 mt-2">
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">Fix authentication bug</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <FolderIcon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">Frontend Team</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChartBarIcon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">Weekly Report</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName || user?.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </div>
              </div>
              
              <button
                onClick={() => handleNavigation('settings')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={onMobileToggle}
          />
        </motion.div>
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        className={`
          hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full
          transition-all duration-300 ease-in-out z-30
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        layout
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartSidebar;
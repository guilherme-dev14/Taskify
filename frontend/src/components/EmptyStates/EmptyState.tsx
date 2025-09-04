import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  FolderIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  InboxIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface EmptyStateProps {
  type: 'tasks' | 'workspaces' | 'team' | 'time' | 'reports' | 'search' | 'notifications' | 'calendar' | 'generic';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  illustration?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
  illustration,
  size = 'md',
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'tasks':
        return {
          icon: DocumentTextIcon,
          title: title || 'No tasks yet',
          description: description || 'Create your first task to get started with your project.',
          action: action || {
            label: 'Create Task',
            onClick: () => {},
            icon: PlusIcon,
          },
          gradient: 'from-blue-400 to-blue-600',
        };
      
      case 'workspaces':
        return {
          icon: FolderIcon,
          title: title || 'No workspaces',
          description: description || 'Create a workspace to organize your projects and collaborate with your team.',
          action: action || {
            label: 'Create Workspace',
            onClick: () => {},
            icon: PlusIcon,
          },
          gradient: 'from-purple-400 to-purple-600',
        };
      
      case 'team':
        return {
          icon: UserGroupIcon,
          title: title || 'No team members',
          description: description || 'Invite team members to start collaborating on projects.',
          action: action || {
            label: 'Invite Members',
            onClick: () => {},
            icon: PlusIcon,
          },
          gradient: 'from-green-400 to-green-600',
        };
      
      case 'time':
        return {
          icon: ClockIcon,
          title: title || 'No time tracked',
          description: description || 'Start tracking time to monitor your productivity and project progress.',
          action: action || {
            label: 'Start Timer',
            onClick: () => {},
            icon: ClockIcon,
          },
          gradient: 'from-orange-400 to-orange-600',
        };
      
      case 'reports':
        return {
          icon: ChartBarIcon,
          title: title || 'No data available',
          description: description || 'Complete some tasks and track time to generate meaningful reports.',
          gradient: 'from-indigo-400 to-indigo-600',
        };
      
      case 'search':
        return {
          icon: MagnifyingGlassIcon,
          title: title || 'No results found',
          description: description || 'Try adjusting your search criteria or browse all items.',
          gradient: 'from-gray-400 to-gray-600',
        };
      
      case 'notifications':
        return {
          icon: InboxIcon,
          title: title || 'All caught up!',
          description: description || 'No new notifications. You\'re all up to date.',
          gradient: 'from-teal-400 to-teal-600',
        };
      
      case 'calendar':
        return {
          icon: CalendarDaysIcon,
          title: title || 'No events scheduled',
          description: description || 'Create tasks with due dates to see them appear on your calendar.',
          action: action || {
            label: 'Create Task',
            onClick: () => {},
            icon: PlusIcon,
          },
          gradient: 'from-pink-400 to-pink-600',
        };
      
      default:
        return {
          icon: ExclamationTriangleIcon,
          title: title || 'Nothing here yet',
          description: description || 'This area is empty. Add some content to get started.',
          gradient: 'from-gray-400 to-gray-600',
        };
    }
  };

  const content = getDefaultContent();
  const IconComponent = content.icon;

  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      iconContainer: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      iconContainer: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-6 py-3 text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      iconContainer: 'w-24 h-24',
      title: 'text-2xl',
      description: 'text-lg',
      button: 'px-8 py-4 text-lg',
    },
  };

  const sizeClasses = sizes[size];

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${sizeClasses.container}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Illustration or Icon */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {illustration || (
          <div className={`${sizeClasses.iconContainer} mx-auto mb-4`}>
            <div className={`w-full h-full bg-gradient-to-br ${content.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
              <IconComponent className={`${sizeClasses.icon} text-white`} />
            </div>
            
            {/* Floating elements for visual interest */}
            <motion.div
              className="relative"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-200 rounded-full opacity-60" />
            </motion.div>
            
            <motion.div
              className="relative"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-purple-200 rounded-full opacity-60" />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className={`${sizeClasses.title} font-semibold text-gray-900 dark:text-white mb-2`}>
          {content.title}
        </h3>
        
        <p className={`${sizeClasses.description} text-gray-600 dark:text-gray-400 mb-6 leading-relaxed`}>
          {content.description}
        </p>
      </motion.div>

      {/* Action Button */}
      {(action || content.action) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={(action || content.action)?.onClick}
            className={`
              ${sizeClasses.button} bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
              transition-all duration-200 transform hover:scale-105 active:scale-95
              focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
              shadow-lg hover:shadow-xl flex items-center space-x-2
            `}
          >
            {(action?.icon || content.action?.icon) && (
              <span className="flex-shrink-0">
                {React.createElement(action?.icon || content.action!.icon!, { 
                  className: 'w-4 h-4' 
                })}
              </span>
            )}
            <span>{(action || content.action)?.label}</span>
          </button>
        </motion.div>
      )}

      {/* Additional Help Text */}
      {type === 'search' && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Search suggestions:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['high priority', 'overdue', 'completed', 'assigned to me'].map((suggestion, index) => (
              <motion.button
                key={suggestion}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-full opacity-10"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-100 dark:bg-purple-900 rounded-full opacity-10"
          animate={{ scale: [1.1, 1, 1.1], rotate: [360, 180, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

// Specialized empty states for common scenarios
export const TasksEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState type="tasks" {...props} />
);

export const WorkspacesEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState type="workspaces" {...props} />
);

export const SearchEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState type="search" {...props} />
);

export const TimeTrackingEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState type="time" {...props} />
);

export const ReportsEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState type="reports" {...props} />
);

export default EmptyState;
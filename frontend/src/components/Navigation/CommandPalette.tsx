import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  PlusIcon,
  FolderIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  BoltIcon,
  ArrowRightIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import { useTasks } from '../../hooks/useTasks';
import { useWorkspaceStore } from '../../stores/workspace.store';
import { useNavigationStore } from '../../stores/navigation.store';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: 'actions' | 'navigation' | 'tasks' | 'workspaces' | 'recent';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { data: tasks } = useTasks({}, { enabled: isOpen });
  const { workspaces, currentWorkspace } = useWorkspaceStore();
  const { setCurrentView } = useNavigationStore();

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Base commands
  const baseCommands: Command[] = useMemo(() => [
    // Actions
    {
      id: 'create-task',
      title: 'Create New Task',
      description: 'Create a new task in the current workspace',
      icon: PlusIcon,
      shortcut: '⌘N',
      category: 'actions',
      action: () => {
        // Handle create task
        console.log('Create task');
        onClose();
      },
      keywords: ['new', 'add', 'create', 'task'],
    },
    {
      id: 'start-timer',
      title: 'Start Timer',
      description: 'Begin time tracking for a task',
      icon: ClockIcon,
      shortcut: '⌘⇧T',
      category: 'actions',
      action: () => {
        // Handle start timer
        console.log('Start timer');
        onClose();
      },
      keywords: ['time', 'timer', 'track', 'start'],
    },
    {
      id: 'create-workspace',
      title: 'Create Workspace',
      description: 'Create a new workspace',
      icon: FolderIcon,
      category: 'actions',
      action: () => {
        console.log('Create workspace');
        onClose();
      },
      keywords: ['workspace', 'project', 'new', 'create'],
    },

    // Navigation
    {
      id: 'go-dashboard',
      title: 'Go to Dashboard',
      description: 'Navigate to the main dashboard',
      icon: ChartBarIcon,
      shortcut: '⌘D',
      category: 'navigation',
      action: () => {
        setCurrentView('home');
        onClose();
      },
      keywords: ['dashboard', 'home', 'overview'],
    },
    {
      id: 'go-tasks',
      title: 'Go to Tasks',
      description: 'View all tasks',
      icon: DocumentTextIcon,
      shortcut: '⌘T',
      category: 'navigation',
      action: () => {
        setCurrentView('tasks');
        onClose();
      },
      keywords: ['tasks', 'todo', 'work'],
    },
    {
      id: 'go-calendar',
      title: 'Go to Calendar',
      description: 'View calendar and due dates',
      icon: CalendarIcon,
      shortcut: '⌘C',
      category: 'navigation',
      action: () => {
        setCurrentView('calendar');
        onClose();
      },
      keywords: ['calendar', 'schedule', 'dates', 'timeline'],
    },
    {
      id: 'go-reports',
      title: 'Go to Reports',
      description: 'View analytics and reports',
      icon: ChartBarIcon,
      category: 'navigation',
      action: () => {
        setCurrentView('reports');
        onClose();
      },
      keywords: ['reports', 'analytics', 'stats', 'metrics'],
    },
    {
      id: 'go-settings',
      title: 'Go to Settings',
      description: 'Manage account and workspace settings',
      icon: CogIcon,
      shortcut: '⌘,',
      category: 'navigation',
      action: () => {
        setCurrentView('settings');
        onClose();
      },
      keywords: ['settings', 'preferences', 'config'],
    },
  ], [setCurrentView, onClose]);

  // Dynamic commands based on data
  const dynamicCommands: Command[] = useMemo(() => {
    const commands: Command[] = [];

    // Task commands
    if (tasks) {
      tasks.slice(0, 5).forEach(task => {
        commands.push({
          id: `task-${task.id}`,
          title: `Open "${task.title}"`,
          description: `${task.status} • ${task.priority} priority`,
          icon: DocumentTextIcon,
          category: 'tasks',
          action: () => {
            // Handle open task
            console.log('Open task', task.id);
            onClose();
          },
          keywords: [task.title, task.status, task.priority, 'task'],
        });
      });
    }

    // Workspace commands
    workspaces.forEach(workspace => {
      if (workspace.id !== currentWorkspace?.id) {
        commands.push({
          id: `workspace-${workspace.id}`,
          title: `Switch to "${workspace.name}"`,
          description: `${workspace.members.length} members`,
          icon: FolderIcon,
          category: 'workspaces',
          action: () => {
            // Handle switch workspace
            console.log('Switch workspace', workspace.id);
            onClose();
          },
          keywords: [workspace.name, 'workspace', 'switch'],
        });
      }
    });

    return commands;
  }, [tasks, workspaces, currentWorkspace, onClose]);

  // Filter and search commands
  const filteredCommands = useMemo(() => {
    const allCommands = [...baseCommands, ...dynamicCommands];
    
    if (!query) {
      return allCommands;
    }

    const queryLower = query.toLowerCase();
    
    return allCommands.filter(command => {
      const searchText = [
        command.title,
        command.description || '',
        ...(command.keywords || [])
      ].join(' ').toLowerCase();
      
      return searchText.includes(queryLower);
    }).sort((a, b) => {
      // Prioritize exact title matches
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1;
      if (!aTitle.includes(queryLower) && bTitle.includes(queryLower)) return 1;
      
      return 0;
    });
  }, [baseCommands, dynamicCommands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  useHotkeys('up', (e) => {
    if (!isOpen) return;
    e.preventDefault();
    setSelectedIndex(prev => Math.max(0, prev - 1));
  }, [isOpen]);

  useHotkeys('down', (e) => {
    if (!isOpen) return;
    e.preventDefault();
    setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
  }, [isOpen, filteredCommands.length]);

  useHotkeys('enter', (e) => {
    if (!isOpen) return;
    e.preventDefault();
    const command = filteredCommands[selectedIndex];
    if (command) {
      command.action();
    }
  }, [isOpen, filteredCommands, selectedIndex]);

  useHotkeys('escape', () => {
    if (isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Update selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const categoryLabels = {
    actions: 'Actions',
    navigation: 'Navigation',
    tasks: 'Recent Tasks',
    workspaces: 'Workspaces',
    recent: 'Recent',
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Command Palette */}
        <div className="flex min-h-full items-start justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            className="relative w-full max-w-2xl mt-16"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Input */}
            <div className="bg-white dark:bg-gray-800 rounded-t-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
                  autoFocus
                />
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white dark:bg-gray-800 rounded-b-xl border-x border-b border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center">
                  <CommandLineIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {query ? 'No commands found' : 'Type to search for commands'}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category} className="mb-4 last:mb-0">
                      {commands.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {categoryLabels[category as keyof typeof categoryLabels] || category}
                          </div>
                          
                          {commands.map((command, categoryIndex) => {
                            const globalIndex = filteredCommands.indexOf(command);
                            const isSelected = globalIndex === selectedIndex;
                            
                            return (
                              <button
                                key={command.id}
                                onClick={command.action}
                                className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                                }`}
                              >
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                  isSelected 
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                  <command.icon className="w-4 h-4" />
                                </div>
                                
                                <div className="flex-1 text-left min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {command.title}
                                  </div>
                                  {command.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                      {command.description}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                  {command.shortcut && (
                                    <kbd className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                                      {command.shortcut}
                                    </kbd>
                                  )}
                                  
                                  {isSelected && (
                                    <ArrowRightIcon className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredCommands.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-b-xl border-x border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↓</kbd>
                      <span>to navigate</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
                      <span>to select</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">esc</kbd>
                      <span>to close</span>
                    </div>
                  </div>
                  
                  <div>
                    {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
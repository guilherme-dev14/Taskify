/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useKanbanTasks, useUpdateTask } from "../../hooks/useTasks";
import { type Task } from "../../stores/task.store";
import EnhancedTaskCard from "../Tasks/EnhancedTaskCard";

interface KanbanColumnProps {
  title: string;
  status: Task["status"];
  tasks: Task[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAddTask?: () => void;
}

const SortableTask: React.FC<{
  task: Task;
  onTaskClick: (task: Task) => void;
}> = ({ task, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <EnhancedTaskCard
        task={task}
        onClick={() => onTaskClick(task)}
        className="mb-3"
      />
    </div>
  );
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  isCollapsed = false,
  onToggleCollapse,
  onAddTask,
}) => {
  const statusColors = {
    NEW: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800",
    IN_PROGRESS:
      "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20",
    COMPLETED:
      "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20",
    CANCELLED:
      "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20",
  };

  const taskIds = tasks.map((task) => task.id.toString());

  return (
    <motion.div
      className={`flex-1 min-w-80 border-2 rounded-lg ${statusColors[status]}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-current/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-black/10 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpIcon className="w-4 h-4" />
              )}
            </button>

            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>

            <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-medium">
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onAddTask}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              title="Add Task"
            >
              <PlusIcon className="w-4 h-4" />
            </button>

            <button className="p-1 hover:bg-black/10 rounded transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="p-4 min-h-96 max-h-screen overflow-y-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onTaskClick={() => {}}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Add Task Button */}
            <motion.button
              onClick={onAddTask}
              className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Add Task</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface KanbanBoardProps {
  workspaceId: number;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ workspaceId }) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [collapsedColumns, setCollapsedColumns] = React.useState<Set<string>>(
    new Set()
  );

  const { data: tasks, isLoading } = useKanbanTasks(workspaceId);
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => {
    const statusColumns: { status: Task["status"]; title: string }[] = [
      { status: "NEW", title: "To Do" },
      { status: "IN_PROGRESS", title: "In Progress" },
      { status: "COMPLETED", title: "Completed" },
      { status: "CANCELLED", title: "Cancelled" },
    ];

    return statusColumns.map((column) => ({
      ...column,
      tasks: tasks?.filter((task: Task) => task.status === column.status) || [],
    }));
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = parseInt(event.active.id as string);
      const task = tasks?.find((t: Task) => t.id === taskId);
      setActiveTask(task || null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over || active.id === over.id) return;

      const taskId = parseInt(active.id as string);
      const task = tasks?.find((t: Task) => t.id === taskId);

      if (!task) return;

      let newStatus: Task["status"] = task.status;

      if (over.id !== active.id) {
        const overTask = tasks?.find((t: Task) => t.id.toString() === over.id);
        if (overTask) {
          newStatus = overTask.status;
        } else {
          const column = columns.find((col) => col.status === over.id);
          if (column) {
            newStatus = column.status;
          }
        }
      }

      if (newStatus !== task.status) {
        updateTask.mutate({
          id: taskId,
          updates: { status: newStatus },
        });
      }
    },
    [tasks, updateTask]
  );

  const toggleColumnCollapse = useCallback((status: Task["status"]) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex space-x-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-80">
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Kanban Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              tasks={column.tasks}
              isCollapsed={collapsedColumns.has(column.status)}
              onToggleCollapse={() => toggleColumnCollapse(column.status)}
              onAddTask={() => {}}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-6 opacity-95">
              <EnhancedTaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  Squares2X2Icon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { ICreateTaskRequest, ITask } from "../../types/task.types";
import type { IWorkspaceName } from "../../types/workspace.types";
import { taskService } from "../../services/Tasks/task.service";
import { workspaceService } from "../../services/Workspace/workspace.service";
import {
  taskStatusService,
  type ITaskStatus,
} from "../../services/Tasks/taskStatus.service";
import { NewTaskModal } from "../../components/Modals/NewTask";
import { formatDate } from "../../utils/dateUtils";

interface Column extends ITaskStatus {
  tasks: ITask[];
  isEditing?: boolean;
  isHovered?: boolean;
}

interface WorkspaceOption extends IWorkspaceName {
  id: number | string;
}

const COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
];

const KanbanView: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [draggedTask, setDraggedTask] = useState<ITask | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<number | undefined>(
    undefined
  );
  const [modalColumnStatus, setModalColumnStatus] = useState<
    number | undefined
  >(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [isAddingStatus, setIsAddingStatus] = useState<{
    after: number;
  } | null>(null);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#3B82F6");
  const editInputRef = useRef<HTMLInputElement>(null);
  const newStatusInputRef = useRef<HTMLInputElement>(null);

  const loadTasksForStatus = async (
    statusId: number,
    workspaceId?: string,
    year?: number,
    month?: number
  ) => {
    try {
      const tasks = await taskService.getTasksByStatus(
        statusId.toString(),
        workspaceId,
        year,
        month
      );
      return tasks;
    } catch (error) {
      console.error(`Error loading tasks for status ${statusId}:`, error);
      return [];
    }
  };
  const loadAllTasks = useCallback(
    async (workspaceId: string) => {
      if (!workspaceId) return;

      setLoading(true);
      try {
        const statuses = await taskStatusService.getStatusesForWorkspace(
          Number(workspaceId)
        );
        const sortedStatuses = statuses.sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const columnsWithTasks = await Promise.all(
          sortedStatuses.map(async (status) => {
            const tasks = await loadTasksForStatus(
              status.id,
              workspaceId,
              year,
              month
            );
            return { ...status, tasks, isEditing: false, isHovered: false };
          })
        );
        setColumns(columnsWithTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    },
    [currentDate]
  );

  useEffect(() => {
    const initializeOrUpdateKanban = async () => {
      if (workspaces.length === 0) {
        try {
          const userWorkspaces =
            await workspaceService.getWorkspacesFromUserList();
          setWorkspaces(userWorkspaces);
          if (userWorkspaces.length > 0) {
            const initialWorkspaceId = userWorkspaces[0].id.toString();
            setSelectedWorkspace(initialWorkspaceId);
            await loadAllTasks(initialWorkspaceId);
          }
        } catch (error) {
          console.error("Error initializing Kanban:", error);
          setLoading(false);
        }
      } else if (selectedWorkspace) {
        await loadAllTasks(selectedWorkspace);
      }
    };

    initializeOrUpdateKanban();
  }, [selectedWorkspace, currentDate]);

  useEffect(() => {
    if (editingColumn !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingColumn]);

  useEffect(() => {
    if (isAddingStatus && newStatusInputRef.current) {
      newStatusInputRef.current.focus();
    }
  }, [isAddingStatus]);

  const handleEditColumn = async (columnId: number) => {
    const column = columns.find((c) => c.id === columnId);
    if (column) {
      setEditingColumn(columnId);
      setEditingName(column.name);
    }
  };

  const handleSaveColumnName = async () => {
    if (!editingColumn || !selectedWorkspace) return;

    try {
      await taskStatusService.updateStatus(
        Number(selectedWorkspace),
        editingColumn,
        { name: editingName }
      );
      setColumns((prev) =>
        prev.map((col) =>
          col.id === editingColumn ? { ...col, name: editingName } : col
        )
      );
    } catch (error) {
      console.error("Error updating column name:", error);
    } finally {
      setEditingColumn(null);
      setEditingName("");
    }
  };

  const handleChangeColumnColor = async (columnId: number, color: string) => {
    if (!selectedWorkspace) return;

    try {
      await taskStatusService.updateStatus(
        Number(selectedWorkspace),
        columnId,
        { color }
      );
      setColumns((prev) =>
        prev.map((col) => (col.id === columnId ? { ...col, color } : col))
      );
    } catch (error) {
      console.error("Error updating column color:", error);
    } finally {
      setShowColorPicker(null);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (
      !selectedWorkspace ||
      columns.find((c) => c.id === columnId)?.tasks.length
    ) {
      alert("Cannot delete status with tasks or in 'All Workspaces' view");
      return;
    }

    if (!confirm("Are you sure you want to delete this status?")) return;

    try {
      await taskStatusService.deleteStatus(Number(selectedWorkspace), columnId);
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const handleAddNewStatus = async () => {
    if (!newStatusName.trim() || !selectedWorkspace) return;

    try {
      const newStatus = await taskStatusService.createStatus(
        Number(selectedWorkspace),
        {
          name: newStatusName,
          color: newStatusColor,
        }
      );

      const newColumn: Column = {
        ...newStatus,
        tasks: [],
        isEditing: false,
        isHovered: false,
      };

      if (isAddingStatus?.after) {
        const index = columns.findIndex((c) => c.id === isAddingStatus.after);
        const newColumns = [...columns];
        newColumns.splice(index + 1, 0, newColumn);
        setColumns(newColumns);

        // Update order
        const reorderedStatuses = newColumns.map((col, idx) => ({
          id: col.id,
          order: idx,
        }));
        await taskStatusService.reorderStatuses(
          Number(selectedWorkspace),
          reorderedStatuses
        );
      } else {
        setColumns([...columns, newColumn]);
      }
    } catch (error) {
      console.error("Error creating new status:", error);
    } finally {
      setIsAddingStatus(null);
      setNewStatusName("");
      setNewStatusColor("#3B82F6");
    }
  };

  const handleReorderColumns = async (newOrder: Column[]) => {
    if (!selectedWorkspace) return;

    setColumns(newOrder);

    try {
      const reorderedStatuses = newOrder.map((col, index) => ({
        id: col.id,
        order: index,
      }));
      await taskStatusService.reorderStatuses(
        Number(selectedWorkspace),
        reorderedStatuses
      );
    } catch (error) {
      console.error("Error reordering columns:", error);
    }
  };

  const handleCreateTask = async (taskData: ICreateTaskRequest) => {
    try {
      await taskService.createTask(taskData);
      loadAllTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleOpenNewTaskModal = (columnStatusId: number) => {
    const currentWorkspaceId = selectedWorkspace
      ? Number(selectedWorkspace)
      : undefined;
    setModalWorkspaceId(currentWorkspaceId);
    setModalColumnStatus(columnStatusId);
    setIsNewTaskModalOpen(true);
  };

  const handleCloseNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
    setModalWorkspaceId(undefined);
    setModalColumnStatus(undefined);
  };

  const handleDragStart = (task: ITask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.status.id === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const previousColumns = columns;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
      }));

      const targetColumn = newColumns.find((col) => col.id === targetColumnId);

      if (targetColumn) {
        const updatedTask = {
          ...draggedTask,
          statusId: targetColumnId,
        };
        targetColumn.tasks.push(updatedTask);
      }
      return newColumns;
    });

    setDraggedTask(null);

    try {
      await taskService.updateTask(draggedTask.id, {
        statusId: targetColumnId,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      setColumns(previousColumns);
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + direction,
        1
      );
      return newDate;
    });
  };

  const getColumnHeaderStyle = (color: string) => {
    return {
      backgroundColor: `${color}15`,
      borderColor: color,
      color: color,
    };
  };

  const getPriorityColor = (priority: ITask["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "MEDIUM":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      case "LOW":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  const getPriorityBadgeColor = (priority: ITask["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Squares2X2Icon className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dynamic Kanban Board
            </h1>
            <SparklesIcon className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your workflow with dynamic status columns
          </p>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Month Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white w-48 text-center">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Workspace Selector and Search */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Workspace Selector */}
            <div className="relative w-full sm:w-56">
              <button
                onClick={() =>
                  setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
                }
                className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-between hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {workspaces?.find(
                      (w) => w.id.toString() === selectedWorkspace
                    )?.name || "Select Workspace"}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    isWorkspaceDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {isWorkspaceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-64 overflow-y-auto"
                  >
                    {workspaces?.map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          setSelectedWorkspace(workspace.id.toString());
                          setIsWorkspaceDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {workspace.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading tasks...
              </p>
            </div>
          </motion.div>
        ) : (
          /* Kanban Board */
          <div className="relative">
            <Reorder.Group
              axis="x"
              values={filteredColumns}
              onReorder={handleReorderColumns}
              className="flex gap-6 overflow-x-auto pb-6"
            >
              <AnimatePresence>
                {filteredColumns.map((column, columnIndex) => (
                  <React.Fragment key={column.id}>
                    <Reorder.Item
                      value={column}
                      dragListener={!!selectedWorkspace}
                      className="flex-shrink-0 w-80"
                      onMouseEnter={() => setHoveredColumn(column.id)}
                      onMouseLeave={() => setHoveredColumn(null)}
                      onDragOver={handleDragOver}
                      onDrop={(e: React.DragEvent<Element>) =>
                        handleDrop(e, column.id)
                      }
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3, delay: columnIndex * 0.1 }}
                        className="h-full"
                      >
                        {/* Column Header */}
                        <div
                          className="rounded-t-xl p-4 border-2 relative group"
                          style={getColumnHeaderStyle(column.color)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              {!!selectedWorkspace && (
                                <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Squares2X2Icon className="w-4 h-4" />
                                </div>
                              )}
                              {editingColumn === column.id ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingName}
                                  onChange={(e) =>
                                    setEditingName(e.target.value)
                                  }
                                  onBlur={handleSaveColumnName}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter")
                                      handleSaveColumnName();
                                  }}
                                  className="font-semibold text-lg bg-transparent outline-none border-b-2 flex-1"
                                  style={{ borderColor: column.color }}
                                />
                              ) : (
                                <h3
                                  className="font-semibold text-lg cursor-pointer flex-1"
                                  onClick={() =>
                                    !!selectedWorkspace &&
                                    handleEditColumn(column.id)
                                  }
                                >
                                  {column.name}
                                </h3>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-sm font-bold px-2 py-1 rounded-full"
                                style={{
                                  backgroundColor: `${column.color}30`,
                                  color: column.color,
                                }}
                              >
                                {column.tasks.length}
                              </span>

                              {/* Actions for column */}
                              {!!selectedWorkspace &&
                                hoveredColumn === column.id && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-1"
                                  >
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setShowColorPicker(
                                            showColorPicker === column.id
                                              ? null
                                              : column.id
                                          )
                                        }
                                        className="p-1 hover:bg-white/20 rounded"
                                        style={{ color: column.color }}
                                      >
                                        <div
                                          className="w-4 h-4 rounded-full border-2"
                                          style={{
                                            borderColor: column.color,
                                            backgroundColor: column.color,
                                          }}
                                        />
                                      </button>
                                      {showColorPicker === column.id && (
                                        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-50 grid grid-cols-4 gap-2">
                                          {COLORS.map((color) => (
                                            <button
                                              key={color.value}
                                              onClick={() =>
                                                handleChangeColumnColor(
                                                  column.id,
                                                  color.value
                                                )
                                              }
                                              className="w-8 h-8 rounded-full hover:scale-110 transition-transform"
                                              style={{
                                                backgroundColor: color.value,
                                              }}
                                              title={color.name}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {column.tasks.length === 0 && (
                                      <button
                                        onClick={() =>
                                          handleDeleteColumn(column.id)
                                        }
                                        className="p-1 hover:bg-red-500/20 rounded text-red-500"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              <button
                                onClick={() =>
                                  handleOpenNewTaskModal(column.id)
                                }
                                className="opacity-75 hover:opacity-100 transition-opacity"
                                style={{ color: column.color }}
                              >
                                <PlusIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Tasks Container */}
                        <div
                          className="space-y-3 min-h-[200px] p-4 rounded-b-xl border-x-2 border-b-2"
                          style={{
                            backgroundColor: `${column.color}05`,
                            borderColor: `${column.color}20`,
                          }}
                        >
                          <AnimatePresence>
                            {column.tasks.map((task, taskIndex) => (
                              <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{
                                  duration: 0.3,
                                  delay: taskIndex * 0.05,
                                }}
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                className={`p-4 rounded-lg border-l-4 cursor-move hover:shadow-lg transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${getPriorityColor(
                                  task.priority
                                )} ${
                                  draggedTask?.id === task.id
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-3">
                                  {task.title || "Untitled"}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  {task.priority && (
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(task.dueDate)}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <button
                            onClick={() => handleOpenNewTaskModal(column.id)}
                            className="w-full p-3 border-2 border-dashed rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                            style={{
                              borderColor: `${column.color}30`,
                              color: `${column.color}80`,
                            }}
                          >
                            <PlusIcon className="w-5 h-5" />
                            Add task
                          </button>
                        </div>
                      </motion.div>
                    </Reorder.Item>

                    {/* Add New Status Button */}
                    {!!selectedWorkspace &&
                      columnIndex === filteredColumns.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-shrink-0"
                        >
                          {isAddingStatus?.after === column.id ? (
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="w-80 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
                            >
                              <input
                                ref={newStatusInputRef}
                                type="text"
                                placeholder="Status name..."
                                value={newStatusName}
                                onChange={(e) =>
                                  setNewStatusName(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Color:
                                </span>
                                <div className="flex gap-2">
                                  {COLORS.slice(0, 4).map((color) => (
                                    <button
                                      key={color.value}
                                      onClick={() =>
                                        setNewStatusColor(color.value)
                                      }
                                      className={`w-6 h-6 rounded-full ${
                                        newStatusColor === color.value
                                          ? "ring-2 ring-offset-2"
                                          : ""
                                      }`}
                                      style={{ backgroundColor: color.value }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleAddNewStatus}
                                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  <CheckIcon className="w-5 h-5 mx-auto" />
                                </button>
                                <button
                                  onClick={() => {
                                    setIsAddingStatus(null);
                                    setNewStatusName("");
                                    setNewStatusColor("#3B82F6");
                                  }}
                                  className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                >
                                  <XMarkIcon className="w-5 h-5 mx-auto" />
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() =>
                                setIsAddingStatus({ after: column.id })
                              }
                              className="w-12 h-full min-h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all group"
                            >
                              <PlusIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                            </button>
                          )}
                        </motion.div>
                      )}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        )}

        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseNewTaskModal}
          onSubmit={handleCreateTask}
          initialStatusId={modalColumnStatus}
          initialWorkspaceId={modalWorkspaceId}
        />
      </div>
    </div>
  );
};

export default KanbanView;

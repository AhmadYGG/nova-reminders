'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  SortAsc,
  SortDesc,
  CheckCircle2,
  Circle,
  Flag,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  GripVertical,
  CheckCheck,
  Trash,
  Plus,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { useTaskStore } from '@/stores/task-store';
import { format, formatDistanceToNow } from 'date-fns';

const priorityConfig = {
  urgent: { label: 'Urgent', dotColor: '#EF4444', barColor: 'bg-[#EF4444]' },
  high: { label: 'High', dotColor: '#F59E0B', barColor: 'bg-[#F59E0B]' },
  medium: { label: 'Medium', dotColor: '#7C5CFC', barColor: 'bg-[#7C5CFC]' },
  low: { label: 'Low', dotColor: '#22D3A0', barColor: 'bg-[#22D3A0]' },
};

function SortableTaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: TaskViewTask;
  onToggle: (id: string, status: string) => void;
  onEdit: (task: TaskViewTask) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const isCompleted = task.status === 'done';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative glass-card-hover overflow-hidden ${isCompleted ? 'opacity-50' : ''} ${isDragging ? 'z-50 shadow-2xl shadow-[#7C5CFC]/20' : ''}`}
    >
      {/* Priority bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priority.barColor}`} />

      <div className="flex items-start gap-3 p-4 pl-4">
        {/* Drag handle */}
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-[#5A6080]/40 hover:text-[#5A6080] transition-colors opacity-0 group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, task.status)}
          className="mt-0.5 flex-shrink-0 transition-transform duration-200 hover:scale-110"
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <CheckCircle2 className="h-5 w-5 text-[#22D3A0]" />
            </motion.div>
          ) : (
            <Circle className="h-5 w-5 text-[#5A6080] hover:text-[#7C5CFC] transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium text-[#F0F2FF] truncate transition-all ${
              isCompleted ? 'line-through text-[#5A6080]' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-[#5A6080] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority badge */}
            <Badge
              variant="outline"
              className="h-5 text-[10px] font-medium border rounded-md px-1.5"
              style={{
                color: priority.dotColor,
                borderColor: `${priority.dotColor}30`,
                backgroundColor: `${priority.dotColor}10`,
              }}
            >
              <Flag className="h-2.5 w-2.5 mr-1" />
              {priority.label}
            </Badge>

            {/* Due date */}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-[#5A6080]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <Calendar className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            )}

            {/* Category */}
            {task.category && (
              <span className="flex items-center gap-1 text-[10px] text-[#5A6080]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                {task.category.name}
              </span>
            )}

            {/* Reminder indicator */}
            {task.reminderTime && task.isNotificationEnabled && (
              <span className="text-[10px] text-[#7C5CFC]">🔔 Reminder set</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#0E1120] border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl"
          >
            <DropdownMenuItem
              onClick={() => onEdit(task)}
              className="text-[#5A6080] focus:text-[#F0F2FF] focus:bg-[rgba(255,255,255,0.04)] cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-[#EF4444] focus:text-[#EF4444] focus:bg-[rgba(239,68,68,0.1)] cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

interface TaskViewTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  reminderTime: string | null;
  isNotificationEnabled: boolean;
  priority: string;
  status: string;
  order: number;
  categoryId: string | null;
  category?: { id: string; name: string; color: string; icon: string | null } | null;
}

export function TaskView() {
  const {
    tasks,
    isLoading,
    filters,
    toggleTaskStatus,
    openEditModal,
    deleteTask,
    setFilters,
    fetchTasks,
    reorderTasks,
    bulkAction,
    openCreateModal,
  } = useTaskStore();

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute filtered tasks with useMemo instead of useState+useEffect
  const localTasks = useMemo<TaskViewTask[]>(() => {
    return tasks
      .filter((task) => {
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        return task.deletedAt === null;
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        reminderTime: t.reminderTime,
        isNotificationEnabled: t.isNotificationEnabled,
        priority: t.priority,
        status: t.status,
        order: t.order,
        categoryId: t.categoryId,
        category: t.category,
      }));
  }, [tasks, filters.status]);

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    await toggleTaskStatus(id, newStatus);
  };

  // Drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((t) => t.id === active.id);
    const newIndex = localTasks.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(localTasks, oldIndex, newIndex);

    // Send reorder to backend
    reorderTasks(
      reordered.map((task, index) => ({ id: task.id, order: index }))
    );
  };

  const pendingCount = localTasks.filter((t) => t.status === 'pending').length;
  const completedCount = localTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#F0F2FF]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            My Tasks
          </h1>
          <p className="text-[#5A6080] text-sm mt-1">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {completedCount > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => bulkAction('markAllDone')}
                className="h-8 text-xs text-[#22D3A0] hover:text-[#22D3A0] hover:bg-[rgba(34,211,160,0.1)]"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark All Done
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => bulkAction('deleteCompleted')}
                className="h-8 text-xs text-[#EF4444] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                Clear Done
              </Button>
            </div>
          )}

          {/* Sort toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setFilters({ order: filters.order === 'asc' ? 'desc' : 'asc' });
              fetchTasks();
            }}
            className="h-9 w-9 text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]"
          >
            {filters.order === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.04)] rounded-xl p-1 w-fit">
        {(['all', 'pending', 'done'] as const).map((status) => (
          <Button
            key={status}
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({ status });
              fetchTasks();
            }}
            className={`h-8 px-4 text-xs rounded-lg capitalize transition-all ${
              filters.status === status
                ? 'bg-[rgba(124,92,252,0.15)] text-[#7C5CFC] font-medium'
                : 'text-[#5A6080] hover:text-[#F0F2FF]'
            }`}
          >
            {status === 'all' ? `All (${localTasks.length})` : status === 'pending' ? `Pending (${pendingCount})` : `Done (${completedCount})`}
          </Button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.06)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgba(255,255,255,0.06)] rounded w-3/4" />
                  <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : localTasks.length === 0 ? (
        /* Nova-themed empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6"
          >
            <NovaOrb size="lg" />
          </motion.div>
          <h3
            className="text-xl font-bold text-[#F0F2FF] mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Belum ada reminder nih~
          </h3>
          <p
            className="text-[#5A6080] text-sm mb-6 max-w-xs"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Yuk tambah satu! Nova bakal bantu ingetin kamu tepat waktu 💜
          </p>
          <Button
            onClick={openCreateModal}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#8B6EFD] hover:to-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/20 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Reminder
          </Button>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              <AnimatePresence>
                {localTasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={(t) => openEditModal(t as never)}
                    onDelete={deleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Mobile bulk actions */}
      {!isLoading && completedCount > 0 && (
        <div className="sm:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => bulkAction('markAllDone')}
            className="flex-1 h-9 text-xs text-[#22D3A0] hover:text-[#22D3A0] hover:bg-[rgba(34,211,160,0.1)] border border-[rgba(34,211,160,0.2)] rounded-xl"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Mark All Done
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => bulkAction('deleteCompleted')}
            className="flex-1 h-9 text-xs text-[#EF4444] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl"
          >
            <Trash className="h-3.5 w-3.5 mr-1" />
            Clear Done
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { create } from 'zustand';
import type { Task, Category, CreateTaskInput, UpdateTaskInput, SortOption, FilterStatus, Priority } from '@/types';

interface TaskFilters {
  status: FilterStatus;
  search: string;
  category?: string;
  priority?: Priority;
  sort: SortOption;
  order: 'asc' | 'desc';
  includeDeleted?: boolean;
}

interface TaskState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  isModalOpen: boolean;
  selectedTask: Task | null;
  editingTaskId: string | null;
  filters: TaskFilters;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput | Record<string, unknown>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string, newStatus?: string) => Promise<void>;
  reorderTasks: (items: { id: string; order: number }[]) => Promise<void>;
  bulkAction: (action: 'markAllDone' | 'deleteCompleted', taskIds?: string[]) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  permanentDeleteTask: (id: string) => Promise<void>;

  // Modal
  openModal: (task?: Task) => void;
  closeModal: () => void;
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;

  // Filters
  setFilters: (filters: Partial<TaskFilters>) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterCategory: (categoryId: string | null) => void;
  setFilterPriority: (priority: Priority | null) => void;
  setSearchQuery: (query: string) => void;
  setSortOption: (option: SortOption) => void;
}

const defaultFilters: TaskFilters = {
  status: 'all',
  search: '',
  sort: 'createdAt',
  order: 'desc',
  includeDeleted: false,
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  isLoading: false,
  isModalOpen: false,
  selectedTask: null,
  editingTaskId: null,
  filters: defaultFilters,

  fetchTasks: async () => {
    try {
      set({ isLoading: true });
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      params.set('sort', filters.sort);
      params.set('order', filters.order);
      if (filters.search) params.set('search', filters.search);
      if (filters.includeDeleted) params.set('includeDeleted', 'true');

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ tasks: data.tasks, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        set({ categories: data.categories });
      }
    } catch {
      // Ignore
    }
  },

  createTask: async (input: CreateTaskInput) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        set((state) => ({ tasks: [data.task, ...state.tasks] }));
      }
    } catch {
      // Ignore
    }
  },

  updateTask: async (id: string, input: UpdateTaskInput | Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data.task : t)),
        }));
      }
    } catch {
      // Ignore
    }
  },

  deleteTask: async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
          ),
        }));
      }
    } catch {
      // Ignore
    }
  },

  toggleTaskStatus: async (id: string, newStatus?: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const status = newStatus || (task.status === 'pending' ? 'done' : 'pending');

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: status as 'pending' | 'done' } : t
      ),
    }));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        // Revert on error
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: task.status } : t
          ),
        }));
      } else {
        const data = await res.json();
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data.task : t)),
        }));
      }
    } catch {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: task.status } : t
        ),
      }));
    }
  },

  reorderTasks: async (items: { id: string; order: number }[]) => {
    // Optimistic update
    const currentTasks = get().tasks;
    const updatedTasks = currentTasks.map((task) => {
      const reorderedItem = items.find((item) => item.id === task.id);
      if (reorderedItem) {
        return { ...task, order: reorderedItem.order };
      }
      return task;
    });
    set({ tasks: updatedTasks });

    try {
      await fetch('/api/tasks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch {
      // Revert
      set({ tasks: currentTasks });
    }
  },

  bulkAction: async (action: 'markAllDone' | 'deleteCompleted', taskIds?: string[]) => {
    try {
      const res = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, taskIds }),
      });
      if (res.ok) {
        await get().fetchTasks();
      }
    } catch {
      // Ignore
    }
  },

  restoreTask: async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedAt: null }),
      });
      if (res.ok) {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, deletedAt: null } : t
          ),
        }));
      }
    } catch {
      // Ignore
    }
  },

  permanentDeleteTask: async (id: string) => {
    try {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch {
      // Ignore
    }
  },

  openModal: (task?: Task) => {
    set({ isModalOpen: true, selectedTask: task || null, editingTaskId: task?.id || null });
  },

  closeModal: () => {
    set({ isModalOpen: false, selectedTask: null, editingTaskId: null });
  },

  openCreateModal: () => {
    set({ isModalOpen: true, selectedTask: null, editingTaskId: null });
  },

  openEditModal: (task: Task) => {
    set({ isModalOpen: true, selectedTask: task, editingTaskId: task.id });
  },

  setFilters: (newFilters: Partial<TaskFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setFilterStatus: (status: FilterStatus) => {
    set((state) => ({
      filters: { ...state.filters, status },
    }));
    get().fetchTasks();
  },

  setFilterCategory: (categoryId: string | null) => {
    set((state) => ({
      filters: { ...state.filters, category: categoryId || undefined },
    }));
    get().fetchTasks();
  },

  setFilterPriority: (priority: Priority | null) => {
    set((state) => ({
      filters: { ...state.filters, priority: priority || undefined },
    }));
    get().fetchTasks();
  },

  setSearchQuery: (query: string) => {
    set((state) => ({
      filters: { ...state.filters, search: query },
    }));
  },

  setSortOption: (option: SortOption) => {
    set((state) => ({
      filters: { ...state.filters, sort: option },
    }));
    get().fetchTasks();
  },
}));

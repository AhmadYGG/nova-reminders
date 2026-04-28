export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  reminderTime: string | null;
  isNotificationEnabled: boolean;
  notificationSent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'done';
  order: number;
  categoryId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
  taskCount?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  taskId: string | null;
  message: string;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
  task?: Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'dueDate'>;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  reminderTime?: string;
  isNotificationEnabled?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  categoryId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  reminderTime?: string | null;
  isNotificationEnabled?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'done';
  categoryId?: string | null;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'done';
export type SortOption = 'dueDate' | 'createdAt' | 'priority' | 'order';
export type FilterStatus = 'all' | 'pending' | 'done';

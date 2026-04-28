'use client';

import { create } from 'zustand';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isPanelOpen: boolean;
  showPanel: boolean;
  pollingInterval: NodeJS.Timeout | null;

  fetchNotifications: () => Promise<void>;
  fetchPending: () => Promise<AppNotification[]>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isPanelOpen: false,
  showPanel: false,
  pollingInterval: null,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const notifications = data.notifications as AppNotification[];
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPending: async () => {
    try {
      const res = await fetch('/api/notifications/pending');
      if (res.ok) {
        const data = await res.json();
        const newNotifications = data.notifications as AppNotification[];

        if (newNotifications.length > 0) {
          set((state) => {
            const existingIds = new Set(state.notifications.map((n) => n.id));
            const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id));
            const allNotifications = [...uniqueNew, ...state.notifications];
            return {
              notifications: allNotifications,
              unreadCount: allNotifications.filter((n) => !n.isRead).length,
            };
          });
        }

        return newNotifications;
      }
      return [];
    } catch {
      return [];
    }
  },

  markAsRead: async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch {
      // Ignore
    }
  },

  markAllRead: async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      }
    } catch {
      // Ignore
    }
  },

  markAllAsRead: async () => {
    return get().markAllRead();
  },

  openPanel: () => set({ isPanelOpen: true, showPanel: true }),
  closePanel: () => set({ isPanelOpen: false, showPanel: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen, showPanel: !state.showPanel })),

  startPolling: () => {
    const existing = get().pollingInterval;
    if (existing) clearInterval(existing);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      get().fetchPending();
    }, 30000);

    set({ pollingInterval: interval });

    // Also fetch immediately
    get().fetchPending();
  },

  stopPolling: () => {
    const interval = get().pollingInterval;
    if (interval) {
      clearInterval(interval);
      set({ pollingInterval: null });
    }
  },

  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));

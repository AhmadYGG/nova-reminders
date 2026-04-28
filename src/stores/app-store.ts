'use client';

import { create } from 'zustand';

type AppView = 'tasks' | 'trash' | 'notifications';

interface AppState {
  currentView: AppView;
  activeView: AppView;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isInitialized: boolean;

  setCurrentView: (view: AppView) => void;
  setActiveView: (view: AppView) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'tasks',
  activeView: 'tasks',
  sidebarOpen: true,
  sidebarCollapsed: false,
  isInitialized: false,

  setCurrentView: (view: AppView) => set({ currentView: view, activeView: view }),
  setActiveView: (view: AppView) => set({ currentView: view, activeView: view }),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
}));

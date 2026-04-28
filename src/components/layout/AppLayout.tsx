'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useTaskStore } from '@/stores/task-store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Starfield } from '@/components/ui/Starfield';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchCategories = useTaskStore((s) => s.fetchCategories);

  // Fetch initial data once when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex bg-[#07080F] text-[#F0F2FF] relative">
      {/* Starfield background */}
      <Starfield count={80} className="fixed inset-0 z-0" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen min-w-0">
          <TopBar />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

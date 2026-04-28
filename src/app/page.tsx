'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { AuthForm } from '@/components/auth/AuthForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskView } from '@/components/views/TaskView';
import { TrashView } from '@/components/views/TrashView';
import { NotificationView } from '@/components/views/NotificationView';
import { TaskModal } from '@/components/tasks/TaskModal';
import { NovaBubbles } from '@/components/notifications/NovaBubbles';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { NotificationPermission } from '@/components/notifications/NotificationPermission';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { motion } from 'framer-motion';

function MainContent() {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <motion.div
      key={activeView}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {activeView === 'tasks' && <TaskView />}
      {activeView === 'trash' && <TrashView />}
      {activeView === 'notifications' && <NotificationView />}
    </motion.div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080F]">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <NovaOrb size="lg" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <>
      <AppLayout>
        <MainContent />
      </AppLayout>
      <TaskModal />
      <NovaBubbles />
      <NotificationPanel />
      <NotificationPermission />
    </>
  );
}

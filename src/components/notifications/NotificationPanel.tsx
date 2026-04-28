'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { useNotificationStore } from '@/stores/notification-store';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    isPanelOpen,
    openPanel,
    closePanel,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (isPanelOpen) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelOpen]);

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <Sheet open={isPanelOpen} onOpenChange={(open) => !open && closePanel()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#0E1120] border-l border-white/[0.06] text-[#F0F2FF] p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3">
              <NovaOrb size="sm" />
              <span style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold">
                Nova&apos;s Messages
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-[#7C5CFC] hover:text-[#9B7FFF] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <NovaOrb size="md" />
              </motion.div>
              <p
                className="mt-4 text-sm text-[#5A6080]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Nova belum ada pesan untukmu~
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                    className={cn(
                      'relative p-4 rounded-xl cursor-pointer transition-all',
                      'hover:bg-white/[0.04]',
                      !notification.isRead && 'border-l-2 border-l-[#7C5CFC]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <NovaOrb size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: '#7C5CFC', fontFamily: "'Syne', sans-serif" }}
                          >
                            Nova
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-pulse" />
                            )}
                            <span
                              className="text-[10px] text-[#5A6080]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        <p
                          className={cn(
                            'text-sm mt-1 leading-relaxed',
                            notification.isRead ? 'text-[#5A6080]' : 'text-[#F0F2FF]/90'
                          )}
                        >
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

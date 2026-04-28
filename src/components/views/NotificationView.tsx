'use client';

import { motion } from 'framer-motion';
import { Bell, CheckCheck, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notification-store';
import { formatDistanceToNow } from 'date-fns';

export function NotificationView() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllRead } = useNotificationStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#F0F2FF]"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Notifications
          </h1>
          <p className="text-[#5A6080] text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-[#7C5CFC] hover:text-[#8B6EFD] hover:bg-[rgba(124,92,252,0.1)]"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)] mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgba(255,255,255,0.06)] rounded w-full" />
                  <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-[#5A6080]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F0F2FF]" style={{ fontFamily: 'var(--font-syne)' }}>
            No notifications
          </h3>
          <p className="text-[#5A6080] text-sm mt-1 max-w-xs">
            Nova will notify you when tasks are due or reminders trigger
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className={`glass-card-hover p-4 cursor-pointer ${
                !notification.isRead ? 'border-l-2 border-l-[#7C5CFC]' : ''
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification.id);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {!notification.isRead ? (
                    <Sparkles className="h-4 w-4 text-[#7C5CFC]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[rgba(255,255,255,0.06)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${notification.isRead ? 'text-[#5A6080]' : 'text-[#F0F2FF]'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-[#5A6080]" />
                    <span className="text-xs text-[#5A6080] font-mono">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

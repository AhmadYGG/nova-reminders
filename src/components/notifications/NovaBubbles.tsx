'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import { formatDistanceToNow } from 'date-fns';
import type { AppNotification } from '@/types';

interface VisibleBubble {
  notification: AppNotification;
  id: string;
  progress: number;
  startTime: number;
}

const AUTO_DISMISS_MS = 8000;
const MAX_BUBBLES = 3;
const POLL_INTERVAL_MS = 30000;

export function NovaBubbles() {
  const { isAuthenticated } = useAuthStore();
  const fetchPending = useNotificationStore((s) => s.fetchPending);
  const fetchPendingRef = useRef(fetchPending);
  fetchPendingRef.current = fetchPending;

  const [visibleBubbles, setVisibleBubbles] = useState<VisibleBubble[]>([]);
  const dismissedIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  // Setup polling once on mount, cleanup on unmount
  useEffect(() => {
    const checkNew = async () => {
      if (!isAuthenticatedRef.current) return;

      const newNotifs = await fetchPendingRef.current();
      if (!newNotifs || newNotifs.length === 0) return;

      setVisibleBubbles((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));
        const fresh = newNotifs
          .filter((n) => !existingIds.has(n.id) && !dismissedIdsRef.current.has(n.id))
          .map((n) => ({
            notification: n,
            id: n.id,
            progress: 100,
            startTime: Date.now(),
          }));

        if (fresh.length === 0) return prev;
        return [...prev, ...fresh].slice(-MAX_BUBBLES);
      });
    };

    // Initial check after auth is confirmed
    const initTimer = setTimeout(() => {
      if (isAuthenticatedRef.current) {
        checkNew();
      }
    }, 1000);

    // Setup interval
    intervalRef.current = setInterval(checkNew, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Run only once on mount

  // Auto-dismiss timer
  useEffect(() => {
    if (visibleBubbles.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setVisibleBubbles((prev) => {
        const updated = prev
          .map((b) => ({
            ...b,
            progress: Math.max(0, 100 - ((now - b.startTime) / AUTO_DISMISS_MS) * 100),
          }))
          .filter((b) => {
            if (b.progress <= 0) {
              dismissedIdsRef.current.add(b.id);
              return false;
            }
            return true;
          });
        return updated;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [visibleBubbles.length]);

  const dismissBubble = useCallback((id: string) => {
    dismissedIdsRef.current.add(id);
    setVisibleBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  if (!isAuthenticated || visibleBubbles.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {visibleBubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 20, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className="group relative nova-glass rounded-2xl p-4 shadow-[0_0_20px_rgba(124,92,252,0.15)] max-w-sm"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <NovaOrb size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: '#7C5CFC', fontFamily: "'Syne', sans-serif" }}
                  >
                    Nova
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] text-[#5A6080]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {formatDistanceToNow(new Date(bubble.notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <button
                      onClick={() => dismissBubble(bubble.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5A6080] hover:text-[#F0F2FF]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-[#F0F2FF]/90 mt-1 leading-relaxed">
                  {bubble.notification.message}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF]"
                style={{ width: `${bubble.progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

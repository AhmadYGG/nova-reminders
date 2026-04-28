'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { Button } from '@/components/ui/button';
import { usePushNotification } from '@/hooks/use-push-notification';

interface NotificationPermissionProps {
  onClose?: () => void;
}

export function NotificationPermission({ onClose }: NotificationPermissionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { permission, isSupported, isLoading, requestPermission } = usePushNotification();

  useEffect(() => {
    // Show dialog if:
    // 1. Notifications are supported
    // 2. Permission is default (not granted or denied)
    // 3. User hasn't dismissed it recently
    const dismissed = localStorage.getItem('nova-notification-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    if (isSupported && permission === 'default' && dismissedTime < sevenDaysAgo) {
      // Show after 2 seconds delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleAllow = async () => {
    try {
      await requestPermission();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  };

  const handleLater = () => {
    // Remember dismissal for 7 days
    localStorage.setItem('nova-notification-dismissed', Date.now().toString());
    setIsOpen(false);
    onClose?.();
  };

  if (!isSupported || permission !== 'default') {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleLater}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6"
          >
            <div className="nova-glass rounded-2xl p-8 shadow-[0_0_40px_rgba(124,92,252,0.2)] relative">
              {/* Close button */}
              <button
                onClick={handleLater}
                className="absolute top-4 right-4 text-[#5A6080] hover:text-[#F0F2FF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center">
                {/* Nova Orb */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-6"
                >
                  <NovaOrb size="lg" />
                </motion.div>

                {/* Title */}
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  <span className="nova-gradient-text">Izinkan Notifikasi?</span>
                </h2>

                {/* Description */}
                <p className="text-[#5A6080] text-sm mb-6 leading-relaxed">
                  Nova akan mengirimkan notifikasi reminder tepat waktu. 
                  Kamu bisa mengatur ini kapan saja di pengaturan.
                </p>

                {/* Icon feature list */}
                <div className="flex flex-col gap-3 mb-8 w-full">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#7C5CFC]/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-[#7C5CFC]" />
                    </div>
                    <span className="text-sm text-[#F0F2FF]/80">
                      Reminder tepat waktu
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-[#00D4FF]" />
                    </div>
                    <span className="text-sm text-[#F0F2FF]/80">
                      Notifikasi bahkan saat browser minimize
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                  <Button
                    variant="ghost"
                    onClick={handleLater}
                    disabled={isLoading}
                    className="flex-1 text-[#5A6080] hover:text-[#F0F2FF] hover:bg-white/[0.04]"
                  >
                    Nanti Saja
                  </Button>
                  <Button
                    onClick={handleAllow}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-[#7C5CFC] to-[#6B4FE0] text-white font-semibold shadow-[0_0_20px_rgba(124,92,252,0.3)] hover:shadow-[0_0_30px_rgba(124,92,252,0.5)] hover:from-[#8B6BFF] hover:to-[#7C5CFC]"
                  >
                    {isLoading ? 'Memproses...' : 'Izinkan ✓'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

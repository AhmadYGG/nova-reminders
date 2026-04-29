'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Plus,
  Menu,
  LogOut,
  User,
  Settings,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useTaskStore } from '@/stores/task-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDistanceToNow } from 'date-fns';

export function TopBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const { user, logout } = useAuthStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    showPanel,
    togglePanel,
    closePanel,
  } = useNotificationStore();
  const openCreateModal = useTaskStore((s) => s.openCreateModal);
  const setFilters = useTaskStore((s) => s.setFilters);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const isMobile = useIsMobile();

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFilters({ search: searchValue });
      fetchTasks();
    },
    [searchValue, setFilters, fetchTasks]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      if (e.target.value === '') {
        setFilters({ search: '' });
        fetchTasks();
      }
    },
    [setFilters, fetchTasks]
  );

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 sm:px-6 border-b border-[rgba(255,255,255,0.06)] bg-[#07080F]/80 backdrop-blur-xl">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6080]" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9 h-9 bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] text-[#F0F2FF] placeholder:text-[#5A6080] focus-visible:ring-[#7C5CFC]/50 rounded-xl text-sm"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]"
            onClick={() => setActiveView('notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C5CFC] text-white text-[10px] font-bold"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </Button>
        ) : (
        <Popover open={showPanel} onOpenChange={(open) => { if (!open) closePanel(); else togglePanel(); }}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C5CFC] text-white text-[10px] font-bold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 bg-[#0E1120] border-[rgba(255,255,255,0.06)] rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-[#F0F2FF]" style={{ fontFamily: 'var(--font-syne)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-7 text-xs text-[#7C5CFC] hover:text-[#7C5CFC] hover:bg-[rgba(124,92,252,0.1)]"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-[#5A6080] text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full text-left p-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors ${
                        !notification.isRead ? 'bg-[rgba(124,92,252,0.05)]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notification.isRead ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[#7C5CFC]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${notification.isRead ? 'text-[#5A6080]' : 'text-[#F0F2FF]'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#5A6080] mt-1 font-mono">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
        )}

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8 border border-[rgba(255,255,255,0.06)]">
                <AvatarFallback className="bg-gradient-to-br from-[#7C5CFC] to-[#00D4FF] text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#0E1120] border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl"
          >
            <div className="p-3">
              <p className="text-sm font-medium text-[#F0F2FF]">{user?.name || 'User'}</p>
              <p className="text-xs text-[#5A6080]">{user?.email || ''}</p>
            </div>
            <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
            <DropdownMenuItem className="text-[#5A6080] focus:text-[#F0F2FF] focus:bg-[rgba(255,255,255,0.04)] cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#5A6080] focus:text-[#F0F2FF] focus:bg-[rgba(255,255,255,0.04)] cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
            <DropdownMenuItem
              onClick={logout}
              className="text-[#EF4444] focus:text-[#EF4444] focus:bg-[rgba(239,68,68,0.1)] cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New Task button */}
        <Button
          onClick={openCreateModal}
          className="hidden sm:flex h-9 px-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#8B6EFD] hover:to-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/20 transition-all duration-200 nova-btn-glow"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="text-sm font-medium">New Task</span>
        </Button>

        {/* Mobile new task */}
        <Button
          onClick={openCreateModal}
          size="icon"
          className="sm:hidden h-9 w-9 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-white shadow-lg shadow-[#7C5CFC]/20"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

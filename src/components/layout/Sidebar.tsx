'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  Bell,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useTaskStore } from '@/stores/task-store';

interface NavItem {
  id: 'tasks' | 'notifications' | 'trash';
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, activeView, setSidebarOpen, toggleSidebarCollapsed, setActiveView } = useAppStore();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const categories = useTaskStore((s) => s.categories);

  const navItems: NavItem[] = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <ListTodo className="h-5 w-5" />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: <Trash2 className="h-5 w-5" />,
    },
  ];

  const handleNavClick = (id: NavItem['id']) => {
    setActiveView(id);
    setSidebarOpen(false); // close sidebar on mobile after nav
  };

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed top-0 left-0 z-50 h-full
          bg-[#0E1120] border-r border-[rgba(255,255,255,0.06)]
          flex flex-col
          transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
        style={{ willChange: 'transform, width' }}
      >
        {/* Nova Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-[rgba(255,255,255,0.06)] ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#00D4FF] nova-avatar-glow flex-shrink-0">
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>N</span>
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-xl font-extrabold tracking-wider text-gradient-purple-cyan"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              NOVA
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group relative
                  ${sidebarCollapsed ? 'justify-center' : ''}
                  ${
                    activeView === item.id
                      ? 'sidebar-item-active'
                      : 'text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]'
                  }
                `}
              >
                <span className={`flex-shrink-0 transition-colors duration-200 ${activeView === item.id ? 'text-[#7C5CFC]' : 'group-hover:text-[#7C5CFC]'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-[20px] px-1.5 text-xs bg-[#7C5CFC] text-white border-0"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
                {sidebarCollapsed && item.badge !== undefined && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#7C5CFC] ring-2 ring-[#0E1120]" />
                )}
              </button>
            ))}
          </div>

          {/* Categories Section */}
          {!sidebarCollapsed && categories.length > 0 && (
            <>
              <Separator className="my-4 bg-[rgba(255,255,255,0.06)]" />
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-[#5A6080] mb-2">
                  Categories
                </h3>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveView('tasks')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 group"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 0 2px #0E1120, 0 0 0 4px ${cat.color}40` }}
                    />
                    <span className="text-sm font-medium flex-1 text-left truncate">{cat.name}</span>
                    {cat.taskCount !== undefined && (
                      <span className="text-xs text-[#5A6080]">{cat.taskCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {sidebarCollapsed && categories.length > 0 && (
            <>
              <Separator className="my-4 bg-[rgba(255,255,255,0.06)]" />
              <div className="space-y-2 flex flex-col items-center">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    title={cat.name}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
                    style={{ boxShadow: `0 0 8px ${cat.color}20` }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </ScrollArea>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block px-3 py-2 border-t border-[rgba(255,255,255,0.06)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebarCollapsed}
            className="w-full justify-center text-[#5A6080] hover:text-[#F0F2FF] hover:bg-[rgba(255,255,255,0.04)]"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span className="ml-2 text-xs">Collapse</span>}
          </Button>
        </div>

        {/* User Profile */}
        <div className={`px-3 py-3 border-t border-[rgba(255,255,255,0.06)] ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#5A6080] hover:text-[#EF4444]"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-[rgba(255,255,255,0.06)]">
                <AvatarFallback className="bg-gradient-to-br from-[#7C5CFC] to-[#00D4FF] text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F2FF] truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-[#5A6080] truncate">
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors text-[#5A6080] hover:text-[#EF4444]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

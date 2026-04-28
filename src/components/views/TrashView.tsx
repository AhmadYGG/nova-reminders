'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/stores/task-store';
import { format } from 'date-fns';

export function TrashView() {
  const { tasks, isLoading, setFilters, fetchTasks, updateTask } = useTaskStore();

  useEffect(() => {
    setFilters({ includeDeleted: true, status: 'all' });
    fetchTasks();
    return () => {
      setFilters({ includeDeleted: false, status: 'all' });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deletedTasks = tasks.filter((task) => task.deletedAt !== null);

  const handleRestore = async (id: string) => {
    await updateTask(id, { deletedAt: null } as unknown as Partial<typeof tasks[0]>);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#F0F2FF]"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          Trash
        </h1>
        <p className="text-[#5A6080] text-sm mt-1">
          {deletedTasks.length} deleted task{deletedTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Warning */}
      {deletedTasks.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)]">
          <AlertTriangle className="h-4 w-4 text-[#F59E0B] flex-shrink-0" />
          <p className="text-xs text-[#F59E0B]">
            Deleted tasks can be restored. They will be permanently removed after 30 days.
          </p>
        </div>
      )}

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgba(255,255,255,0.06)] rounded w-3/4" />
                  <div className="h-3 bg-[rgba(255,255,255,0.04)] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : deletedTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-[#5A6080]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F0F2FF]" style={{ fontFamily: 'var(--font-syne)' }}>
            Trash is empty
          </h3>
          <p className="text-[#5A6080] text-sm mt-1 max-w-xs">
            Deleted tasks will appear here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {deletedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className="glass-card p-4 opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#5A6080] line-through truncate">
                    {task.title}
                  </h3>
                  {task.deletedAt && (
                    <p className="text-xs text-[#5A6080] mt-1 font-mono">
                      Deleted {format(new Date(task.deletedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(task.id)}
                  className="h-8 text-xs text-[#7C5CFC] hover:text-[#8B6EFD] hover:bg-[rgba(124,92,252,0.1)]"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Restore
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

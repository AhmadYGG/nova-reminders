'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { useTaskStore } from '@/stores/task-store';
import type { Priority, Category } from '@/types';
import { Loader2, CalendarIcon, Clock, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(1, 'Judul diperlukan').max(200, 'Judul maksimal 200 karakter'),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter').optional(),
  dueDate: z.string().optional(),
  reminderTime: z.string().optional(),
  isNotificationEnabled: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  categoryId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#22D3A0' },
  { value: 'medium', label: 'Medium', color: '#00D4FF' },
  { value: 'high', label: 'High', color: '#F59E0B' },
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
];

export function TaskModal() {
  const { isModalOpen, selectedTask, categories, closeModal, createTask, updateTask, fetchCategories } = useTaskStore();
  const [isSaving, setIsSaving] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [reminderDateOpen, setReminderDateOpen] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>();
  const [selectedReminderDate, setSelectedReminderDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState('09:00');
  const [reminderTime, setReminderTime] = useState('09:00');

  const isEditing = !!selectedTask;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      reminderTime: '',
      isNotificationEnabled: true,
      priority: 'medium',
      categoryId: '',
    },
  });

  useEffect(() => {
    if (isModalOpen) {
      fetchCategories();
      if (selectedTask) {
        form.reset({
          title: selectedTask.title,
          description: selectedTask.description || '',
          dueDate: selectedTask.dueDate || '',
          reminderTime: selectedTask.reminderTime || '',
          isNotificationEnabled: selectedTask.isNotificationEnabled,
          priority: selectedTask.priority,
          categoryId: selectedTask.categoryId || '',
        });
        if (selectedTask.dueDate) {
          setSelectedDueDate(new Date(selectedTask.dueDate));
          setDueTime(format(new Date(selectedTask.dueDate), 'HH:mm'));
        }
        if (selectedTask.reminderTime) {
          setSelectedReminderDate(new Date(selectedTask.reminderTime));
          setReminderTime(format(new Date(selectedTask.reminderTime), 'HH:mm'));
        }
      } else {
        form.reset({
          title: '',
          description: '',
          dueDate: '',
          reminderTime: '',
          isNotificationEnabled: true,
          priority: 'medium',
          categoryId: '',
        });
        setSelectedDueDate(undefined);
        setSelectedReminderDate(undefined);
        setDueTime('09:00');
        setReminderTime('09:00');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, selectedTask]);

  const onSubmit = async (data: TaskFormData) => {
    setIsSaving(true);

    try {
      // Combine date + time
      let dueDateISO: string | undefined;
      if (selectedDueDate) {
        const [hours, minutes] = dueTime.split(':').map(Number);
        const date = new Date(selectedDueDate);
        date.setHours(hours, minutes, 0, 0);
        dueDateISO = date.toISOString();
      }

      let reminderTimeISO: string | undefined;
      if (selectedReminderDate) {
        const [hours, minutes] = reminderTime.split(':').map(Number);
        const date = new Date(selectedReminderDate);
        date.setHours(hours, minutes, 0, 0);
        reminderTimeISO = date.toISOString();
      }

      const payload = {
        title: data.title,
        description: data.description || undefined,
        dueDate: dueDateISO,
        reminderTime: reminderTimeISO,
        isNotificationEnabled: data.isNotificationEnabled,
        priority: data.priority,
        categoryId: data.categoryId || undefined,
      };

      if (isEditing && selectedTask) {
        await updateTask(selectedTask.id, payload);
      } else {
        await createTask(payload);
      }

      closeModal();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-lg bg-[#0E1120] border border-white/[0.06] text-[#F0F2FF] p-0 overflow-hidden">
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-3">
                  <NovaOrb size="sm" />
                  <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold">
                    {isEditing ? 'Edit Reminder' : 'New Reminder'}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Title *</label>
                  <input
                    {...form.register('title')}
                    placeholder="What do you need to remember?"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/40 focus:shadow-[0_0_15px_rgba(124,92,252,0.1)] transition-all"
                  />
                  {form.formState.errors.title && (
                    <p className="text-[#EF4444] text-xs">{form.formState.errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Description</label>
                  <textarea
                    {...form.register('description')}
                    placeholder="Add more details..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/40 focus:shadow-[0_0_15px_rgba(124,92,252,0.1)] transition-all resize-none"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70 flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Due Date
                  </label>
                  <div className="flex gap-2">
                    <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-left transition-all hover:border-[#7C5CFC]/30',
                            selectedDueDate ? 'text-[#F0F2FF]' : 'text-[#5A6080]'
                          )}
                        >
                          {selectedDueDate ? format(selectedDueDate, 'MMM d, yyyy') : 'Pick a date'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#0E1120] border-white/[0.06]" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDueDate}
                          onSelect={(date) => {
                            setSelectedDueDate(date ?? undefined);
                            setDueDateOpen(false);
                          }}
                          className="bg-[#0E1120] text-[#F0F2FF]"
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#F0F2FF] focus:outline-none focus:border-[#7C5CFC]/40 transition-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  </div>
                </div>

                {/* Reminder Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Reminder Time
                  </label>
                  <div className="flex gap-2">
                    <Popover open={reminderDateOpen} onOpenChange={setReminderDateOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-left transition-all hover:border-[#7C5CFC]/30',
                            selectedReminderDate ? 'text-[#F0F2FF]' : 'text-[#5A6080]'
                          )}
                        >
                          {selectedReminderDate ? format(selectedReminderDate, 'MMM d, yyyy') : 'Pick a date'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#0E1120] border-white/[0.06]" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedReminderDate}
                          onSelect={(date) => {
                            setSelectedReminderDate(date ?? undefined);
                            setReminderDateOpen(false);
                          }}
                          className="bg-[#0E1120] text-[#F0F2FF]"
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#F0F2FF] focus:outline-none focus:border-[#7C5CFC]/40 transition-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  </div>
                </div>

                {/* Notification Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#F0F2FF]/70 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5" />
                    Enable Notifications
                  </label>
                  <Switch
                    checked={form.watch('isNotificationEnabled')}
                    onCheckedChange={(checked) => form.setValue('isNotificationEnabled', checked)}
                    className="data-[state=checked]:bg-[#7C5CFC]"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Priority</label>
                  <div className="flex gap-2">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setValue('priority', opt.value)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all border',
                          form.watch('priority') === opt.value
                            ? 'bg-white/[0.08] text-[#F0F2FF] border-white/[0.12]'
                            : 'bg-white/[0.02] text-[#5A6080] border-transparent hover:bg-white/[0.04]'
                        )}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F0F2FF]/70">Category</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => form.setValue('categoryId', '')}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                          !form.watch('categoryId')
                            ? 'bg-white/[0.08] text-[#F0F2FF] border-white/[0.12]'
                            : 'bg-white/[0.02] text-[#5A6080] border-transparent hover:bg-white/[0.04]'
                        )}
                      >
                        None
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => form.setValue('categoryId', cat.id)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                            form.watch('categoryId') === cat.id
                              ? 'bg-white/[0.08] text-[#F0F2FF] border-white/[0.12]'
                              : 'bg-white/[0.02] text-[#5A6080] border-transparent hover:bg-white/[0.04]'
                          )}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-[#5A6080] hover:text-[#F0F2FF] hover:bg-white/[0.06] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6B4FE0] text-white font-semibold text-sm shadow-[0_0_15px_rgba(124,92,252,0.3)] hover:shadow-[0_0_25px_rgba(124,92,252,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Reminder'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

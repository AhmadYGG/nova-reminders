import { db } from './db';
import { sendPushToUser } from './push';
import { sendReminderEmail } from './email';
import {
  generateReminderMessage,
  generateDeadlineMessage,
  generateOverdueMessage,
  formatTimeUntil,
} from './nova';

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

async function checkReminders() {
  const now = new Date();

  try {
    const dueReminders = await db.task.findMany({
      where: {
        reminderTime: { lte: now },
        isNotificationEnabled: true,
        notificationSent: false,
        deletedAt: null,
        status: 'pending',
      },
      include: { user: true },
    });

    if (dueReminders.length === 0) return;

    console.log(`🔔 [Scheduler] Found ${dueReminders.length} due reminder(s)`);

    for (const task of dueReminders) {
      const timeUntilDue = task.dueDate
        ? formatTimeUntil(new Date(task.dueDate))
        : 'sekarang';

      let message: string;
      let title: string;

      if (task.dueDate && new Date(task.dueDate) <= now) {
        title = 'Task Overdue! ⚠️';
        message = generateOverdueMessage(task.title);
      } else if (task.dueDate) {
        title = 'Deadline Mendekat! ⏰';
        message = generateDeadlineMessage(task.title, timeUntilDue);
      } else {
        title = 'Nova Reminder 🔔';
        message = generateReminderMessage(task.title, timeUntilDue);
      }

      // Send push notification
      const pushResult = await sendPushToUser(task.userId, {
        title,
        body: message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: `task-${task.id}`,
        data: { url: '/', taskId: task.id },
        actions: [
          { action: 'view', title: 'Lihat Task' },
          { action: 'complete', title: 'Tandai Selesai' },
        ],
        vibrate: [200, 100, 200],
      });

      // Send email as backup if push failed or no subscription
      if (pushResult.sent === 0) {
        await sendReminderEmail(
          task.user.email,
          task.title,
          task.description,
          new Date(task.reminderTime),
          task.dueDate ? new Date(task.dueDate) : null
        );
        console.log('📧 Email sent as fallback for task:', task.title);
      }

      // Save notification record
      await db.notification.create({
        data: {
          userId: task.userId,
          taskId: task.id,
          message,
        },
      });

      // Mark task as notified
      await db.task.update({
        where: { id: task.id },
        data: { notificationSent: true },
      });

      console.log(`✅ [Scheduler] Reminder sent for task: "${task.title}"`);
    }
  } catch (error) {
    console.error('❌ [Scheduler] Error checking reminders:', error);
  }
}

export function startReminderScheduler() {
  if (schedulerInterval) {
    console.log('⏰ [Scheduler] Already running');
    return;
  }

  // Run immediately on start
  checkReminders();

  // Then every 60 seconds
  schedulerInterval = setInterval(checkReminders, 60 * 1000);

  console.log('✅ [Scheduler] Reminder scheduler started (every 60s)');
}

export function stopReminderScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏹️ [Scheduler] Stopped');
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import {
  generateReminderMessage,
  generateDeadlineMessage,
  generateOverdueMessage,
  formatTimeUntil,
} from '@/lib/nova';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const now = new Date();
    const newNotifications: Array<{ id: string; userId: string; taskId: string | null; message: string; isRead: boolean; sentAt: Date; createdAt: Date }> = [];

    // Find tasks where reminderTime <= now AND isNotificationEnabled AND !notificationSent
    const dueReminders = await db.task.findMany({
      where: {
        userId: user.id,
        reminderTime: { lte: now },
        isNotificationEnabled: true,
        notificationSent: false,
        deletedAt: null,
        status: 'pending',
      },
    });

    // Process each due reminder
    for (const task of dueReminders) {
      const timeUntilDue = task.dueDate
        ? formatTimeUntil(new Date(task.dueDate))
        : 'sekarang';

      let message: string;
      if (task.dueDate && new Date(task.dueDate) <= now) {
        // Task is overdue
        message = generateOverdueMessage(task.title);
      } else if (task.dueDate) {
        // Task has a deadline coming up
        message = generateDeadlineMessage(task.title, timeUntilDue);
      } else {
        // Just a reminder
        message = generateReminderMessage(task.title, timeUntilDue);
      }

      const notification = await db.notification.create({
        data: {
          userId: user.id,
          taskId: task.id,
          message,
        },
      });

      // Mark notificationSent as true
      await db.task.update({
        where: { id: task.id },
        data: { notificationSent: true },
      });

      newNotifications.push(notification);
    }

    // Check for overdue tasks (dueDate < now, status = pending, not deleted)
    const overdueTasks = await db.task.findMany({
      where: {
        userId: user.id,
        dueDate: { lt: now },
        status: 'pending',
        deletedAt: null,
      },
    });

    // For overdue tasks, check if we've already sent an overdue notification today
    for (const task of overdueTasks) {
      // Check if there's already an overdue notification for this task today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingNotification = await db.notification.findFirst({
        where: {
          userId: user.id,
          taskId: task.id,
          message: { contains: 'lewat deadline' },
          createdAt: { gte: todayStart },
        },
      });

      if (!existingNotification) {
        const message = generateOverdueMessage(task.title);
        const notification = await db.notification.create({
          data: {
            userId: user.id,
            taskId: task.id,
            message,
          },
        });
        newNotifications.push(notification);
      }
    }

    return NextResponse.json(
      { notifications: newNotifications },
      { status: 200 }
    );
  } catch (error) {
    console.error('Pending notifications error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

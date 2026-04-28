import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import {
  generateReminderMessage,
  generateDeadlineMessage,
  generateOverdueMessage,
  formatTimeUntil,
} from '@/lib/nova';

export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let notificationsSent = 0;
    let notificationsFailed = 0;

    console.log(`🔔 Checking reminders at ${now.toISOString()}`);

    // Find tasks where reminderTime <= now AND !notificationSent
    const dueReminders = await db.task.findMany({
      where: {
        reminderTime: { lte: now },
        isNotificationEnabled: true,
        notificationSent: false,
        deletedAt: null,
        status: 'pending',
      },
      include: {
        user: true,
      },
    });

    console.log(`📋 Found ${dueReminders.length} due reminder(s)`);

    // Process each reminder
    for (const task of dueReminders) {
      const timeUntilDue = task.dueDate
        ? formatTimeUntil(new Date(task.dueDate))
        : 'sekarang';

      let message: string;
      let title: string;

      if (task.dueDate && new Date(task.dueDate) <= now) {
        // Task is overdue
        title = 'Task Overdue! ⚠️';
        message = generateOverdueMessage(task.title);
      } else if (task.dueDate) {
        // Task has a deadline coming up
        title = 'Deadline Mendekat! ⏰';
        message = generateDeadlineMessage(task.title, timeUntilDue);
      } else {
        // Just a reminder
        title = 'Nova Reminder 🔔';
        message = generateReminderMessage(task.title, timeUntilDue);
      }

      // Send push notification
      const result = await sendPushToUser(task.userId, {
        title,
        body: message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: `task-${task.id}`,
        data: {
          url: `/`,
          taskId: task.id,
        },
        actions: [
          { action: 'view', title: 'Lihat Task' },
          { action: 'complete', title: 'Tandai Selesai' },
        ],
        vibrate: [200, 100, 200],
      });

      notificationsSent += result.sent;
      notificationsFailed += result.failed;

      // Create notification record in database
      await db.notification.create({
        data: {
          userId: task.userId,
          taskId: task.id,
          message,
        },
      });

      // Mark as sent
      await db.task.update({
        where: { id: task.id },
        data: { notificationSent: true },
      });

      console.log(`✅ Processed reminder for task: ${task.title}`);
    }

    console.log(`📊 Cron job completed: ${notificationsSent} sent, ${notificationsFailed} failed`);

    return NextResponse.json(
      {
        success: true,
        checked: dueReminders.length,
        sent: notificationsSent,
        failed: notificationsFailed,
        timestamp: now.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

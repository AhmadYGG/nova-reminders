import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';

// Test push endpoint - protected by CRON_SECRET
// Usage: POST /api/push/send-test
// Headers: Authorization: Bearer <CRON_SECRET>
// Body: { "userId": "...", "title": "...", "body": "..." }
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, message } = body;

    if (!userId) {
      // List all users with subscriptions if no userId provided
      const subscriptions = await db.pushSubscription.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      return NextResponse.json({
        info: 'Provide userId in body to send test push',
        usersWithSubscriptions: subscriptions.map((s) => ({
          userId: s.userId,
          name: s.user.name,
          email: s.user.email,
          endpoint: s.endpoint.slice(0, 50) + '...',
        })),
      });
    }

    const result = await sendPushToUser(userId, {
      title: title || 'Nova Test 🧪',
      body: message || 'Test push notification berhasil!',
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'test-notification',
      data: { url: '/' },
      vibrate: [200, 100, 200],
    });

    return NextResponse.json({
      success: true,
      userId,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    console.error('❌ Send test push error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

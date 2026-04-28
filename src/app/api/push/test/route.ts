import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { sendPushToUser } from '@/lib/push';

// Test endpoint - only for development
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const message = body.message || 'Test notification from Nova!';

    const result = await sendPushToUser(user.id, {
      title: 'Nova Test 🧪',
      body: message,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'test-notification',
      data: {
        url: '/',
      },
      vibrate: [200, 100, 200],
    });

    return NextResponse.json(
      {
        success: true,
        sent: result.sent,
        failed: result.failed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Test push error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

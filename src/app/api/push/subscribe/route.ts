import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Data subscription tidak valid' },
        { status: 400 }
      );
    }

    // Get user agent for debugging
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check if subscription already exists
    const existing = await db.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      // Update if user changed
      if (existing.userId !== user.id) {
        await db.pushSubscription.update({
          where: { endpoint },
          data: {
            userId: user.id,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userAgent,
          },
        });
      }
      console.log('✅ Push subscription updated:', existing.id);
      return NextResponse.json(
        { success: true, subscriptionId: existing.id },
        { status: 200 }
      );
    }

    // Create new subscription
    const subscription = await db.pushSubscription.create({
      data: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    });

    console.log('✅ Push subscription created:', subscription.id);
    return NextResponse.json(
      { success: true, subscriptionId: subscription.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

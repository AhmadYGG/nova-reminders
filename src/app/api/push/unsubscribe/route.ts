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
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint tidak valid' },
        { status: 400 }
      );
    }

    // Delete subscription
    const result = await db.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: user.id,
      },
    });

    console.log(`✅ Push subscription removed: ${result.count} subscription(s)`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

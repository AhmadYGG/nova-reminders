import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/push';

export async function GET() {
  try {
    const publicKey = getVapidPublicKey();
    return NextResponse.json({ publicKey }, { status: 200 });
  } catch (error) {
    console.error('❌ Get VAPID key error:', error);
    return NextResponse.json(
      { error: 'VAPID key not configured' },
      { status: 500 }
    );
  }
}

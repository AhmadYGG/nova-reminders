import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';

// Test email endpoint
export async function POST(request: Request) {
  try {
    // Debug: log all cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('📋 Cookie header:', cookieHeader);
    
    const user = await getUserFromRequest(request);
    console.log('👤 User:', user ? user.email : 'null');
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Tidak terautentikasi',
          debug: {
            hasCookie: !!cookieHeader,
            cookieValue: cookieHeader?.substring(0, 50) + '...'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const email = body.email || user.email;

    const success = await sendTestEmail(email);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email. Check SMTP configuration.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (user) {
      // Delete session from DB
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
          const [key, ...value] = cookie.trim().split('=');
          acc[key] = value.join('=');
          return acc;
        }, {});

        const token = cookies['nova_token'];
        if (token) {
          await db.session.deleteMany({
            where: { token },
          });
        }
      }
    }

    const response = NextResponse.json(
      { message: 'Logout berhasil' },
      { status: 200 }
    );

    // Clear cookie
    response.cookies.set(COOKIE_OPTIONS.name, '', {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
      path: COOKIE_OPTIONS.path,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Nama harus antara 2-50 karakter' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    // Create default categories
    await db.category.createMany({
      data: [
        { userId: user.id, name: 'Work', color: '#EF4444', icon: '💼' },
        { userId: user.id, name: 'Personal', color: '#8B5CF6', icon: '👤' },
        { userId: user.id, name: 'Health', color: '#10B981', icon: '❤️' },
        { userId: user.id, name: 'Finance', color: '#F59E0B', icon: '💰' },
        { userId: user.id, name: 'Education', color: '#3B82F6', icon: '📚' },
      ],
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Create session
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Build response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      {
        user: userWithoutPassword,
        message: 'Registrasi berhasil!',
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set(COOKIE_OPTIONS.name, token, {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
      path: COOKIE_OPTIONS.path,
      maxAge: COOKIE_OPTIONS.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const categories = await db.category.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform to include taskCount
    const categoriesWithCount = categories.map(({ _count, ...category }) => ({
      ...category,
      taskCount: _count.tasks,
    }));

    return NextResponse.json({ categories: categoriesWithCount }, { status: 200 });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, icon } = body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Nama kategori harus antara 1-50 karakter' },
        { status: 400 }
      );
    }

    // Validate color
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!color || typeof color !== 'string' || !hexColorRegex.test(color)) {
      return NextResponse.json(
        { error: 'Warna harus berupa hex color (contoh: #FF5733)' },
        { status: 400 }
      );
    }

    // Check for duplicate category name
    const existingCategory = await db.category.findFirst({
      where: { userId: user.id, name: name.trim() },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Kategori dengan nama ini sudah ada' },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        userId: user.id,
        name: name.trim(),
        color,
        icon: icon || null,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

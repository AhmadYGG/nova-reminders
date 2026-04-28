import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, color, icon } = body;

    // Find category
    const existingCategory = await db.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
        return NextResponse.json(
          { error: 'Nama kategori harus antara 1-50 karakter' },
          { status: 400 }
        );
      }
      // Check for duplicate name (excluding current category)
      const duplicate = await db.category.findFirst({
        where: { userId: user.id, name: name.trim(), id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Kategori dengan nama ini sudah ada' },
          { status: 409 }
        );
      }
    }

    // Validate color if provided
    if (color !== undefined) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (typeof color !== 'string' || !hexColorRegex.test(color)) {
        return NextResponse.json(
          { error: 'Warna harus berupa hex color (contoh: #FF5733)' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon || null;

    const category = await db.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { id } = await params;

    // Find category
    const category = await db.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete category (tasks will lose category reference via SetNull)
    await db.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Kategori berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

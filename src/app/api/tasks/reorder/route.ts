import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items harus berupa array' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: 'Setiap item harus memiliki id dan order' },
          { status: 400 }
        );
      }
    }

    // Update each task's order in a transaction
    await db.$transaction(
      items.map((item: { id: string; order: number }) =>
        db.task.updateMany({
          where: { id: item.id, userId: user.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json(
      { message: 'Urutan tugas berhasil diperbarui' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder tasks error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

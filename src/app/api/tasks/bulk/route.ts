import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { action, taskIds } = body;

    if (!action || !['markAllDone', 'deleteCompleted'].includes(action)) {
      return NextResponse.json(
        { error: 'Action tidak valid. Gunakan: markAllDone atau deleteCompleted' },
        { status: 400 }
      );
    }

    if (action === 'markAllDone') {
      // Mark tasks as done
      // If taskIds provided, only mark those; otherwise mark all pending tasks
      const whereClause: {
        userId: string;
        status: string;
        deletedAt: null;
        id?: { in: string[] };
      } = {
        userId: user.id,
        status: 'pending',
        deletedAt: null as unknown as null,
      };

      if (taskIds && Array.isArray(taskIds) && taskIds.length > 0) {
        whereClause.id = { in: taskIds };
      }

      const result = await db.task.updateMany({
        where: whereClause,
        data: { status: 'done' },
      });

      return NextResponse.json(
        { message: `${result.count} tugas berhasil ditandai selesai`, count: result.count },
        { status: 200 }
      );
    }

    if (action === 'deleteCompleted') {
      // Soft delete completed tasks
      const whereClause: {
        userId: string;
        status: string;
        deletedAt: null;
        id?: { in: string[] };
      } = {
        userId: user.id,
        status: 'done',
        deletedAt: null as unknown as null,
      };

      if (taskIds && Array.isArray(taskIds) && taskIds.length > 0) {
        whereClause.id = { in: taskIds };
      }

      const result = await db.task.updateMany({
        where: whereClause,
        data: { deletedAt: new Date() },
      });

      return NextResponse.json(
        { message: `${result.count} tugas berhasil dihapus`, count: result.count },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

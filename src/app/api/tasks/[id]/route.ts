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
    const {
      title,
      description,
      dueDate,
      reminderTime,
      isNotificationEnabled,
      priority,
      status,
      categoryId,
    } = body;

    // Find task (include soft-deleted for restore support)
    const existingTask = await db.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate title if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 200)) {
      return NextResponse.json(
        { error: 'Judul tugas harus antara 1-200 karakter' },
        { status: 400 }
      );
    }

    // Validate description if provided
    if (description !== undefined && description !== null && typeof description === 'string' && description.length > 2000) {
      return NextResponse.json(
        { error: 'Deskripsi maksimal 2000 karakter' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { error: 'Prioritas tidak valid' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['pending', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Validate categoryId if provided
    if (categoryId !== undefined && categoryId !== null) {
      const category = await db.category.findFirst({
        where: { id: categoryId, userId: user.id },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Kategori tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (reminderTime !== undefined) updateData.reminderTime = reminderTime ? new Date(reminderTime) : null;
    if (isNotificationEnabled !== undefined) updateData.isNotificationEnabled = Boolean(isNotificationEnabled);
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    // Handle restoring soft-deleted tasks
    if (body.deletedAt === null) updateData.deletedAt = null;

    // Reset notificationSent if reminderTime is changed
    if (reminderTime !== undefined) {
      updateData.notificationSent = false;
    }

    // Update task
    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    });

    // If status changed to 'done', create a completion notification
    if (status === 'done' && existingTask.status !== 'done') {
      const { generateCompletionMessage } = await import('@/lib/nova');
      const message = generateCompletionMessage(task.title);

      await db.notification.create({
        data: {
          userId: user.id,
          taskId: task.id,
          message,
        },
      });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error('Update task error:', error);
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

    // Find task
    const task = await db.task.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Soft delete
    await db.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: 'Tugas berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

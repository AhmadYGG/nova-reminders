import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const search = searchParams.get('search');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // Build where clause
    const where: Record<string, unknown> = {
      userId: user.id,
    };

    // Status filter
    if (status === 'pending' || status === 'done') {
      where.status = status;
    }

    // Deleted filter
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // Category filter
    if (category) {
      where.categoryId = category;
    }

    // Priority filter
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      where.priority = priority;
    }

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Build order by
    const orderBy: Record<string, unknown> = {};
    if (sort === 'dueDate') {
      orderBy.dueDate = order === 'asc' ? 'asc' : 'desc';
    } else if (sort === 'priority') {
      // Custom priority ordering: urgent > high > medium > low
      // SQLite doesn't support custom ORDER BY easily, so we'll sort in code
      orderBy.createdAt = order === 'asc' ? 'asc' : 'desc';
    } else if (sort === 'order') {
      orderBy.order = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = order === 'asc' ? 'asc' : 'desc';
    }

    const tasks = await db.task.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    });

    // If sorting by priority, do it in JavaScript
    let sortedTasks = tasks;
    if (sort === 'priority') {
      const priorityOrder: Record<string, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      sortedTasks = [...tasks].sort((a, b) => {
        const diff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        return order === 'asc' ? diff : -diff;
      });
    }

    return NextResponse.json({ tasks: sortedTasks }, { status: 200 });
  } catch (error) {
    console.error('Get tasks error:', error);
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

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 200) {
      return NextResponse.json(
        { error: 'Judul tugas harus antara 1-200 karakter' },
        { status: 400 }
      );
    }

    // Validate description
    if (description !== undefined && description !== null && typeof description === 'string' && description.length > 2000) {
      return NextResponse.json(
        { error: 'Deskripsi maksimal 2000 karakter' },
        { status: 400 }
      );
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { error: 'Prioritas tidak valid' },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !['pending', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Validate categoryId if provided
    if (categoryId) {
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

    // Get max order for user's tasks
    const maxOrderTask = await db.task.findFirst({
      where: { userId: user.id, deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (maxOrderTask?.order ?? -1) + 1;

    // Create task
    const task = await db.task.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        reminderTime: reminderTime ? new Date(reminderTime) : null,
        isNotificationEnabled: isNotificationEnabled !== undefined ? Boolean(isNotificationEnabled) : true,
        priority: priority || 'medium',
        status: status || 'pending',
        order: nextOrder,
        categoryId: categoryId || null,
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    });

    // If reminderTime is set and notifications enabled, create a notification
    if (task.reminderTime && task.isNotificationEnabled) {
      const { generateTaskCreatedMessage, formatTimeUntil } = await import('@/lib/nova');
      const timeStr = formatTimeUntil(new Date(task.reminderTime));
      const message = generateTaskCreatedMessage(task.title, timeStr);

      await db.notification.create({
        data: {
          userId: user.id,
          taskId: task.id,
          message,
        },
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

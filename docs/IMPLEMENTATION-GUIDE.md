# Implementation Guide: Web Push Notification

## 📋 Overview

Panduan teknis step-by-step untuk implementasi Web Push Notification berdasarkan PRD v1.0.0.

---

## 🎯 Implementation Checklist

### Phase 1: Setup & Configuration ✅

- [ ] Install dependencies
- [ ] Generate VAPID keys
- [ ] Update environment variables
- [ ] Update Prisma schema
- [ ] Run database migration

### Phase 2: Service Worker 🔧

- [ ] Create service worker file
- [ ] Implement push event listener
- [ ] Implement notification click handler
- [ ] Register service worker in app

### Phase 3: Backend API 🔧

- [ ] Create subscribe endpoint
- [ ] Create unsubscribe endpoint
- [ ] Create test endpoint (dev only)
- [ ] Implement push utility functions
- [ ] Create cron job endpoint

### Phase 4: Frontend Integration 🔧

- [ ] Create permission request component
- [ ] Create notification settings page
- [ ] Implement push subscription hook
- [ ] Update notification store
- [ ] Add permission dialog to login flow

### Phase 5: Testing & Deployment 🧪

- [ ] Unit tests
- [ ] Integration tests
- [ ] Browser compatibility testing
- [ ] Deploy to staging
- [ ] Production deployment

---

## 📦 Step 1: Install Dependencies

```bash
# Install production dependencies
npm install web-push

# Install dev dependencies
npm install -D @types/web-push node-cron @types/node-cron
```

---

## 🔑 Step 2: Generate VAPID Keys

### Option A: Using web-push CLI

```bash
npx web-push generate-vapid-keys
```

### Option B: Using Node.js script

Create `scripts/generate-vapid.js`:

```javascript
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Private Key:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('Add these to your .env file:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@novareminders.com`);
```

Run:
```bash
node scripts/generate-vapid.js
```

### Update .env

```env
# Existing variables
DATABASE_URL="file:./dev.db"

# Add VAPID keys
VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=mailto:admin@novareminders.com

# Optional: Cron secret for security
CRON_SECRET=<random-secret-string>
```

---

## 🗄️ Step 3: Update Database Schema

### Update `prisma/schema.prisma`

Add PushSubscription model:

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String   // Public key
  auth      String   // Auth secret
  userAgent String?  // Browser info for debugging
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([endpoint])
}
```

Update User model to include relation:

```prisma
model User {
  // ... existing fields
  
  pushSubscriptions PushSubscription[]
}
```

### Run Migration

```bash
npx prisma db push
npx prisma generate
```

---

## 🔧 Step 4: Create Service Worker

### Create `public/sw.js`

```javascript
// Service Worker for Push Notifications
const CACHE_NAME = 'nova-reminders-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(self.clients.claim());
});

// Push event - receive notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'Nova Reminder',
    body: 'You have a new reminder!',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'nova-notification',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: data.badge || '/logo.svg',
    tag: data.tag || 'nova-notification',
    data: data.data || { url: '/' },
    vibrate: data.vibrate || [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});
```

---

## 🛠️ Step 5: Create Backend Utilities

### Create `src/lib/push.ts`

```typescript
import webpush from 'web-push';
import { db } from './db';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@novareminders.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn('VAPID keys not configured. Push notifications will not work.');
} else {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    taskId?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
}

/**
 * Send push notification to a specific subscription
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return { success: true };
  } catch (error: any) {
    console.error('Push notification error:', error);

    // Handle expired/invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired, remove from database
      await db.pushSubscription.deleteMany({
        where: { endpoint: subscription.endpoint },
      });
      return { success: false, error: 'Subscription expired' };
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to all user's subscriptions
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
      payload
    );

    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Get VAPID public key for client
 */
export function getVapidPublicKey(): string {
  if (!vapidPublicKey) {
    throw new Error('VAPID public key not configured');
  }
  return vapidPublicKey;
}
```

---

## 🌐 Step 6: Create API Endpoints

### Create `src/app/api/push/subscribe/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Data subscription tidak valid' },
        { status: 400 }
      );
    }

    // Get user agent for debugging
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check if subscription already exists
    const existing = await db.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      // Update if user changed
      if (existing.userId !== user.id) {
        await db.pushSubscription.update({
          where: { endpoint },
          data: {
            userId: user.id,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userAgent,
          },
        });
      }
      return NextResponse.json(
        { success: true, subscriptionId: existing.id },
        { status: 200 }
      );
    }

    // Create new subscription
    const subscription = await db.pushSubscription.create({
      data: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    });

    return NextResponse.json(
      { success: true, subscriptionId: subscription.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

### Create `src/app/api/push/unsubscribe/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint tidak valid' },
        { status: 400 }
      );
    }

    // Delete subscription
    await db.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

### Create `src/app/api/push/vapid-public-key/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/push';

export async function GET() {
  try {
    const publicKey = getVapidPublicKey();
    return NextResponse.json({ publicKey }, { status: 200 });
  } catch (error) {
    console.error('Get VAPID key error:', error);
    return NextResponse.json(
      { error: 'VAPID key not configured' },
      { status: 500 }
    );
  }
}
```

---

## ⏰ Step 7: Create Cron Job

### Create `src/app/api/cron/check-reminders/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import {
  generateReminderMessage,
  generateDeadlineMessage,
  generateOverdueMessage,
  formatTimeUntil,
} from '@/lib/nova';

export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let notificationsSent = 0;

    // Find tasks where reminderTime <= now AND !notificationSent
    const dueReminders = await db.task.findMany({
      where: {
        reminderTime: { lte: now },
        isNotificationEnabled: true,
        notificationSent: false,
        deletedAt: null,
        status: 'pending',
      },
      include: {
        user: true,
      },
    });

    // Process each reminder
    for (const task of dueReminders) {
      const timeUntilDue = task.dueDate
        ? formatTimeUntil(new Date(task.dueDate))
        : 'sekarang';

      let message: string;
      if (task.dueDate && new Date(task.dueDate) <= now) {
        message = generateOverdueMessage(task.title);
      } else if (task.dueDate) {
        message = generateDeadlineMessage(task.title, timeUntilDue);
      } else {
        message = generateReminderMessage(task.title, timeUntilDue);
      }

      // Send push notification
      const result = await sendPushToUser(task.userId, {
        title: 'Nova Reminder 🔔',
        body: message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: `task-${task.id}`,
        data: {
          url: `/`,
          taskId: task.id,
        },
        actions: [
          { action: 'view', title: 'Lihat Task' },
          { action: 'complete', title: 'Tandai Selesai' },
        ],
        vibrate: [200, 100, 200],
      });

      notificationsSent += result.sent;

      // Create notification record in database
      await db.notification.create({
        data: {
          userId: task.userId,
          taskId: task.id,
          message,
        },
      });

      // Mark as sent
      await db.task.update({
        where: { id: task.id },
        data: { notificationSent: true },
      });
    }

    return NextResponse.json(
      {
        success: true,
        checked: dueReminders.length,
        sent: notificationsSent,
        timestamp: now.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Step 8: Create Frontend Components

### Create `src/hooks/use-push-notification.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications not supported');
    }

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
      }

      return result;
    } catch (error) {
      console.error('Permission request error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    setIsLoading(true);

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await response.json();

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Subscribe error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    setIsLoading(true);

    try {
      // Unsubscribe from push
      await subscription.unsubscribe();

      // Remove from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setSubscription(null);
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribe,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## 🚀 Step 9: Register Service Worker

### Update `src/app/layout.tsx`

Add service worker registration:

```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

---

## 🧪 Step 10: Testing

### Manual Testing

1. **Test Permission Request**
   ```
   - Open browser console
   - Run: Notification.requestPermission()
   - Should show browser permission dialog
   ```

2. **Test Subscription**
   ```
   - Login to app
   - Grant notification permission
   - Check browser DevTools > Application > Service Workers
   - Should see service worker registered
   ```

3. **Test Push Notification**
   ```
   - Create a task with reminder in 1 minute
   - Wait for cron job to run
   - Should receive push notification
   ```

### Setup Cron Job (Development)

Use external service like [cron-job.org](https://cron-job.org):

1. Create account
2. Add new cron job
3. URL: `https://your-domain.com/api/cron/check-reminders`
4. Schedule: Every 1 minute
5. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

---

## 📚 Additional Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Push Notification Best Practices](https://web.dev/push-notifications-overview/)

---

**End of Implementation Guide**

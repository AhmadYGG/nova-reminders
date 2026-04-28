import webpush from 'web-push';
import { db } from './db';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@novareminders.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn('⚠️ VAPID keys not configured. Push notifications will not work.');
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

    console.log('✅ Push notification sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Push notification error:', error);

    // Handle expired/invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired, remove from database
      console.log('🗑️ Removing expired subscription:', subscription.endpoint);
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

  console.log(`📤 Sending push to ${subscriptions.length} subscription(s) for user ${userId}`);

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

  console.log(`✅ Push results: ${sent} sent, ${failed} failed`);
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

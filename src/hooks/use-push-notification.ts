'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const supported =
      typeof window !== 'undefined' &&
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
      setError('Push notifications not supported in this browser');
      throw new Error('Push notifications not supported');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔔 Requesting notification permission...');
      const result = await Notification.requestPermission();
      console.log('📋 Permission result:', result);
      setPermission(result);

      if (result === 'granted') {
        console.log('✅ Permission granted, subscribing to push...');
        // Subscribe immediately after permission granted
        await subscribeDirectly();
      } else if (result === 'denied') {
        console.error('❌ Notification permission denied');
        setError('Notification permission denied');
      }

      return result;
    } catch (err: any) {
      console.error('❌ Permission request error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Direct subscribe function that doesn't depend on permission state
  const subscribeDirectly = async () => {
    try {
      console.log('📡 Getting service worker registration...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');

      console.log('🔑 Fetching VAPID public key...');
      const response = await fetch('/api/push/vapid-public-key');
      if (!response.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      const { publicKey } = await response.json();
      console.log('✅ Got VAPID key:', publicKey.substring(0, 20) + '...');

      console.log('📱 Subscribing to push manager...');
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log('✅ Push manager subscription created');

      console.log('💾 Sending subscription to server...');
      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sub.toJSON()),
      });

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json();
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || 'Failed to save subscription');
      }

      const result = await subscribeResponse.json();
      console.log('✅ Subscription saved to server! ID:', result.subscriptionId);

      setSubscription(sub);
      console.log('✅ Push subscription successful');
      return sub;
    } catch (err: any) {
      console.error('❌ Subscribe error:', err);
      throw err;
    }
  };

  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await fetch('/api/push/vapid-public-key');
      if (!response.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      const { publicKey } = await response.json();

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription');
      }

      setSubscription(sub);
      console.log('✅ Push subscription successful');
      return sub;
    } catch (err: any) {
      console.error('Subscribe error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    setIsLoading(true);
    setError(null);

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
      console.log('✅ Push unsubscription successful');
    } catch (err: any) {
      console.error('Unsubscribe error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  const testNotification = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      setError('Notifications not enabled');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test notification from Nova!' }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      console.log('✅ Test notification sent');
    } catch (err: any) {
      console.error('Test notification error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribe,
    testNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

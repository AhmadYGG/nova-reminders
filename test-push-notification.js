#!/usr/bin/env node

/**
 * Test Script untuk Web Push Notification System
 * 
 * Script ini akan melakukan testing komprehensif terhadap sistem push notification:
 * 1. Validasi VAPID keys
 * 2. Test database connection
 * 3. Test push subscription
 * 4. Test sending push notification
 */

const webpush = require('web-push');
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function testVapidKeys() {
  logSection('TEST 1: Validasi VAPID Keys');

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey) {
    log('❌ VAPID keys tidak ditemukan di .env', 'red');
    return false;
  }

  log(`✅ VAPID Public Key: ${publicKey.substring(0, 20)}...`, 'green');
  log(`✅ VAPID Private Key: ${privateKey.substring(0, 20)}...`, 'green');
  log(`✅ VAPID Subject: ${subject}`, 'green');

  // Set VAPID details
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    log('✅ VAPID keys berhasil dikonfigurasi', 'green');
    return true;
  } catch (error) {
    log(`❌ Error konfigurasi VAPID: ${error.message}`, 'red');
    return false;
  }
}

async function testDatabaseConnection() {
  logSection('TEST 2: Database Connection');

  try {
    await db.$connect();
    log('✅ Database connection berhasil', 'green');

    // Check if PushSubscription table exists
    const subscriptions = await db.pushSubscription.findMany({ take: 1 });
    log('✅ Tabel PushSubscription ditemukan', 'green');

    return true;
  } catch (error) {
    log(`❌ Database error: ${error.message}`, 'red');
    return false;
  }
}

async function testPushSubscriptions() {
  logSection('TEST 3: Push Subscriptions');

  try {
    const subscriptions = await db.pushSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    log(`📊 Total subscriptions: ${subscriptions.length}`, 'blue');

    if (subscriptions.length === 0) {
      log('⚠️  Tidak ada push subscription ditemukan', 'yellow');
      log('   Silakan login ke aplikasi dan izinkan notifikasi', 'yellow');
      return null;
    }

    subscriptions.forEach((sub, index) => {
      log(`\n📱 Subscription ${index + 1}:`, 'blue');
      log(`   User: ${sub.user.name} (${sub.user.email})`);
      log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      log(`   Created: ${sub.createdAt.toLocaleString()}`);
    });

    return subscriptions;
  } catch (error) {
    log(`❌ Error fetching subscriptions: ${error.message}`, 'red');
    return null;
  }
}

async function testSendPushNotification(subscriptions) {
  logSection('TEST 4: Send Test Push Notification');

  if (!subscriptions || subscriptions.length === 0) {
    log('⚠️  Tidak ada subscription untuk testing', 'yellow');
    return false;
  }

  const testSubscription = subscriptions[0];
  log(`📤 Mengirim test notification ke: ${testSubscription.user.name}`, 'blue');

  const payload = {
    title: 'Nova Test 🧪',
    body: 'Test push notification berhasil! Sistem berfungsi dengan baik.',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'test-notification',
    data: {
      url: '/',
      timestamp: new Date().toISOString(),
    },
    vibrate: [200, 100, 200],
  };

  try {
    const pushSubscription = {
      endpoint: testSubscription.endpoint,
      keys: {
        p256dh: testSubscription.p256dh,
        auth: testSubscription.auth,
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    log('✅ Push notification berhasil dikirim!', 'green');
    log('   Cek device Anda untuk melihat notifikasi', 'green');
    return true;
  } catch (error) {
    log(`❌ Error sending push: ${error.message}`, 'red');
    
    if (error.statusCode === 410 || error.statusCode === 404) {
      log('   Subscription expired/invalid, menghapus dari database...', 'yellow');
      await db.pushSubscription.delete({
        where: { id: testSubscription.id },
      });
      log('   ✅ Subscription dihapus', 'green');
    }
    
    return false;
  }
}

async function testCronEndpoint() {
  logSection('TEST 5: Cron Endpoint');

  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    log('⚠️  CRON_SECRET tidak ditemukan di .env', 'yellow');
    log('   Endpoint cron tidak akan terproteksi', 'yellow');
  } else {
    log(`✅ CRON_SECRET: ${cronSecret.substring(0, 20)}...`, 'green');
  }

  log('\n📝 Untuk test cron endpoint, jalankan:', 'blue');
  log(`   curl -H "Authorization: Bearer ${cronSecret}" http://localhost:3000/api/cron/check-reminders`, 'cyan');

  return true;
}

async function testScheduler() {
  logSection('TEST 6: Reminder Scheduler');

  try {
    const now = new Date();
    const dueReminders = await db.task.findMany({
      where: {
        reminderTime: { lte: now },
        isNotificationEnabled: true,
        notificationSent: false,
        deletedAt: null,
        status: 'pending',
      },
      take: 5,
    });

    log(`📊 Tasks dengan reminder yang sudah jatuh tempo: ${dueReminders.length}`, 'blue');

    if (dueReminders.length > 0) {
      log('\n📋 Sample tasks:', 'blue');
      dueReminders.forEach((task, index) => {
        log(`   ${index + 1}. ${task.title}`);
        log(`      Reminder: ${task.reminderTime?.toLocaleString()}`);
        log(`      Due: ${task.dueDate?.toLocaleString() || 'No deadline'}`);
      });
    } else {
      log('✅ Tidak ada reminder yang perlu dikirim saat ini', 'green');
    }

    return true;
  } catch (error) {
    log(`❌ Error checking reminders: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Starting Web Push Notification System Tests\n', 'cyan');

  const results = {
    vapidKeys: false,
    database: false,
    subscriptions: null,
    pushSend: false,
    cron: false,
    scheduler: false,
  };

  // Test 1: VAPID Keys
  results.vapidKeys = await testVapidKeys();
  if (!results.vapidKeys) {
    log('\n❌ Test gagal: VAPID keys tidak valid', 'red');
    process.exit(1);
  }

  // Test 2: Database
  results.database = await testDatabaseConnection();
  if (!results.database) {
    log('\n❌ Test gagal: Database connection error', 'red');
    process.exit(1);
  }

  // Test 3: Subscriptions
  results.subscriptions = await testPushSubscriptions();

  // Test 4: Send Push (only if subscriptions exist)
  if (results.subscriptions && results.subscriptions.length > 0) {
    results.pushSend = await testSendPushNotification(results.subscriptions);
  }

  // Test 5: Cron Endpoint
  results.cron = await testCronEndpoint();

  // Test 6: Scheduler
  results.scheduler = await testScheduler();

  // Summary
  logSection('📊 TEST SUMMARY');

  const tests = [
    { name: 'VAPID Keys', result: results.vapidKeys },
    { name: 'Database Connection', result: results.database },
    { name: 'Push Subscriptions', result: results.subscriptions !== null },
    { name: 'Send Push Notification', result: results.pushSend },
    { name: 'Cron Endpoint', result: results.cron },
    { name: 'Reminder Scheduler', result: results.scheduler },
  ];

  tests.forEach((test) => {
    const status = test.result ? '✅ PASS' : '❌ FAIL';
    const color = test.result ? 'green' : 'red';
    log(`${status} - ${test.name}`, color);
  });

  const passedTests = tests.filter((t) => t.result).length;
  const totalTests = tests.length;

  log(`\n📈 Total: ${passedTests}/${totalTests} tests passed`, 'cyan');

  if (passedTests === totalTests) {
    log('\n🎉 Semua test berhasil! Sistem push notification berfungsi dengan baik.', 'green');
  } else {
    log('\n⚠️  Beberapa test gagal. Periksa error di atas.', 'yellow');
  }

  await db.$disconnect();
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

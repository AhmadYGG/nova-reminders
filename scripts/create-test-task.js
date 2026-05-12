#!/usr/bin/env node

/**
 * Script untuk create test task dengan reminder
 * Usage: node create-test-task.js [minutes]
 * Example: node create-test-task.js 2  (reminder in 2 minutes)
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

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

async function createTestTask() {
  try {
    // Get minutes from args, default 2
    const minutes = parseInt(process.argv[2]) || 2;
    
    log('\n🔍 Finding user...', 'cyan');
    
    // Get first user
    const user = await db.user.findFirst({
      include: {
        pushSubscriptions: true,
      },
    });
    
    if (!user) {
      log('❌ No user found!', 'red');
      log('   Please register a user first.', 'yellow');
      process.exit(1);
    }
    
    log(`✅ Found user: ${user.name} (${user.email})`, 'green');
    
    // Check if user has push subscription
    if (user.pushSubscriptions.length === 0) {
      log('⚠️  User has no push subscriptions!', 'yellow');
      log('   Please login to the app and allow notifications.', 'yellow');
      log('   Notification will not be sent, but task will be created.', 'yellow');
    } else {
      log(`✅ User has ${user.pushSubscriptions.length} push subscription(s)`, 'green');
    }
    
    // Create task with reminder in X minutes
    const now = new Date();
    const reminderTime = new Date(now.getTime() + minutes * 60 * 1000);
    const dueDate = new Date(reminderTime.getTime() + 30 * 60 * 1000); // 30 min after reminder
    
    log('\n📝 Creating test task...', 'cyan');
    
    const task = await db.task.create({
      data: {
        userId: user.id,
        title: `Test Notifikasi - ${now.toLocaleTimeString()}`,
        description: `Task untuk test push notification. Created at ${now.toLocaleString()}`,
        reminderTime: reminderTime,
        dueDate: dueDate,
        isNotificationEnabled: true,
        notificationSent: false,
        status: 'pending',
        priority: 'high',
      },
    });
    
    log('✅ Test task created successfully!', 'green');
    log('\n📋 Task Details:', 'cyan');
    log(`   ID: ${task.id}`);
    log(`   Title: ${task.title}`);
    log(`   Description: ${task.description}`);
    log(`   Reminder Time: ${reminderTime.toLocaleString()}`);
    log(`   Due Date: ${dueDate.toLocaleString()}`);
    log(`   Notification Enabled: ${task.isNotificationEnabled}`);
    log(`   Notification Sent: ${task.notificationSent}`);
    log(`   Status: ${task.status}`);
    
    log('\n⏰ Reminder Schedule:', 'cyan');
    log(`   Current time: ${now.toLocaleString()}`);
    log(`   Reminder in: ${minutes} minute(s)`);
    log(`   Reminder at: ${reminderTime.toLocaleString()}`);
    
    const secondsUntil = Math.round((reminderTime - now) / 1000);
    log(`\n⏳ Wait ${secondsUntil} seconds for notification...`, 'yellow');
    
    log('\n📊 What will happen:', 'cyan');
    log('   1. Scheduler checks every 60 seconds');
    log('   2. When reminderTime <= now, scheduler finds this task');
    log('   3. Scheduler sends push notification to user');
    log('   4. Notification appears on your device');
    log('   5. Task marked as notificationSent: true');
    
    log('\n🔍 Monitor scheduler logs:', 'cyan');
    log('   Watch your server console for:', 'blue');
    log('   "🔔 [Scheduler] Found 1 due reminder(s)"', 'blue');
    log('   "✅ [Scheduler] Reminder sent for task: ..."', 'blue');
    
    log('\n💡 Tips:', 'cyan');
    log('   - Make sure server is running: npm run dev');
    log('   - Check scheduler started: look for "✅ [Scheduler] Reminder scheduler started"');
    log('   - Verify push subscription: ./test-push-manual.sh subscriptions');
    log('   - Manual trigger: curl http://localhost:3000/api/cron/check-reminders');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run
createTestTask();

# 🐛 Debug: Notifikasi Tidak Muncul

## 🔍 Root Cause Analysis

Saya menemukan **3 masalah utama** kenapa notifikasi tidak muncul:

---

## ❌ Problem 1: Development Server Tidak Berjalan

**Issue:** Server Next.js tidak running, jadi scheduler tidak bisa jalan.

**Evidence:**
```bash
ps aux | grep -E "(node|next)" | grep -v grep
# Tidak ada proses npm run dev atau next dev
```

**Solution:**
```bash
npm run dev
```

---

## ❌ Problem 2: Instrumentation Hook Tidak Enabled

**Issue:** `next.config.ts` tidak mengaktifkan `instrumentationHook`, jadi file `src/instrumentation.ts` tidak dijalankan, dan scheduler tidak start.

**Evidence:**
```typescript
// next.config.ts - SEBELUM
const nextConfig: NextConfig = {
  output: "standalone",
  // ... tidak ada experimental.instrumentationHook
};
```

**Solution:** ✅ **SUDAH DIPERBAIKI**
```typescript
// next.config.ts - SETELAH
const nextConfig: NextConfig = {
  output: "standalone",
  // ... config lain
  experimental: {
    instrumentationHook: true, // ✅ ADDED
  },
};
```

---

## ❌ Problem 3: Task Sudah Marked as Sent

**Issue:** Task yang ada di database sudah `notificationSent: true`, jadi scheduler skip task tersebut.

**Evidence:**
```
1. tes
   User: Muhammad Aziz
   Reminder: 4/29/2026, 4:33:00 AM
   Status: pending
   Notification Enabled: true
   Notification Sent: true  ← SUDAH TRUE
   Is Past: true (-1668 minutes)

Due reminders (should be sent): 0  ← TIDAK ADA YANG PERLU DIKIRIM
```

**Solution:** Create task baru atau reset flag:
```sql
-- Option 1: Reset existing task
UPDATE tasks SET notificationSent = false WHERE id = 'task-id';

-- Option 2: Create new task dengan reminder baru
```

---

## ✅ Complete Fix

### Step 1: Enable Instrumentation Hook

✅ **DONE** - Sudah saya update `next.config.ts`

### Step 2: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
✅ [Scheduler] Reminder scheduler started (every 60s)
```

### Step 3: Create New Task dengan Reminder

1. Login ke aplikasi
2. Create task baru:
   - **Title:** "Test Notifikasi"
   - **Reminder time:** 1-2 menit dari sekarang
   - **Enable notification:** ✅ (checked)
3. Save task

### Step 4: Wait & Verify

Tunggu sampai reminder time, scheduler akan:
1. Check setiap 60 detik
2. Find task dengan `reminderTime <= now`
3. Send push notification
4. Mark task as `notificationSent: true`

**Expected logs:**
```
🔔 [Scheduler] Found 1 due reminder(s)
✅ [Scheduler] Reminder sent for task: "Test Notifikasi"
```

---

## 🧪 Quick Test

### Test 1: Verify Scheduler Running

```bash
# Start server
npm run dev

# Check logs for:
# ✅ [Scheduler] Reminder scheduler started (every 60s)
```

### Test 2: Create Test Task

```bash
# Run this script to create a test task with reminder in 2 minutes
node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  // Get first user
  const user = await db.user.findFirst();
  
  if (!user) {
    console.log('❌ No user found. Please register first.');
    return;
  }
  
  // Create task with reminder in 2 minutes
  const reminderTime = new Date(Date.now() + 2 * 60 * 1000);
  
  const task = await db.task.create({
    data: {
      userId: user.id,
      title: 'Test Notifikasi - ' + new Date().toLocaleTimeString(),
      description: 'Task untuk test push notification',
      reminderTime: reminderTime,
      isNotificationEnabled: true,
      notificationSent: false,
      status: 'pending',
    },
  });
  
  console.log('✅ Test task created!');
  console.log('   Title:', task.title);
  console.log('   Reminder:', reminderTime.toLocaleString());
  console.log('   Wait 2 minutes for notification...');
  
  await db.\$disconnect();
})();
"
```

### Test 3: Monitor Scheduler

```bash
# Watch server logs for scheduler activity
# Every 60 seconds you should see:
# 🔔 [Scheduler] Found X due reminder(s)
```

### Test 4: Manual Trigger (Optional)

Jika tidak mau tunggu, trigger manual:

```bash
curl http://localhost:3000/api/cron/check-reminders
```

---

## 📊 Verification Checklist

- [ ] `next.config.ts` has `experimental.instrumentationHook: true`
- [ ] Development server running (`npm run dev`)
- [ ] Scheduler log appears: "✅ [Scheduler] Reminder scheduler started"
- [ ] User has push subscription (check with `./test-push-manual.sh subscriptions`)
- [ ] Task created with `reminderTime` in future
- [ ] Task has `isNotificationEnabled: true`
- [ ] Task has `notificationSent: false`
- [ ] Task has `status: 'pending'`
- [ ] Task has `deletedAt: null`

---

## 🎯 Expected Behavior

### When Scheduler Runs:

```
Time: 10:00:00 - Scheduler checks
Time: 10:01:00 - Scheduler checks
Time: 10:02:00 - Scheduler checks
Time: 10:02:30 - Task reminder time! ← MATCH
Time: 10:03:00 - Scheduler checks → FOUND TASK
                → Send push notification
                → Mark as sent
                → ✅ Notification appears!
```

### Scheduler Query Logic:

```typescript
const dueReminders = await db.task.findMany({
  where: {
    reminderTime: { lte: now },           // ✅ Reminder time has passed
    isNotificationEnabled: true,          // ✅ Notification enabled
    notificationSent: false,              // ✅ Not sent yet
    deletedAt: null,                      // ✅ Not deleted
    status: 'pending',                    // ✅ Still pending
  },
});
```

---

## 🔧 Troubleshooting

### Issue: Scheduler tidak start

**Check:**
```bash
# 1. Verify instrumentation hook enabled
cat next.config.ts | grep instrumentationHook

# 2. Check server logs
npm run dev | grep Scheduler
```

**Expected:**
```
✅ [Scheduler] Reminder scheduler started (every 60s)
```

---

### Issue: Task tidak ditemukan oleh scheduler

**Check:**
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  const now = new Date();
  const tasks = await db.task.findMany({
    where: {
      reminderTime: { lte: now },
      isNotificationEnabled: true,
      notificationSent: false,
      deletedAt: null,
      status: 'pending',
    },
  });
  
  console.log('Due reminders:', tasks.length);
  tasks.forEach(t => {
    console.log('-', t.title, '|', t.reminderTime);
  });
  
  await db.\$disconnect();
})();
"
```

**Expected:** Should show your task if reminder time has passed.

---

### Issue: Push notification tidak muncul

**Check:**
```bash
# 1. Verify user has subscription
./test-push-manual.sh subscriptions

# 2. Test push manually
./test-push-manual.sh send-push

# 3. Check browser permission
# Open browser console: Notification.permission
# Should be "granted"
```

---

## 📝 Summary

**Root causes:**
1. ❌ Instrumentation hook not enabled → Scheduler tidak start
2. ❌ Development server not running → Scheduler tidak jalan
3. ❌ Existing task already sent → Tidak ada task untuk dikirim

**Fixes applied:**
1. ✅ Added `experimental.instrumentationHook: true` to next.config.ts
2. ⚠️ Need to run: `npm run dev`
3. ⚠️ Need to create: New task dengan reminder baru

**Next steps:**
1. Start server: `npm run dev`
2. Verify scheduler started (check logs)
3. Create test task dengan reminder 2 menit
4. Wait and verify notification appears

---

**Status:** 🔧 **FIXED - Ready to test**


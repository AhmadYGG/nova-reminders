# Testing Guide: Web Push Notification

## ✅ Implementation Complete!

Web Push Notification sudah diimplementasikan. Berikut cara testing:

---

## 🧪 Manual Testing Steps

### 1. Test Service Worker Registration

1. Buka browser ke http://localhost:3000
2. Buka DevTools (F12) → Console
3. Cari log: `✅ Service Worker registered`
4. Buka DevTools → Application → Service Workers
5. Pastikan ada service worker dengan scope `/`

**Expected Result:** ✅ Service worker registered successfully

---

### 2. Test Permission Request

1. Login ke aplikasi (atau register akun baru)
2. Setelah 2 detik, modal permission akan muncul
3. Click "Izinkan ✓"
4. Browser akan menampilkan permission dialog
5. Click "Allow" di browser dialog

**Expected Result:** ✅ Permission granted, modal tertutup

**Troubleshooting:**
- Jika modal tidak muncul, cek localStorage: `nova-notification-dismissed`
- Clear localStorage dan refresh page

---

### 3. Test Push Subscription

1. Setelah grant permission, cek Console
2. Cari log: `✅ Push subscription successful`
3. Buka DevTools → Application → Service Workers → Push Messaging
4. Pastikan ada subscription

**Expected Result:** ✅ Subscription created and saved to database

---

### 4. Test Push Notification (Manual)

#### Option A: Using Browser Console

```javascript
// Test notification using browser API
new Notification('Test Nova', {
  body: 'This is a test notification!',
  icon: '/logo.svg',
  badge: '/logo.svg'
});
```

#### Option B: Using API Endpoint

```javascript
// Test using backend API
fetch('/api/push/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test from API!' })
})
.then(res => res.json())
.then(data => console.log('Test result:', data));
```

**Expected Result:** ✅ Notification muncul di sistem (Windows/Android notification center)

---

### 5. Test Reminder Notification

1. Create task baru dengan reminder time = 1 menit dari sekarang
2. Enable notification untuk task tersebut
3. Tunggu 1 menit
4. Trigger cron job manually:

```bash
# Windows PowerShell
$headers = @{
    "Authorization" = "Bearer nova-cron-secret-2026"
}
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/check-reminders" -Headers $headers
```

Atau buka di browser:
```
http://localhost:3000/api/cron/check-reminders
```

**Expected Result:** ✅ Push notification muncul dengan pesan reminder

---

### 6. Test Notification Click

1. Setelah notifikasi muncul, click notifikasi
2. Browser window harus focus/open
3. Navigate ke halaman yang sesuai

**Expected Result:** ✅ Click notification opens website

---

### 7. Test Multiple Devices

1. Login di browser lain (Chrome, Firefox, Edge)
2. Grant permission di browser kedua
3. Send test notification
4. Pastikan notifikasi muncul di semua browser

**Expected Result:** ✅ Notification sent to all subscribed devices

---

### 8. Test Unsubscribe

```javascript
// Get current subscription
navigator.serviceWorker.ready.then(async (registration) => {
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    // Unsubscribe
    await subscription.unsubscribe();
    
    // Remove from server
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
    
    console.log('✅ Unsubscribed successfully');
  }
});
```

**Expected Result:** ✅ Subscription removed, no more notifications

---

## 🔍 Debugging Checklist

### Service Worker Issues

**Problem:** Service worker not registering

**Solutions:**
- [ ] Check HTTPS (required except localhost)
- [ ] Check browser console for errors
- [ ] Clear browser cache and reload
- [ ] Check `public/sw.js` exists

---

### Permission Issues

**Problem:** Permission dialog not showing

**Solutions:**
- [ ] Check `Notification.permission` in console
- [ ] Clear localStorage: `localStorage.removeItem('nova-notification-dismissed')`
- [ ] Check browser notification settings
- [ ] Try incognito/private mode

---

### Subscription Issues

**Problem:** Subscription fails

**Solutions:**
- [ ] Check VAPID keys in `.env`
- [ ] Check `/api/push/vapid-public-key` returns key
- [ ] Check browser console for errors
- [ ] Verify database has `PushSubscription` table

---

### Push Notification Issues

**Problem:** Notification not received

**Solutions:**
- [ ] Check subscription exists in database
- [ ] Check VAPID keys are correct
- [ ] Check browser notification settings (not blocked)
- [ ] Check service worker is active
- [ ] Check backend logs for errors

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
OS: ___________

[ ] Service Worker Registration
[ ] Permission Request
[ ] Push Subscription
[ ] Manual Test Notification
[ ] Reminder Notification
[ ] Notification Click
[ ] Multiple Devices
[ ] Unsubscribe

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Production Testing

### Before Deploy to Production:

1. **Update VAPID Keys**
   - Generate new keys for production
   - Update `.env` in production environment

2. **Setup Cron Job**
   - Use Vercel Cron or external service
   - Schedule: Every 1 minute
   - URL: `https://your-domain.com/api/cron/check-reminders`
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Test on Real Devices**
   - [ ] Android Chrome
   - [ ] Android Firefox
   - [ ] Windows Chrome
   - [ ] Windows Edge
   - [ ] macOS Safari (limited support)
   - [ ] iOS Safari (requires Add to Home Screen)

4. **Monitor Logs**
   - Check for subscription errors
   - Check for push delivery failures
   - Monitor cron job execution

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify VAPID keys configuration
4. Test in different browser
5. Clear cache and try again

---

**Happy Testing! 🎉**

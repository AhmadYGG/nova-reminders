# Quick Start: Web Push Notification

## 🚀 TL;DR - Implementasi dalam 30 Menit

### 1. Install Dependencies (2 menit)
```bash
npm install web-push
npm install -D @types/web-push
```

### 2. Generate VAPID Keys (1 menit)
```bash
npx web-push generate-vapid-keys
```

Copy output ke `.env`:
```env
VAPID_PUBLIC_KEY=<your-key>
VAPID_PRIVATE_KEY=<your-key>
VAPID_SUBJECT=mailto:admin@novareminders.com
```

### 3. Update Database (2 menit)
Add to `prisma/schema.prisma`:
```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model User {
  // ... existing fields
  pushSubscriptions PushSubscription[]
}
```

Run migration:
```bash
npx prisma db push
npx prisma generate
```

### 4. Create Service Worker (5 menit)
Copy `public/sw.js` from implementation guide.

### 5. Create Backend Files (10 menit)
- `src/lib/push.ts` - Push utilities
- `src/app/api/push/subscribe/route.ts` - Subscribe endpoint
- `src/app/api/push/unsubscribe/route.ts` - Unsubscribe endpoint
- `src/app/api/push/vapid-public-key/route.ts` - Get public key
- `src/app/api/cron/check-reminders/route.ts` - Cron job

### 6. Create Frontend Hook (5 menit)
- `src/hooks/use-push-notification.ts` - React hook

### 7. Register Service Worker (2 menit)
Add to `src/app/layout.tsx`:
```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

### 8. Test (3 menit)
```bash
npm run dev
```

Open browser console:
```javascript
// Request permission
await Notification.requestPermission();

// Test notification
new Notification('Test', { body: 'It works!' });
```

---

## 🧪 Testing Checklist

- [ ] Service worker registered
- [ ] Permission granted
- [ ] Subscription created
- [ ] Push notification received
- [ ] Click opens correct page

---

## 🐛 Common Issues

### Issue: Service Worker not registering
**Solution**: Check HTTPS (required except localhost)

### Issue: Permission denied
**Solution**: Clear browser data and try again

### Issue: Push not received
**Solution**: Check VAPID keys are correct in `.env`

### Issue: Notification not showing
**Solution**: Check browser notification settings

---

## 📞 Need Help?

See full documentation:
- [PRD](./PRD-Web-Push-Notification.md)
- [Implementation Guide](./IMPLEMENTATION-GUIDE.md)

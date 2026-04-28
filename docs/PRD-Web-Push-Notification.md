# PRD: Web Push Notification System

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Project** | Nova Reminders |
| **Feature** | Web Push Notification System |
| **Version** | 1.0.0 |
| **Author** | Development Team |
| **Date** | 2026-04-27 |
| **Status** | Draft |

---

## 🎯 Executive Summary

Implementasi sistem Web Push Notification untuk mengirimkan notifikasi reminder kepada user melalui browser notification API, memungkinkan notifikasi muncul bahkan ketika website tidak aktif atau browser minimize.

---

## 🔍 Problem Statement

### Current State
- Notifikasi hanya muncul sebagai in-app bubble (NovaBubbles)
- User harus membuka website untuk melihat notifikasi
- Notifikasi tidak muncul jika:
  - Browser tab tidak aktif
  - Browser minimize
  - Website ditutup

### Desired State
- Notifikasi muncul sebagai sistem notification (seperti WhatsApp, Gmail)
- User menerima notifikasi bahkan jika website tidak dibuka
- Notifikasi muncul di Android, Windows, macOS, Linux
- User dapat click notifikasi untuk membuka website

---

## 👥 Target Users

1. **Primary Users**: Semua registered users yang menggunakan Nova Reminders
2. **Use Cases**:
   - User yang sering multitasking dan tidak selalu membuka Nova Reminders
   - User yang ingin diingatkan tepat waktu tanpa harus membuka website
   - User mobile yang ingin notifikasi seperti aplikasi native

---

## ✨ Features & Requirements

### 1. Notification Permission Request

#### 1.1 Permission Dialog
- **Trigger**: Saat user berhasil login pertama kali
- **UI**: Modal dialog dengan branding Nova
- **Content**:
  - Title: "Izinkan Notifikasi?"
  - Description: "Nova akan mengirimkan notifikasi reminder tepat waktu. Kamu bisa mengatur ini kapan saja."
  - Actions: "Izinkan" | "Nanti Saja"
- **Behavior**:
  - Jika "Izinkan" → Request browser permission
  - Jika "Nanti Saja" → Tutup dialog, tampilkan lagi setelah 7 hari
  - Jika user block → Tampilkan instruksi cara enable manual

#### 1.2 Permission Status Indicator
- **Location**: Settings atau Profile page
- **Display**:
  - ✅ "Notifikasi Aktif" (green badge)
  - ⚠️ "Notifikasi Diblokir" (yellow badge)
  - ❌ "Notifikasi Tidak Aktif" (gray badge)
- **Action**: Button "Kelola Notifikasi"

### 2. Service Worker Implementation

#### 2.1 Service Worker Registration
- **File**: `public/sw.js`
- **Registration**: Saat app load (di `layout.tsx` atau `page.tsx`)
- **Scope**: Root (`/`)
- **Update Strategy**: Check for updates every 24 hours

#### 2.2 Service Worker Features
- **Push Event Handler**: Listen for push notifications
- **Notification Display**: Show notification dengan custom styling
- **Notification Click Handler**: Open website ke task detail
- **Background Sync**: Sync notification status when online

### 3. Push Subscription Management

#### 3.1 Subscription Creation
- **Trigger**: Setelah user grant permission
- **Process**:
  1. Generate push subscription via browser API
  2. Send subscription to backend API
  3. Store subscription in database
  4. Associate subscription with user account

#### 3.2 Subscription Storage (Database)
```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String   // Public key
  auth      String   // Auth secret
  userAgent String?  // Browser info
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([endpoint])
}
```

#### 3.3 Subscription Lifecycle
- **Create**: Saat user grant permission
- **Update**: Jika subscription berubah (browser update, dll)
- **Delete**: 
  - User logout
  - User revoke permission
  - Subscription expired/invalid

### 4. Backend Push Notification System

#### 4.1 VAPID Keys Setup
- **Library**: `web-push`
- **Keys**: Generate once, store in `.env`
- **Environment Variables**:
  ```env
  VAPID_PUBLIC_KEY=<public-key>
  VAPID_PRIVATE_KEY=<private-key>
  VAPID_SUBJECT=mailto:admin@novareminders.com
  ```

#### 4.2 Push Notification API Endpoints

##### POST `/api/push/subscribe`
- **Purpose**: Save push subscription
- **Auth**: Required
- **Body**:
  ```json
  {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
  ```
- **Response**: `{ success: true, subscriptionId: "..." }`

##### POST `/api/push/unsubscribe`
- **Purpose**: Remove push subscription
- **Auth**: Required
- **Body**: `{ endpoint: "..." }`
- **Response**: `{ success: true }`

##### POST `/api/push/test` (Development only)
- **Purpose**: Test push notification
- **Auth**: Required
- **Body**: `{ message: "Test notification" }`
- **Response**: `{ success: true, sent: 1 }`

#### 4.3 Notification Scheduler

##### Option A: Cron Job (Recommended for Production)
- **Library**: `node-cron` atau external cron service
- **Schedule**: Every 1 minute
- **Process**:
  1. Query tasks where `reminderTime <= now` AND `notificationSent = false`
  2. For each task:
     - Get user's push subscriptions
     - Send push notification
     - Mark task as `notificationSent = true`
     - Create notification record in database

##### Option B: API Route with Polling (Development)
- **Endpoint**: `/api/cron/check-reminders`
- **Trigger**: External cron service (Vercel Cron, cron-job.org)
- **Same process as Option A**

#### 4.4 Push Notification Payload
```json
{
  "title": "Nova Reminder 🔔",
  "body": "Hey! Kamu punya tugas 'Beli groceries' yang 30 menit lagi.",
  "icon": "/logo.svg",
  "badge": "/badge-icon.png",
  "tag": "task-<task-id>",
  "data": {
    "taskId": "<task-id>",
    "url": "/tasks/<task-id>",
    "timestamp": "2026-04-27T10:00:00Z"
  },
  "actions": [
    {
      "action": "view",
      "title": "Lihat Task"
    },
    {
      "action": "complete",
      "title": "Tandai Selesai"
    }
  ],
  "requireInteraction": false,
  "vibrate": [200, 100, 200]
}
```

### 5. Notification Types & Messages

#### 5.1 Reminder Notification
- **Trigger**: `reminderTime <= now`
- **Title**: "Nova Reminder 🔔"
- **Body**: Nova-style message dari `lib/nova.ts`
- **Priority**: High

#### 5.2 Deadline Warning
- **Trigger**: Task mendekati deadline (1 jam sebelum)
- **Title**: "Deadline Mendekat! ⏰"
- **Body**: "Jangan sampai kelewatan ya, '<task-title>' deadline-nya <time-left>!"
- **Priority**: High

#### 5.3 Overdue Notification
- **Trigger**: Task melewati deadline
- **Title**: "Task Overdue! ⚠️"
- **Body**: "Hey! Tugas '<task-title>' udah lewat deadline nih. Yuk buruan kerjain!"
- **Priority**: Urgent

#### 5.4 Completion Celebration
- **Trigger**: Task marked as done
- **Title**: "Keren! 🎉"
- **Body**: "Kamu udah selesaikan '<task-title>'. Keep it up!"
- **Priority**: Normal

### 6. User Settings & Preferences

#### 6.1 Notification Settings Page
- **Location**: `/settings/notifications`
- **Options**:
  - ✅ Enable/Disable push notifications
  - ✅ Notification sound (on/off)
  - ✅ Notification types:
    - [ ] Reminders
    - [ ] Deadline warnings
    - [ ] Overdue alerts
    - [ ] Completion celebrations
  - ✅ Quiet hours (e.g., 22:00 - 07:00)
  - ✅ Test notification button

#### 6.2 Per-Task Notification Control
- **Location**: Task creation/edit modal
- **Option**: Toggle "Enable notifications for this task"
- **Default**: ON (existing behavior)

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Permission UI    │  │ Service Worker   │               │
│  │ - Request dialog │  │ - Push listener  │               │
│  │ - Settings page  │  │ - Show notif     │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Next.js API)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Push API         │  │ Cron Scheduler   │               │
│  │ - Subscribe      │  │ - Check reminders│               │
│  │ - Unsubscribe    │  │ - Send push      │               │
│  │ - Test           │  │ - Update DB      │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                        │
├─────────────────────────────────────────────────────────────┤
│  - Users                                                    │
│  - Tasks                                                    │
│  - Notifications                                            │
│  - PushSubscriptions (NEW)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Subscription Flow
```
User Login → Request Permission → User Grants → 
Browser Creates Subscription → Send to Backend → 
Store in Database → Success
```

#### 2. Notification Flow
```
Cron Job Runs → Check Due Reminders → 
Get User Subscriptions → Send Push via web-push → 
Service Worker Receives → Show Notification → 
User Clicks → Open Website → Mark as Read
```

---

## 📦 Dependencies

### New Dependencies to Install

```json
{
  "dependencies": {
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@types/web-push": "^3.6.3",
    "node-cron": "^3.0.3"
  }
}
```

---

## 📁 File Structure

### New Files to Create

```
nova-reminders-full/
├── public/
│   ├── sw.js                          # Service Worker
│   ├── badge-icon.png                 # Badge icon for notifications
│   └── notification-sound.mp3         # Optional notification sound
│
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── push/
│   │       │   ├── subscribe/
│   │       │   │   └── route.ts       # Subscribe endpoint
│   │       │   ├── unsubscribe/
│   │       │   │   └── route.ts       # Unsubscribe endpoint
│   │       │   └── test/
│   │       │       └── route.ts       # Test notification (dev only)
│   │       └── cron/
│   │           └── check-reminders/
│   │               └── route.ts       # Cron job endpoint
│   │
│   ├── components/
│   │   └── notifications/
│   │       ├── NotificationPermission.tsx  # Permission request modal
│   │       └── NotificationSettings.tsx    # Settings UI
│   │
│   ├── lib/
│   │   ├── push.ts                    # Push notification utilities
│   │   └── vapid.ts                   # VAPID key management
│   │
│   └── hooks/
│       └── use-push-notification.ts   # React hook for push
│
├── prisma/
│   └── schema.prisma                  # Updated with PushSubscription model
│
└── docs/
    └── PRD-Web-Push-Notification.md   # This document
```

### Files to Modify

```
- src/app/layout.tsx                   # Register service worker
- src/app/page.tsx                     # Show permission dialog after login
- src/stores/notification-store.ts     # Add push subscription state
- .env                                 # Add VAPID keys
- package.json                         # Add dependencies
```

---

## 🔐 Security Considerations

### 1. VAPID Keys
- ✅ Generate unique keys per environment (dev, staging, prod)
- ✅ Store in environment variables, NEVER commit to git
- ✅ Rotate keys periodically (every 6 months)

### 2. Subscription Validation
- ✅ Validate subscription format before storing
- ✅ Check user authentication before subscribing
- ✅ Rate limit subscription endpoints (max 5 per minute)

### 3. Push Notification Security
- ✅ Only send notifications to authenticated users
- ✅ Validate task ownership before sending
- ✅ Sanitize notification content (prevent XSS)
- ✅ Handle expired/invalid subscriptions gracefully

### 4. Privacy
- ✅ User can disable notifications anytime
- ✅ Clear explanation of what data is collected
- ✅ Delete subscriptions on user account deletion
- ✅ No tracking of notification interactions

---

## 🧪 Testing Strategy

### 1. Unit Tests
- [ ] Push subscription creation/deletion
- [ ] Notification payload generation
- [ ] VAPID key validation
- [ ] Cron job logic

### 2. Integration Tests
- [ ] Subscribe → Store → Retrieve flow
- [ ] Send push → Service worker receives
- [ ] Notification click → Open correct page
- [ ] Unsubscribe → Remove from database

### 3. Manual Testing Checklist

#### Browser Compatibility
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox (Desktop & Mobile)
- [ ] Edge (Desktop)
- [ ] Safari (Desktop & Mobile) - Limited support
- [ ] Opera (Desktop)

#### Scenarios
- [ ] First-time user grants permission
- [ ] User denies permission
- [ ] User blocks permission
- [ ] Notification appears when tab inactive
- [ ] Notification appears when browser minimized
- [ ] Click notification opens correct task
- [ ] Multiple notifications stack correctly
- [ ] Quiet hours respected
- [ ] Unsubscribe removes notifications

#### Edge Cases
- [ ] User has multiple devices/browsers
- [ ] Subscription expires
- [ ] Network offline when notification sent
- [ ] Service worker update
- [ ] Browser cache cleared

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

1. **Adoption Rate**
   - Target: 70% of users grant notification permission
   - Measure: (Users with permission / Total users) × 100

2. **Notification Delivery Rate**
   - Target: 95% of notifications delivered successfully
   - Measure: (Delivered / Sent) × 100

3. **Engagement Rate**
   - Target: 40% of notifications clicked
   - Measure: (Clicked / Delivered) × 100

4. **User Retention**
   - Target: 20% increase in daily active users
   - Measure: Compare DAU before/after feature launch

5. **Task Completion Rate**
   - Target: 15% increase in on-time task completion
   - Measure: Compare completion rate before/after

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Setup VAPID keys
- [ ] Create database schema (PushSubscription model)
- [ ] Install dependencies
- [ ] Create service worker basic structure
- [ ] Implement permission request UI

### Phase 2: Backend (Week 2)
- [ ] Implement `/api/push/subscribe` endpoint
- [ ] Implement `/api/push/unsubscribe` endpoint
- [ ] Create push notification utility functions
- [ ] Implement cron job for checking reminders
- [ ] Test push sending with `web-push` library

### Phase 3: Frontend Integration (Week 3)
- [ ] Service worker registration
- [ ] Push subscription flow
- [ ] Notification click handler
- [ ] Settings page UI
- [ ] Test notification button

### Phase 4: Testing & Polish (Week 4)
- [ ] Cross-browser testing
- [ ] Mobile testing (Android/iOS)
- [ ] Error handling & edge cases
- [ ] Performance optimization
- [ ] Documentation

### Phase 5: Deployment & Monitoring (Week 5)
- [ ] Deploy to staging
- [ ] Beta testing with select users
- [ ] Monitor metrics
- [ ] Fix bugs
- [ ] Deploy to production

---

## 🎨 UI/UX Specifications

### 1. Permission Request Modal

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Nova Orb Icon]                │
│                                             │
│         Izinkan Notifikasi?                 │
│                                             │
│  Nova akan mengirimkan notifikasi reminder  │
│  tepat waktu. Kamu bisa mengatur ini       │
│  kapan saja di pengaturan.                 │
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │ Nanti Saja  │  │  Izinkan ✓  │         │
│  └─────────────┘  └─────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Notification Appearance

**Desktop (Windows/macOS/Linux):**
```
┌─────────────────────────────────────────────┐
│ [Nova Icon] Nova Reminder 🔔                │
├─────────────────────────────────────────────┤
│ Hey! Kamu punya tugas 'Beli groceries'     │
│ yang 30 menit lagi.                        │
│                                             │
│ [Lihat Task]  [Tandai Selesai]            │
└─────────────────────────────────────────────┘
```

**Mobile (Android):**
```
┌─────────────────────────────────────────────┐
│ [Icon] Nova Reminder 🔔        [X]          │
│ Hey! Kamu punya tugas 'Beli groceries'     │
│ yang 30 menit lagi.                        │
│                                             │
│ [Lihat Task]  [Tandai Selesai]            │
└─────────────────────────────────────────────┘
```

### 3. Settings Page

```
┌─────────────────────────────────────────────┐
│  Pengaturan Notifikasi                      │
├─────────────────────────────────────────────┤
│                                             │
│  Status: ✅ Notifikasi Aktif                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Toggle] Aktifkan Notifikasi        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Jenis Notifikasi:                         │
│  ┌─────────────────────────────────────┐   │
│  │ [✓] Reminder                         │   │
│  │ [✓] Peringatan Deadline              │   │
│  │ [✓] Notifikasi Overdue               │   │
│  │ [ ] Perayaan Selesai                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Jam Tenang:                               │
│  ┌─────────────────────────────────────┐   │
│  │ [Toggle] Aktifkan Jam Tenang        │   │
│  │ Dari: [22:00] Sampai: [07:00]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      [Test Notifikasi]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🐛 Known Limitations

### Browser Support
- **Safari (iOS)**: Limited support, requires user to "Add to Home Screen"
- **Safari (macOS)**: Supported from macOS Big Sur (11.0+)
- **Firefox (Android)**: Full support
- **Chrome (All platforms)**: Full support

### Technical Limitations
- Notifications require HTTPS (except localhost)
- Service worker requires same-origin
- Push payload size limit: 4KB
- Notification actions limited to 2-4 (browser dependent)

### User Experience
- User must grant permission explicitly
- Cannot force enable notifications
- Notifications may be blocked by OS settings
- Battery optimization may delay notifications on mobile

---

## 📚 References & Resources

### Documentation
- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push Library](https://github.com/web-push-libs/web-push)

### Tools
- [VAPID Key Generator](https://vapidkeys.com/)
- [Push Notification Tester](https://tests.peter.sh/notification-generator/)
- [Can I Use - Push API](https://caniuse.com/push-api)

---

## 🔄 Future Enhancements (Out of Scope for v1.0)

1. **Rich Notifications**
   - Images in notifications
   - Progress bars for tasks
   - Inline reply

2. **Advanced Scheduling**
   - Smart notification timing (ML-based)
   - Snooze functionality
   - Recurring reminders

3. **Multi-Device Sync**
   - Dismiss on one device, dismiss on all
   - Device-specific settings

4. **Analytics Dashboard**
   - Notification delivery stats
   - User engagement metrics
   - A/B testing for notification copy

5. **Native Mobile Apps**
   - React Native app with native push
   - Better battery optimization
   - Offline support

---

## ✅ Acceptance Criteria

### Must Have (v1.0)
- [ ] User can grant/deny notification permission
- [ ] Push notifications sent when reminder time reached
- [ ] Notifications appear even when browser minimized
- [ ] Click notification opens correct task
- [ ] User can disable notifications in settings
- [ ] Works on Chrome, Firefox, Edge (desktop & mobile)
- [ ] HTTPS enabled (required for push)
- [ ] Service worker registered and working
- [ ] Cron job runs every minute
- [ ] Database stores push subscriptions

### Should Have
- [ ] Notification sound (optional)
- [ ] Quiet hours feature
- [ ] Test notification button
- [ ] Multiple notification types (reminder, deadline, overdue)
- [ ] Notification actions (View, Complete)

### Nice to Have
- [ ] Safari support (iOS/macOS)
- [ ] Notification badges
- [ ] Vibration patterns
- [ ] Custom notification icons per task category

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-27 | Initial PRD created |

---

## 👥 Stakeholders & Approvals

| Role | Name | Status | Date |
|------|------|--------|------|
| Product Owner | - | Pending | - |
| Tech Lead | - | Pending | - |
| Designer | - | Pending | - |
| QA Lead | - | Pending | - |

---

## 📞 Contact & Support

For questions or clarifications about this PRD, contact:
- **Development Team**: dev@novareminders.com
- **Project Manager**: pm@novareminders.com

---

**End of Document**

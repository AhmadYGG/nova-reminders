# 📧 Setup Email Notification System

## Quick Setup

### 1. Install Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### 2. Add to `.env`

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Nova Reminders <noreply@novareminders.com>
```

### 3. Create Email Library

File: `src/lib/email.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReminderEmail(
  to: string,
  taskTitle: string,
  reminderTime: Date
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `🔔 Reminder: ${taskTitle}`,
    html: `
      <h2>Nova Reminder</h2>
      <p>Hey! Kamu punya task: <strong>${taskTitle}</strong></p>
      <p>Reminder time: ${reminderTime.toLocaleString()}</p>
    `,
  });
}
```

### 4. Update Scheduler

File: `src/lib/scheduler.ts`

```typescript
import { sendReminderEmail } from './email';

// Di dalam loop task:
await sendReminderEmail(
  task.user.email,
  task.title,
  new Date(task.reminderTime)
);
```

---

## Email Providers

### Gmail (Recommended for Testing)

1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password di `.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### SendGrid (Production)

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: email,
  from: 'noreply@yourdomain.com',
  subject: 'Reminder',
  html: '<p>Your reminder</p>',
});
```

### Resend (Modern)

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Nova <noreply@yourdomain.com>',
  to: email,
  subject: 'Reminder',
  html: '<p>Your reminder</p>',
});
```

---

## Email Templates

### HTML Template

```typescript
function getReminderEmailHTML(task: Task) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c5cfc, #6b4fe0); color: white; padding: 20px; border-radius: 8px; }
        .content { padding: 20px; background: #f5f5f5; border-radius: 8px; margin-top: 20px; }
        .button { background: #7c5cfc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nova Reminder</h1>
        </div>
        <div class="content">
          <h2>${task.title}</h2>
          <p>${task.description || 'No description'}</p>
          <p><strong>Due:</strong> ${task.dueDate?.toLocaleString() || 'No deadline'}</p>
          <a href="https://yourdomain.com" class="button">View Task</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

---

## Testing

```bash
# Create test script
node -e "
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
});

transporter.sendMail({
  from: 'Nova <noreply@test.com>',
  to: 'your-email@gmail.com',
  subject: 'Test Email',
  html: '<h1>Test berhasil!</h1>',
}).then(() => console.log('✅ Email sent!'));
"
```

---

## Comparison: Email vs Push

| Feature | Email | Push Notification |
|---------|-------|-------------------|
| Setup | Easy | Medium |
| Delivery | Slow (seconds) | Fast (instant) |
| Reliability | High | Medium |
| User Action | Must open email | Appears automatically |
| Offline | Works | Requires online |
| Cost | Free (Gmail) / Paid (SendGrid) | Free |
| Spam Risk | High | Low |

**Recommendation:** Use both! Email as backup, Push as primary.

---

## Dual Notification System

```typescript
// src/lib/scheduler.ts
async function sendNotifications(task: Task, user: User) {
  // 1. Send push notification
  const pushResult = await sendPushToUser(user.id, {
    title: 'Nova Reminder 🔔',
    body: generateReminderMessage(task.title),
  });

  // 2. Send email as backup (if push failed or no subscription)
  if (pushResult.sent === 0) {
    await sendReminderEmail(user.email, task.title, task.reminderTime);
    console.log('📧 Email sent as fallback');
  }
}
```

---

## Production Tips

1. **Use transactional email service** (SendGrid, Resend, Postmark)
2. **Add unsubscribe link** (required by law)
3. **Track email opens** (optional)
4. **Rate limit** (prevent spam)
5. **Queue emails** (use Redis/Bull for high volume)


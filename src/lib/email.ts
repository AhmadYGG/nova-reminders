import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email transporter error:', error);
    } else {
      console.log('✅ Email transporter ready');
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Email not configured, skipping send');
      return false;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Nova Reminders <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('✅ Email sent to:', options.to);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
}

/**
 * Send reminder email
 */
export async function sendReminderEmail(
  to: string,
  taskTitle: string,
  taskDescription: string | null,
  reminderTime: Date,
  dueDate: Date | null
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c5cfc, #6b4fe0); color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🔔 Nova Reminder</h1>
      </div>
      
      <div style="padding: 20px; background: #f5f5f5; margin-top: 20px; border-radius: 8px;">
        <p style="margin-top: 0;">Hey! Kamu punya reminder nih:</p>
        
        <h2 style="color: #1a1a1a; margin: 15px 0;">${taskTitle}</h2>
        
        ${taskDescription ? `<p style="color: #666;">${taskDescription}</p>` : ''}
        
        <div style="background: white; border-left: 4px solid #7c5cfc; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 5px 0;"><strong>⏰ Reminder:</strong> ${reminderTime.toLocaleString('id-ID')}</p>
          ${dueDate ? `<p style="margin: 5px 0;"><strong>📅 Due:</strong> ${dueDate.toLocaleString('id-ID')}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
             style="display: inline-block; background: #7c5cfc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Lihat Task
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>Nova Reminders - Your AI-powered reminder assistant</p>
        <p style="color: #999;">Kamu menerima email ini karena kamu mengaktifkan reminder.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Nova Reminder 🔔

${taskTitle}
${taskDescription || ''}

⏰ Reminder: ${reminderTime.toLocaleString('id-ID')}
${dueDate ? `📅 Due: ${dueDate.toLocaleString('id-ID')}` : ''}

Lihat task: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

---
Nova Reminders - Your AI-powered reminder assistant
Kamu menerima email ini karena kamu mengaktifkan reminder.
  `.trim();

  return sendEmail({
    to,
    subject: `🔔 Reminder: ${taskTitle}`,
    html,
    text,
  });
}

/**
 * Send test email
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #7c5cfc, #6b4fe0); color: white; padding: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Test Email Berhasil!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Email configuration berfungsi dengan baik.</p>
          <p>Timestamp: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: '✅ Nova Reminders - Test Email',
    html,
    text: 'Test email berhasil! Email configuration berfungsi dengan baik.',
  });
}

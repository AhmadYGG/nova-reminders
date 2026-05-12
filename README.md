# 🌟 Nova Reminders

AI-powered reminder app with Web Push Notifications & Email alerts.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
nova-reminders/
├── src/                    # Source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/              # Utilities & services
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   └── types/            # TypeScript types
├── prisma/               # Database schema
├── public/               # Static assets
├── scripts/              # Utility scripts
│   ├── server-https.js   # HTTPS dev server
│   ├── setup-https.sh    # SSL certificate setup
│   ├── test-push-notification.js
│   ├── test-push-manual.sh
│   └── create-test-task.js
├── docs/                 # Documentation
│   ├── analysis/         # Technical analysis
│   ├── setup/           # Setup guides
│   ├── PRD-Web-Push-Notification.md
│   ├── IMPLEMENTATION-GUIDE.md
│   ├── TESTING-GUIDE.md
│   └── QUICK-START.md
├── tools/                # Development tools
│   ├── debug-subscription.html
│   └── insomnia-collection.json
└── docker/               # Docker configs
    ├── Dockerfile
    ├── docker-compose.yml
    └── docker-compose.prod.yml
```

---

## 🛠️ Available Scripts

### Development
```bash
npm run dev              # Start dev server (HTTP)
npm run dev:https        # Start dev server (HTTPS)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database
```bash
npm run db:push          # Push schema to database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
```

### Testing
```bash
npm run test:push        # Test push notification system
npm run test:task        # Create test task with reminder
npm run setup:https      # Setup HTTPS certificates
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env`:

```env
# Database
DATABASE_URL="mysql://user:pass@host:port/db"

# Auth
JWT_SECRET="your-secret"
NEXTAUTH_SECRET="your-secret"

# Push Notifications
VAPID_PUBLIC_KEY="your-key"
VAPID_PRIVATE_KEY="your-key"
VAPID_SUBJECT="mailto:admin@yourdomain.com"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Cron
CRON_SECRET="your-secret"
```

---

## 📱 Features

- ✅ Task management with reminders
- ✅ Web Push Notifications
- ✅ Email notifications (fallback)
- ✅ Categories & priorities
- ✅ Drag & drop reordering
- ✅ Dark mode UI
- ✅ Mobile responsive
- ✅ PWA support

---

## 🧪 Testing

### 1. Test Push Notifications

```bash
# Run automated test
npm run test:push

# Or manual test
./scripts/test-push-manual.sh subscriptions
./scripts/test-push-manual.sh send-push
```

### 2. Test Email

```bash
# Via API
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com"}'
```

### 3. Test Reminders

```bash
# Create task with 2-minute reminder
npm run test:task 2

# Wait 2 minutes, then check
curl http://localhost:3000/api/cron/check-reminders
```

### 4. Debug Tools

Open [http://localhost:3000/debug-subscription.html](http://localhost:3000/debug-subscription.html)

---

## 📚 Documentation

- [Quick Start Guide](docs/QUICK-START.md)
- [Implementation Guide](docs/IMPLEMENTATION-GUIDE.md)
- [Testing Guide](docs/TESTING-GUIDE.md)
- [PRD](docs/PRD-Web-Push-Notification.md)
- [Setup HTTPS](docs/setup/SETUP-HTTPS-DEV.md)
- [Setup Email](docs/setup/SETUP-EMAIL-NOTIFICATION.md)

---

## 🐳 Docker Deployment

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MySQL / Prisma ORM
- **Auth:** JWT + HTTP-only cookies
- **Push:** Web Push API + VAPID
- **Email:** Nodemailer
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Deployment:** Docker

---

## 📞 API Endpoints

Import `tools/insomnia-collection.json` to Insomnia/Postman.

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Push Notifications
- `GET /api/push/vapid-public-key` - Get VAPID key
- `POST /api/push/subscribe` - Subscribe
- `POST /api/push/test` - Test push

### Email
- `POST /api/email/test` - Test email

### Cron
- `GET /api/cron/check-reminders` - Check reminders

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- Next.js team
- shadcn/ui
- Prisma
- Web Push Protocol

---

**Built with ❤️ by Nova Team**

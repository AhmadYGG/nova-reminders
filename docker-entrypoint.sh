#!/bin/sh
# ============================================
# Nova Reminders - Docker Entry Point
# Waits for database and runs migrations
# ============================================

set -e

echo "🚀 Starting Nova Reminders..."

# Validate required environment variables
for var in JWT_SECRET NEXTAUTH_SECRET; do
  if [ -z "$(eval echo \$$var)" ]; then
    echo "❌ Required environment variable $var is not set"
    exit 1
  fi
done

# Run database migrations
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Running database migrations..."

  MAX_RETRIES=30
  RETRY_COUNT=0

  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if bun run db:push 2>/dev/null; then
      echo "✅ Database schema synced!"
      break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  done

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Could not connect to database after $MAX_RETRIES attempts"
    exit 1
  fi
fi

echo "✅ Nova Reminders is ready!"
exec "$@"

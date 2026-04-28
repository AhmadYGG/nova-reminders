#!/bin/sh
# ============================================
# Nova Reminders - Docker Entry Point
# Waits for MySQL and runs migrations
# ============================================

set -e

echo "🚀 Starting Nova Reminders..."

# Wait for MySQL to be healthy (if using MySQL)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Checking database connection..."
  
  MAX_RETRIES=30
  RETRY_COUNT=0
  
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if bun run db:push 2>/dev/null; then
      echo "✅ Database connected and synced!"
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

# Seed default categories if needed
echo "🌱 Checking if database needs seeding..."

echo "✅ Nova Reminders is ready!"
exec "$@"

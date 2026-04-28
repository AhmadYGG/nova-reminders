#!/bin/sh
# ============================================
# Nova Reminders - Docker Entry Point
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

echo "✅ Nova Reminders is ready!"
exec "$@"

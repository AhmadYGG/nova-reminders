# ============================================
# Nova Reminders - Dockerfile
# Multi-stage build for production
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Generate Prisma client
RUN bun run db:generate

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN bun run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install bun for running migrations
RUN npm install -g bun

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]

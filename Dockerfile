# Multi-stage Dockerfile for Print with Muri
# Uses Debian base for better CuraEngine compatibility

FROM node:20-bullseye-slim AS base

# Install CuraEngine and dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download CuraEngine binary (Ubuntu version works on Debian)
RUN wget -O /tmp/cura.tar.gz https://github.com/Ultimaker/CuraEngine/releases/download/4.13.1/CuraEngine-4.13.1-linux.tar.gz && \
    tar -xzf /tmp/cura.tar.gz -C /usr/local/bin/ --strip-components=1 && \
    chmod +x /usr/local/bin/CuraEngine && \
    rm /tmp/cura.tar.gz && \
    /usr/local/bin/CuraEngine help || echo "CuraEngine installed"

# Dependencies stage
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Build Next.js application
RUN npm run build

# Runner stage
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy CuraEngine from base
COPY --from=base /usr/local/bin/CuraEngine /usr/local/bin/CuraEngine

# Copy Next.js build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy config directory for CuraEngine profiles
COPY --from=builder --chown=nextjs:nodejs /app/config ./config

# Create temp directory for slicing
RUN mkdir -p /tmp/slicing && chown nextjs:nodejs /tmp/slicing

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]

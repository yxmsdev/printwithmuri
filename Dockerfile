# Multi-stage Dockerfile for Print with Muri
# Includes CuraEngine for server-side 3D model slicing

# Build CuraEngine from source
FROM debian:bookworm-slim AS curaengine-builder

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    g++ \
    libarcus-dev \
    protobuf-compiler \
    libprotobuf-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --depth 1 --branch 5.7.2 https://github.com/Ultimaker/CuraEngine.git && \
    cd CuraEngine && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make -j$(nproc) && \
    strip CuraEngine

# Main application image
FROM node:20-alpine AS base

# Install runtime dependencies for CuraEngine
RUN apk add --no-cache \
    libc6-compat \
    libstdc++ \
    libgcc

# Copy CuraEngine binary from builder
COPY --from=curaengine-builder /build/CuraEngine/build/CuraEngine /usr/local/bin/CuraEngine
RUN chmod +x /usr/local/bin/CuraEngine

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

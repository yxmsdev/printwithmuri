# Multi-stage Dockerfile for Print with Muri
# Uses PrusaSlicer CLI for 3D model slicing

FROM node:20-bullseye-slim AS base

# Install PrusaSlicer and dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    libgtk-3-0 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Download and install PrusaSlicer AppImage
RUN wget -O /tmp/PrusaSlicer.AppImage https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.7.1/PrusaSlicer-2.7.1+linux-x64-GTK3-202311211648.AppImage && \
    chmod +x /tmp/PrusaSlicer.AppImage && \
    cd /tmp && \
    ./PrusaSlicer.AppImage --appimage-extract && \
    mv squashfs-root /opt/PrusaSlicer && \
    ln -s /opt/PrusaSlicer/usr/bin/prusa-slicer /usr/local/bin/prusa-slicer && \
    rm /tmp/PrusaSlicer.AppImage

# Create CuraEngine wrapper that calls PrusaSlicer
RUN echo '#!/bin/bash\nexec /usr/local/bin/prusa-slicer "$@"' > /usr/local/bin/CuraEngine && \
    chmod +x /usr/local/bin/CuraEngine

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

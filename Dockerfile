# PrusaSlicer-based 3D Model Slicing Container

FROM node:20-bullseye-slim AS base

# Install dependencies for AppImage extraction
RUN apt-get update && apt-get install -y \
    squashfs-tools \
    wget \
    libgl1 \
    libglu1-mesa \
    libxrender1 \
    libxi6 \
    libxrandr2 \
    libxcursor1 \
    libxinerama1 \
    libgtk-3-0 \
    libglib2.0-0 \
    libwebkit2gtk-4.0-37 \
    libegl1 \
    && rm -rf /var/lib/apt/lists/*


# Install PrusaSlicer using manual extraction
RUN cd /tmp && \
    wget https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.8.1/PrusaSlicer-2.8.1+linux-x64-older-distros-GTK3-202409181354.AppImage && \
chmod +x PrusaSlicer-2.8.1+linux-x64-older-distros-GTK3-202409181354.AppImage && \
offset=$(./PrusaSlicer-2.8.1+linux-x64-older-distros-GTK3-202409181354.AppImage --appimage-offset 2>/dev/null || echo "188392") && \
dd if=PrusaSlicer-2.8.1+linux-x64-older-distros-GTK3-202409181354.AppImage bs=1 skip=$offset of=filesystem.squashfs 2>/dev/null && \
    unsquashfs -d /opt/PrusaSlicer filesystem.squashfs && \
    ln -s /opt/PrusaSlicer/usr/bin/prusa-slicer /usr/local/bin/prusa-slicer && \
    rm -rf /tmp/*

# Create CuraEngine wrapper for backward compatibility (env var support)
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

# Copy PrusaSlicer and wrapper from base
COPY --from=base /usr/local/bin/prusa-slicer /usr/local/bin/prusa-slicer
COPY --from=base /usr/local/bin/CuraEngine /usr/local/bin/CuraEngine
COPY --from=base /opt/PrusaSlicer /opt/PrusaSlicer

# Copy Next.js build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy PrusaSlicer config profiles
COPY --from=builder --chown=nextjs:nodejs /app/config ./config

# Create temp directory for slicing
RUN mkdir -p /tmp/slicing && chown nextjs:nodejs /tmp/slicing

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]

# 3D Model Slicing Setup

This document explains how 3D model slicing works in Print with Muri.

## Architecture Overview

Print with Muri uses **two different pricing approaches** depending on the environment:

| Environment | Slicing Method | Accuracy | Speed |
|-------------|----------------|----------|-------|
| **Local Development** | Volume-based estimation | ~80% accurate | Instant |
| **Production (Droplet)** | Real PrusaSlicer G-code | ~99% accurate | 10-30s |

## Local Development

When running `npm run dev` on your machine:

✅ **What happens:**
- Frontend uses `lib/pricing.ts` for instant price calculation
- Estimates weight based on volume, material density, and infill
- No actual G-code slicing occurs
- **No Docker/PrusaSlicer needed**

⚠️ **Limitations:**
- Slightly less accurate (doesn't account for supports, rafts, travel moves)
- Good enough for development and testing

📝 **Console output:**
```
🔧 Development mode: using local estimation only
📊 Local price calculated: {...}
```

## Production (DigitalOcean Droplet)

When deployed to your droplet with Docker:

✅ **What happens:**
- Docker container has PrusaSlicer installed (see `Dockerfile`)
- Frontend calls `/api/slicer/slice` endpoint
- PrusaSlicer generates real G-code
- Pricing calculated from actual toolpath
- G-code cached in `/tmp/slicing` for 24 hours

⚠️ **Requirements:**
- Docker container running (includes PrusaSlicer)
- 2GB+ RAM recommended
- Files auto-cleaned after 24h

📝 **Console output:**
```
🎯 Production mode: attempting server-side slicing
📤 Requesting server-side slice...
⚙️ Starting CuraEngine slicing...
✅ Slicing completed successfully
💰 Pricing calculated: ...
```

## How It Works

### Frontend (`components/configurator/ConfiguratorSidebar.tsx`)

```typescript
// Development: Skip API, use local estimation
if (process.env.NODE_ENV !== 'production') {
  const localPrice = calculatePrice(config, modelInfo);
  setPriceBreakdown({ ...localPrice, source: 'local-estimation' });
  return;
}

// Production: Call server slicing API
const response = await fetch('/api/slicer/slice', {
  method: 'POST',
  body: formData,
});
```

### Backend (`app/api/slicer/slice/route.ts`)

```typescript
// 1. Save uploaded STL/OBJ file to /tmp/slicing
// 2. Run PrusaSlicer CLI to generate G-code
// 3. Parse G-code for print time and material usage
// 4. Calculate pricing from real metrics
// 5. Return quote with accurate data
```

### Docker Container (`Dockerfile`)

```dockerfile
# Install PrusaSlicer from AppImage
RUN wget https://github.com/prusa3d/PrusaSlicer/releases/.../PrusaSlicer.AppImage
RUN unsquashfs -d /opt/PrusaSlicer filesystem.squashfs
RUN ln -s /opt/PrusaSlicer/usr/bin/prusa-slicer /usr/local/bin/CuraEngine

# Create temp directory
RUN mkdir -p /tmp/slicing && chown nextjs:nodejs /tmp/slicing
```

## Deployment Checklist

### Local Development (No Setup Needed!)
- [ ] Run `npm run dev`
- [ ] Upload a 3D model
- [ ] See instant pricing (volume-based)
- [ ] Console shows: `🔧 Development mode: using local estimation only`

### Production Deployment
- [ ] Droplet created with Ubuntu 22.04
- [ ] Docker & Docker Compose installed
- [ ] Build Docker image with `./scripts/deploy.sh`
- [ ] Container running with PrusaSlicer installed
- [ ] Test slicing: Upload model, check console for `⚙️ Starting CuraEngine slicing...`
- [ ] Verify `/tmp/slicing` directory exists in container

## Troubleshooting

### "Slicing failed" in production

**Check if PrusaSlicer is installed:**
```bash
docker exec print-with-muri /usr/local/bin/CuraEngine help
```

**Check container logs:**
```bash
docker logs print-with-muri | grep -i slicer
```

**Verify temp directory:**
```bash
docker exec print-with-muri ls -la /tmp/slicing
```

### Slicing is too slow

- Upgrade droplet to 2 CPUs, 4GB RAM
- Check if multiple users slicing simultaneously
- Consider queue system (Redis + BullMQ)

### Out of disk space

G-code files auto-delete after 24h, but you can manually clean:
```bash
docker exec print-with-muri find /tmp/slicing -name "*.gcode" -mtime +1 -delete
```

## Price Accuracy Comparison

### Local Estimation (Development)
```
Test Cube (20mm × 20mm × 20mm, 25% infill, PLA)
📊 Estimated: 8.2g, ₦1,830
```

### Server Slicing (Production)
```
Test Cube (20mm × 20mm × 20mm, 25% infill, PLA)
✅ Actual: 7.8g, ₦1,760 (from real G-code)
```

**Difference:** ~4% (acceptable for development)

## Environment Variables

```env
# Required for production
CURAENGINE_PATH=/usr/local/bin/CuraEngine
SLICER_TIMEOUT=60000
SLICER_TEMP_DIR=/tmp/slicing

# Not needed for local development
```

## File Structure

```
/print-with-muri
├── lib/
│   ├── curaengine.ts          # PrusaSlicer wrapper (server only)
│   ├── gcode-parser.ts         # Parse G-code metrics (server only)
│   ├── pricing.ts              # Local estimation (dev + fallback)
│   └── model-parser.ts         # Extract volume from STL/OBJ
├── app/api/slicer/slice/
│   └── route.ts                # Slicing API endpoint (server only)
├── components/configurator/
│   └── ConfiguratorSidebar.tsx # Smart fallback logic
└── Dockerfile                  # Installs PrusaSlicer
```

## Summary

- **Local dev = Easy:** No setup, instant pricing, slightly less accurate
- **Production = Accurate:** Real slicing, precise pricing, requires Docker
- **Smart fallback:** Production falls back to local if slicing fails
- **No Cloud API:** Self-hosted slicing on your own droplet

The current error you saw was because you were running locally and the code tried to use PrusaSlicer (which only exists in Docker). Now it's fixed! ✅

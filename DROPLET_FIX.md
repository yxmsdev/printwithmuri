# Droplet Slicing Fix

## What Was Wrong

1. **Missing config files**: Code tried to load `/app/config/prusaslicer/*.ini` files that didn't exist
2. **Wrong PrusaSlicer syntax**: Command format was incorrect
3. **No test script**: No way to verify PrusaSlicer was working

## What I Fixed

1. **Updated `lib/curaengine.ts`**: Now uses inline settings (no config files needed)
2. **Created `scripts/test-slicer.sh`**: Test script to verify PrusaSlicer works
3. **Updated `Dockerfile`**: Removed config directory copy
4. **Fixed `ConfiguratorSidebar.tsx`**: Added dev mode check (bonus fix)

## How to Deploy the Fix

### Step 1: Rebuild and Deploy

On your **local machine**:

```bash
cd "/Users/eyiyemiadegbite/Documents/Muri Press Web/print-with-muri"

# Commit the changes
git add -A
git commit -m "Fix PrusaSlicer configuration"

# Set your droplet IP
export DROPLET_IP=your-droplet-ip

# Deploy
./scripts/deploy.sh
```

### Step 2: Test PrusaSlicer on Droplet

SSH into your droplet:

```bash
ssh root@your-droplet-ip
```

Upload and run the test script:

```bash
# From your local machine
scp scripts/test-slicer.sh root@your-droplet-ip:/tmp/

# From the droplet
chmod +x /tmp/test-slicer.sh
/tmp/test-slicer.sh
```

Expected output:

```
🔍 Testing PrusaSlicer installation...

1️⃣ Checking if PrusaSlicer is installed...
✅ PrusaSlicer found at: /usr/local/bin/prusa-slicer

2️⃣ Checking CuraEngine wrapper...
✅ CuraEngine wrapper exists

3️⃣ Testing PrusaSlicer help...
✅ PrusaSlicer help command works

4️⃣ Checking /tmp/slicing directory...
✅ /tmp/slicing exists

5️⃣ Creating test STL file (simple cube)...
✅ Test cube created

6️⃣ Testing actual slicing with PrusaSlicer...
✅ G-code generated successfully!

7️⃣ Cleanup...
✅ Test files cleaned up

================================================
✅ ALL TESTS PASSED!
================================================
```

### Step 3: Test the Web App

1. Go to your production URL (e.g., `https://printwithmuri.com`)
2. Upload an STL file
3. Configure print settings
4. Check that pricing loads without errors

### Step 4: Check Logs

Watch the container logs to see slicing happen:

```bash
docker logs -f print-with-muri
```

You should see:

```
🔵 Starting slice operation...
📁 File saved to: /tmp/slicing/model-xxx.stl
⚙️  Starting CuraEngine slicing...
Command: prusa-slicer --export-gcode --output ...
✅ Slicing completed successfully
💰 Pricing calculated:
  Weight: 12.4g
  Time: 1.23h
  Material Cost: ₦1,860
  Machine Cost: ₦2,460
  Total: ₦4,820
```

## Troubleshooting

### Test script fails at step 1

**Issue**: PrusaSlicer not installed

**Fix**:

```bash
# Check if container is running
docker ps | grep print-with-muri

# If not running, start it
docker start print-with-muri

# If still fails, rebuild from scratch
docker rm -f print-with-muri
export DROPLET_IP=your-ip
./scripts/deploy.sh
```

### Test script fails at step 6

**Issue**: Slicing command has wrong syntax

**Fix**: Make sure you deployed the latest code with the fixed `curaengine.ts`

```bash
# On local machine
git status  # Should show lib/curaengine.ts is committed
./scripts/deploy.sh
```

### Web app still shows errors

**Check 1**: Make sure container restarted

```bash
docker restart print-with-muri
docker logs print-with-muri
```

**Check 2**: Verify environment variables

```bash
docker exec print-with-muri env | grep CURAENGINE_PATH
# Should show: CURAENGINE_PATH=/usr/local/bin/CuraEngine
```

**Check 3**: Test from inside container

```bash
docker exec -it print-with-muri bash
prusa-slicer --help
ls -la /tmp/slicing
exit
```

### G-code files accumulating

Cleanup old files (automatic after 24h, but you can do it manually):

```bash
docker exec print-with-muri find /tmp/slicing -name "*.gcode" -mtime +1 -delete
```

## Quick Commands Reference

```bash
# View logs
docker logs -f print-with-muri

# Restart container
docker restart print-with-muri

# Enter container
docker exec -it print-with-muri bash

# Check if PrusaSlicer works
docker exec print-with-muri prusa-slicer --help

# List sliced files
docker exec print-with-muri ls -la /tmp/slicing

# Test slicing manually
docker exec print-with-muri prusa-slicer \
  --export-gcode \
  --output /tmp/test.gcode \
  --layer-height 0.2 \
  --fill-density 25% \
  /path/to/model.stl
```

## Summary of Changes

**Files modified:**
- ✅ `lib/curaengine.ts` - Fixed PrusaSlicer command syntax
- ✅ `Dockerfile` - Removed config directory reference
- ✅ `components/configurator/ConfiguratorSidebar.tsx` - Added dev mode check

**Files created:**
- ✅ `scripts/test-slicer.sh` - PrusaSlicer test script
- ✅ `SLICING_SETUP.md` - Documentation
- ✅ `DROPLET_FIX.md` - This file

The slicing should now work on your droplet! 🚀

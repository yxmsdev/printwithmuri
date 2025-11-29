# Slicing Functionality Debugging Guide

This guide helps you diagnose and fix issues with the server-side 3D model slicing using PrusaSlicer.

## Quick Health Check

First, verify that PrusaSlicer is installed and accessible:

```bash
# On your deployed server
curl http://localhost:3000/api/slicer/health
```

Or visit `https://your-domain.com/api/slicer/health` in your browser.

**Expected response (success):**
```json
{
  "success": true,
  "message": "PrusaSlicer is installed and accessible",
  "prusaslicerPath": "/usr/local/bin/prusa-slicer",
  "timeout": 60000,
  "tempDir": "/tmp/slicing"
}
```

**Expected response (failure):**
```json
{
  "success": false,
  "message": "PrusaSlicer is not installed or not accessible",
  "prusaslicerPath": "/usr/local/bin/prusa-slicer"
}
```

## Common Issues and Solutions

### 1. Slicing Loads Forever (No Response)

**Symptoms:**
- UI shows loading spinner indefinitely
- No error messages in browser console
- Server logs don't show completion

**Possible Causes:**
- PrusaSlicer command is hanging
- Timeout is too short for complex models
- PrusaSlicer isn't installed correctly

**Solutions:**

a) **Check server logs** for detailed error messages:
```bash
# View Docker logs
docker logs -f <container-name>

# Or on the server directly
journalctl -u your-service-name -f
```

b) **Increase timeout** in environment variables:
```env
# .env.local or server environment
SLICER_TIMEOUT=120000  # 2 minutes (default is 60s)
```

c) **Verify PrusaSlicer installation** inside Docker container:
```bash
# SSH into your server
docker exec -it <container-name> /bin/bash

# Test PrusaSlicer
/usr/local/bin/prusa-slicer --help

# Check if it's executable
ls -la /usr/local/bin/prusa-slicer
```

### 2. "PrusaSlicer not found" Error

**Symptoms:**
- Error message: `PrusaSlicer not found at /usr/local/bin/prusa-slicer`
- Health check endpoint returns failure

**Solutions:**

a) **Rebuild Docker container:**
```bash
# On your server
cd /path/to/print-with-muri
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

b) **Check Dockerfile** - Ensure PrusaSlicer installation steps are present (lines 23-31 in Dockerfile)

c) **Set environment variable** if PrusaSlicer is installed elsewhere:
```env
PRUSASLICER_PATH=/custom/path/to/prusa-slicer
```

### 3. "G-code file was not created" Error

**Symptoms:**
- Slicing command runs but produces no output
- Error: `G-code file was not created at /tmp/slicing/model-xxx.gcode`

**Possible Causes:**
- Invalid 3D model file
- PrusaSlicer crashed silently
- Missing configuration files
- Permission issues with temp directory

**Solutions:**

a) **Check temp directory permissions:**
```bash
docker exec -it <container-name> /bin/bash
ls -la /tmp/slicing
# Should be owned by 'nextjs' user
```

b) **Verify config files exist:**
```bash
docker exec -it <container-name> /bin/bash
ls -la /app/config/prusaslicer/printer/
ls -la /app/config/prusaslicer/filament/
ls -la /app/config/prusaslicer/print/
```

c) **Test PrusaSlicer manually:**
```bash
docker exec -it <container-name> /bin/bash

# Download a test STL file (cube)
cd /tmp
# Create a simple test file or copy one from your uploads

# Run PrusaSlicer manually
/usr/local/bin/prusa-slicer --export-gcode test.stl \
  --output test.gcode \
  --load /app/config/prusaslicer/printer/Generic_FDM.ini \
  --load /app/config/prusaslicer/filament/PLA.ini \
  --load /app/config/prusaslicer/print/Standard_Quality.ini \
  --layer-height 0.2 \
  --fill-density 20%

# Check if G-code was created
ls -la test.gcode
```

### 4. Slicing Timeout Errors

**Symptoms:**
- Error: `Slicing timeout after 60s`
- Large or complex models fail to slice

**Solutions:**

a) **Increase timeout value:**
```env
SLICER_TIMEOUT=180000  # 3 minutes for complex models
```

b) **Restart the service** after changing environment variables:
```bash
docker-compose down
docker-compose up -d
```

c) **Use draft quality** for testing - it's faster

### 5. Inaccurate Logs

**What changed:**
The logging system has been completely overhauled with:
- Request IDs to track individual slice operations
- Detailed timestamps for each step
- Full stdout/stderr capture from PrusaSlicer
- Better error messages with specific failure reasons

**How to read the new logs:**

```
================================================================================
🆕 NEW SLICE REQUEST [abc123]
================================================================================

[abc123] 📥 Parsing form data...
[abc123] ✅ Validation passed
[abc123] 🔵 Starting slice operation...
[abc123]   File: cube.stl (1.23 KB)
[abc123]   Quality: standard
[abc123]   Material: PLA
[abc123]   Infill: 20%
[abc123] 📁 Ensuring temp directory exists: /tmp/slicing
[abc123] 💾 Saving uploaded file to: /tmp/slicing/model-1234567890-xyz.stl
[abc123] ✅ File saved successfully
[abc123] ⚙️  Invoking PrusaSlicer...

🔧 Starting PrusaSlicer slice...
Input: /tmp/slicing/model-1234567890-xyz.stl
Output: /tmp/slicing/model-1234567890-abc.gcode
Config: {"quality":"standard","material":"PLA","infillDensity":20}
PrusaSlicer Path: /usr/local/bin/prusa-slicer
Timeout: 60000 ms
Full Command: /usr/local/bin/prusa-slicer --export-gcode /tmp/slicing/model-1234567890-xyz.stl --output /tmp/slicing/model-1234567890-abc.gcode --load /app/config/prusaslicer/printer/Generic_FDM.ini --load /app/config/prusaslicer/filament/PLA.ini --load /app/config/prusaslicer/print/Standard_Quality.ini --layer-height 0.2 --fill-density 20%
⏳ Executing PrusaSlicer (this may take up to 60 seconds)...

[PrusaSlicer output here]

⏱️ PrusaSlicer execution took 5432 ms
✅ G-code file created: /tmp/slicing/model-1234567890-abc.gcode (123456 bytes)
📖 Reading G-code file...
🔍 Parsing G-code ( 123456 bytes)...
📊 Parsed metrics: {"printTimeSeconds":3600,"printTimeHours":1,"filamentLengthMm":5000,"filamentWeightGrams":15,"layerCount":50,"materialType":"PLA"}
✅ Slicing completed successfully

[abc123] ⏱️  Slicing operation took 5.4s
[abc123] 🗑️  Cleaned up input file
[abc123] ✅ Slicing succeeded
[abc123] 💰 Pricing calculated:
[abc123]   Weight: 15.00g
[abc123]   Time: 1.00h
[abc123]   Material Cost: ₦2250.00
[abc123]   Machine Cost: ₦2000.00
[abc123]   Total: ₦4750.00
[abc123] 🎉 Slice request completed successfully
[abc123] Quote ID: quote-1234567890-xyz
```

**Key things to look for in logs:**
- Request ID (`[abc123]`) - tracks the entire request lifecycle
- Each step is clearly marked with emoji indicators
- Timestamps show how long each operation takes
- Full PrusaSlicer command is logged for debugging
- Error messages include type, message, and stack trace

## Environment Variables Reference

Add these to your `.env.local` (development) or server environment (production):

```env
# PrusaSlicer Configuration
PRUSASLICER_PATH=/usr/local/bin/prusa-slicer  # Path to PrusaSlicer executable (optional, uses default)
SLICER_TIMEOUT=60000                           # Timeout in milliseconds (default: 60s)
SLICER_TEMP_DIR=/tmp/slicing                   # Temporary directory for slicing files (default)
```

## Manual Testing Steps

### 1. Test the health endpoint
```bash
curl https://your-domain.com/api/slicer/health
```

### 2. Test slicing with a simple file
```bash
# Use a small test STL file
curl -X POST https://your-domain.com/api/slicer/slice \
  -F "file=@cube.stl" \
  -F "quality=draft" \
  -F "material=PLA" \
  -F "infillDensity=20"
```

### 3. Monitor logs in real-time
```bash
docker logs -f <container-name> 2>&1 | grep -E "\[.*\]|🔧|⚙️|✅|❌"
```

## Performance Benchmarks

Expected slicing times (approximate):

| Model Complexity | File Size | Draft | Standard | High | Ultra |
|-----------------|-----------|-------|----------|------|-------|
| Simple (cube)   | < 1 MB    | 2-5s  | 3-8s     | 5-15s| 10-30s|
| Medium (figure) | 1-10 MB   | 5-15s | 10-30s   | 20-60s| 60-180s|
| Complex (detailed) | > 10 MB | 15-60s| 30-120s  | 60-300s| 180-600s|

If slicing takes longer than these ranges, consider:
- Increasing `SLICER_TIMEOUT`
- Using a faster server (more CPU)
- Recommending simpler models to users

## Troubleshooting Checklist

- [ ] Health check endpoint returns success
- [ ] PrusaSlicer is executable: `/usr/local/bin/prusa-slicer --help` works
- [ ] Config files exist in `/app/config/prusaslicer/`
- [ ] Temp directory `/tmp/slicing` exists and has correct permissions
- [ ] Environment variables are set correctly
- [ ] Docker container was rebuilt after Dockerfile changes
- [ ] Server logs show detailed request information with request IDs
- [ ] Timeout is sufficient for your model complexity

## Getting Help

If issues persist:

1. **Collect logs:**
   - Full Docker logs during a slice attempt
   - Browser console output
   - Network tab showing the API request/response

2. **Test manually:**
   - Run PrusaSlicer command manually inside container
   - Try with a simple cube.stl file first

3. **Check versions:**
   - PrusaSlicer version: `docker exec <container> /usr/local/bin/prusa-slicer --help | head -1`
   - Node.js version: `docker exec <container> node --version`
   - Docker version: `docker --version`

## Recent Fixes Applied

The following fixes have been implemented:

1. ✅ Removed unnecessary quotes from shell command paths
2. ✅ Added comprehensive logging with request IDs
3. ✅ Added G-code file verification before parsing
4. ✅ Improved error messages with specific failure reasons
5. ✅ Added health check endpoint
6. ✅ Added execution time tracking for each step
7. ✅ Added stdout/stderr capture from PrusaSlicer
8. ✅ Added better timeout error messages

Check your server logs for the new detailed output format!

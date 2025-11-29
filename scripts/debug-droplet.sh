#!/bin/bash
# Debug script to check slicing setup on droplet

echo "🔍 Debugging Slicing Setup on Droplet"
echo "======================================"
echo ""

# 1. Check if container is running
echo "1️⃣ Checking if container is running..."
if docker ps | grep -q print-with-muri; then
    echo "✅ Container is running"
else
    echo "❌ Container is NOT running!"
    echo "   Start it with: docker start print-with-muri"
    exit 1
fi

# 2. Check PrusaSlicer binary
echo ""
echo "2️⃣ Checking PrusaSlicer installation..."
if docker exec print-with-muri test -f /usr/local/bin/prusa-slicer; then
    echo "✅ PrusaSlicer binary exists"
else
    echo "❌ PrusaSlicer binary NOT found!"
    exit 1
fi

# 3. Check CuraEngine wrapper
echo ""
echo "3️⃣ Checking CuraEngine wrapper..."
if docker exec print-with-muri test -f /usr/local/bin/CuraEngine; then
    echo "✅ CuraEngine wrapper exists"
    echo "   Content:"
    docker exec print-with-muri cat /usr/local/bin/CuraEngine | sed 's/^/     /'
else
    echo "❌ CuraEngine wrapper NOT found!"
    exit 1
fi

# 4. Check config directory
echo ""
echo "4️⃣ Checking config directory..."
if docker exec print-with-muri test -d /app/config/prusaslicer; then
    echo "✅ Config directory exists"
    echo "   Contents:"
    docker exec print-with-muri find /app/config/prusaslicer -type f | sed 's/^/     /'
else
    echo "❌ Config directory NOT found!"
    echo "   This means the Dockerfile didn't copy the config files"
    exit 1
fi

# 5. Check temp directory
echo ""
echo "5️⃣ Checking /tmp/slicing directory..."
if docker exec print-with-muri test -d /tmp/slicing; then
    echo "✅ /tmp/slicing exists"
    OWNER=$(docker exec print-with-muri stat -c '%U:%G' /tmp/slicing)
    PERMS=$(docker exec print-with-muri stat -c '%a' /tmp/slicing)
    echo "   Owner: $OWNER"
    echo "   Permissions: $PERMS"
    echo "   Files:"
    docker exec print-with-muri ls -lah /tmp/slicing | sed 's/^/     /'
else
    echo "❌ /tmp/slicing does NOT exist!"
    exit 1
fi

# 6. Check environment variables
echo ""
echo "6️⃣ Checking environment variables..."
echo "   CURAENGINE_PATH=$(docker exec print-with-muri printenv CURAENGINE_PATH)"
echo "   SLICER_TIMEOUT=$(docker exec print-with-muri printenv SLICER_TIMEOUT)"
echo "   SLICER_TEMP_DIR=$(docker exec print-with-muri printenv SLICER_TEMP_DIR)"
echo "   NODE_ENV=$(docker exec print-with-muri printenv NODE_ENV)"

# 7. Test PrusaSlicer help
echo ""
echo "7️⃣ Testing PrusaSlicer help command..."
if docker exec print-with-muri /usr/local/bin/prusa-slicer --help > /dev/null 2>&1; then
    echo "✅ PrusaSlicer help works"
else
    echo "❌ PrusaSlicer help command failed!"
    docker exec print-with-muri /usr/local/bin/prusa-slicer --help 2>&1 | tail -10
    exit 1
fi

# 8. Check recent container logs
echo ""
echo "8️⃣ Recent container logs (last 20 lines):"
docker logs print-with-muri --tail 20 | sed 's/^/     /'

echo ""
echo "======================================"
echo "✅ Basic checks passed!"
echo ""
echo "Next steps:"
echo "1. Upload a model through the web interface"
echo "2. Watch logs: docker logs -f print-with-muri"
echo "3. Look for slicing errors in the logs"

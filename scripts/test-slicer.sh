#!/bin/bash
# Test PrusaSlicer installation in Docker container
# Run this on the droplet to verify slicing works

set -e

echo "🔍 Testing PrusaSlicer installation..."
echo ""

# Check if PrusaSlicer binary exists
echo "1️⃣ Checking if PrusaSlicer is installed..."
if docker exec print-with-muri which prusa-slicer > /dev/null 2>&1; then
    echo "✅ PrusaSlicer found at: $(docker exec print-with-muri which prusa-slicer)"
else
    echo "❌ PrusaSlicer not found!"
    exit 1
fi

# Check if CuraEngine wrapper exists
echo ""
echo "2️⃣ Checking CuraEngine wrapper..."
if docker exec print-with-muri test -f /usr/local/bin/CuraEngine; then
    echo "✅ CuraEngine wrapper exists"
    docker exec print-with-muri cat /usr/local/bin/CuraEngine
else
    echo "❌ CuraEngine wrapper not found!"
    exit 1
fi

# Test PrusaSlicer help command
echo ""
echo "3️⃣ Testing PrusaSlicer help..."
if docker exec print-with-muri prusa-slicer --help > /dev/null 2>&1; then
    echo "✅ PrusaSlicer help command works"
else
    echo "❌ PrusaSlicer help command failed!"
    exit 1
fi

# Check temp directory
echo ""
echo "4️⃣ Checking /tmp/slicing directory..."
if docker exec print-with-muri test -d /tmp/slicing; then
    echo "✅ /tmp/slicing exists"
    echo "   Permissions: $(docker exec print-with-muri stat -c '%a %U:%G' /tmp/slicing)"
    echo "   Contents: $(docker exec print-with-muri ls -la /tmp/slicing 2>/dev/null | wc -l) files"
else
    echo "❌ /tmp/slicing does not exist!"
    exit 1
fi

# Create a test STL file
echo ""
echo "5️⃣ Creating test STL file (simple cube)..."
docker exec print-with-muri bash -c 'cat > /tmp/test-cube.stl << EOF
solid cube
  facet normal 0 0 1
    outer loop
      vertex 0 0 10
      vertex 10 0 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0 0 10
      vertex 10 10 10
      vertex 0 10 10
    endloop
  endfacet
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 10 10 0
      vertex 10 0 0
    endloop
  endfacet
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 0 10 0
      vertex 10 10 0
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 10 0 0
      vertex 10 0 10
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 10 0 10
      vertex 0 0 10
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 0
      vertex 10 10 10
      vertex 10 10 0
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 0
      vertex 0 10 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 10 10
      vertex 0 10 0
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 0 10
      vertex 0 10 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 0 0
      vertex 10 10 0
      vertex 10 10 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 0 0
      vertex 10 10 10
      vertex 10 0 10
    endloop
  endfacet
endsolid cube
EOF'

echo "✅ Test cube created"

# Test actual slicing
echo ""
echo "6️⃣ Testing actual slicing with PrusaSlicer..."
echo "   This may take 10-30 seconds..."

docker exec print-with-muri prusa-slicer \
  --export-gcode \
  --output /tmp/slicing/test-output.gcode \
  --nozzle-diameter 0.4 \
  --layer-height 0.2 \
  --fill-density 25% \
  --temperature 210 \
  --bed-temperature 60 \
  /tmp/test-cube.stl

if docker exec print-with-muri test -f /tmp/slicing/test-output.gcode; then
    GCODE_SIZE=$(docker exec print-with-muri stat -c %s /tmp/slicing/test-output.gcode)
    echo "✅ G-code generated successfully!"
    echo "   File: /tmp/slicing/test-output.gcode"
    echo "   Size: $GCODE_SIZE bytes"

    # Show first few lines
    echo ""
    echo "   First 10 lines of G-code:"
    docker exec print-with-muri head -n 10 /tmp/slicing/test-output.gcode | sed 's/^/     /'
else
    echo "❌ G-code file was not created!"
    exit 1
fi

# Cleanup
echo ""
echo "7️⃣ Cleanup..."
docker exec print-with-muri rm -f /tmp/test-cube.stl /tmp/slicing/test-output.gcode
echo "✅ Test files cleaned up"

echo ""
echo "================================================"
echo "✅ ALL TESTS PASSED!"
echo "================================================"
echo ""
echo "PrusaSlicer is working correctly in the container."
echo "You can now test the full API by uploading a model through the web interface."

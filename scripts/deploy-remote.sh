#!/bin/bash
set -e

# Configuration
DROPLET_IP="${DROPLET_IP:-165.232.35.220}"
DROPLET_USER="${DROPLET_USER:-root}"
APP_NAME="print-with-muri"

echo "🚀 Starting REMOTE deployment to $DROPLET_IP..."
echo "ℹ️  This script uploads your code and builds it ON the server."

# 1. Archive source code
# Note: Using python to create a consistent zip if available, or tar
echo "📦 Compressing source code..."
# Exclude heavy/unnecessary folders
tar -czf /tmp/$APP_NAME-source.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.swc' \
    --exclude='coverage' \
    --exclude='.DS_Store' \
    .

# 2. Upload source and env
echo "📤 Uploading source code..."
scp /tmp/$APP_NAME-source.tar.gz $DROPLET_USER@$DROPLET_IP:/tmp/

echo "📄 Uploading environment variables for build..."
if [ -f .env.production ]; then
    scp .env.production $DROPLET_USER@$DROPLET_IP:/tmp/.env.build
elif [ -f .env.local ]; then
    scp .env.local $DROPLET_USER@$DROPLET_IP:/tmp/.env.build
else
    echo "⚠️  No .env file found! Build might fail."
fi

# 3. Upload test script just in case
if [ -f scripts/test-slicer.sh ]; then
    scp scripts/test-slicer.sh $DROPLET_USER@$DROPLET_IP:/tmp/
fi

# 4. Execute remote build commands
echo "🔧 Connecting to server to build and deploy..."
ssh $DROPLET_USER@$DROPLET_IP << 'ENDSSH'
    set -e
    
    PROJECT_DIR="/opt/print-with-muri-build"
    APP_DIR="/opt/print-with-muri"
    
    echo "📂 Preparing build directory..."
    rm -rf $PROJECT_DIR
    mkdir -p $PROJECT_DIR
    
    echo "wx Extracting source code..."
    tar -xzf /tmp/print-with-muri-source.tar.gz -C $PROJECT_DIR
    
    cd $PROJECT_DIR
    
    # Load env vars to pass as build args
    # We need to explicitly export them for docker build to pick them up via $VAR syntax
    if [ -f /tmp/.env.build ]; then
        echo "fv Loading build environment variables..."
        export $(grep -v '^#' /tmp/.env.build | xargs)
    fi
    
    echo "🏗  Building Docker image (this may take 2-5 minutes)..."
    # Ensure swap space exists if low memory (optional check)
    
    docker build \
      --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
      --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
      --build-arg NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL \
      -t print-with-muri:latest .
      
    echo "🛑 Stopping old container..."
    docker stop print-with-muri || true
    docker rm print-with-muri || true
    
    echo "🚀 Starting new container..."
    # Ensure runtime env file is in place
    mkdir -p $APP_DIR
    if [ -f /tmp/.env.build ]; then
        mv /tmp/.env.build $APP_DIR/.env
    fi
    
    docker run -d \
      --name print-with-muri \
      --restart unless-stopped \
      -p 3000:3000 \
      --env-file $APP_DIR/.env \
      -v $APP_DIR/config:/app/config:ro \
      print-with-muri:latest
      
    echo "🧹 Cleaning up..."
    rm /tmp/print-with-muri-source.tar.gz
    rm -rf $PROJECT_DIR
    
    echo "✅ Deployed successfully!"
ENDSSH

# Cleanup local
rm /tmp/$APP_NAME-source.tar.gz

echo "🎉 Deployment finished! Visit http://printwithmuri.com (or $DROPLET_IP)"

#!/bin/bash
# Deployment script for Print with Muri on DigitalOcean

set -e

# Configuration
DROPLET_IP="${DROPLET_IP:-your-droplet-ip}"
DROPLET_USER="${DROPLET_USER:-root}"
APP_NAME="print-with-muri"

echo "🚀 Starting deployment to $DROPLET_IP..."

# Load environment variables
if [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
elif [ -f .env.local ]; then
  echo "⚠️ .env.production not found, using .env.local for build args"
  export $(grep -v '^#' .env.local | xargs)
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -t $APP_NAME:latest .

# Save Docker image to tar
echo "💾 Saving Docker image..."
docker save $APP_NAME:latest > /tmp/$APP_NAME.tar

# Copy image to droplet
echo "📤 Uploading image to droplet..."
scp /tmp/$APP_NAME.tar $DROPLET_USER@$DROPLET_IP:/tmp/

# Copy environment file
echo "📄 Uploading environment variables..."
scp .env.production $DROPLET_USER@$DROPLET_IP:/opt/$APP_NAME/.env

# Deploy on droplet
echo "🔧 Deploying on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << 'ENDSSH'
  # Load Docker image
  docker load < /tmp/print-with-muri.tar

  # Stop and remove old container
  docker stop print-with-muri || true
  docker rm print-with-muri || true

  # Run new container
  docker run -d \
    --name print-with-muri \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file /opt/print-with-muri/.env \
    -v /opt/print-with-muri/config:/app/config:ro \
    print-with-muri:latest

  # Cleanup
  rm /tmp/print-with-muri.tar

  # Wait for container to be healthy
  echo "⏳ Waiting for container to start..."
  sleep 5

  # Check container status
  docker ps | grep print-with-muri

  echo "✅ Deployment complete!"
ENDSSH

# Cleanup local tar file
rm /tmp/$APP_NAME.tar

echo "🎉 Deployment finished successfully!"
echo "🌐 Your app should be running at http://$DROPLET_IP:3000"

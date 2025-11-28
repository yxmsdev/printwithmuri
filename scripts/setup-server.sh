#!/bin/bash
# Server setup script for DigitalOcean Droplet
# Run this ONCE on a fresh Ubuntu 22.04 droplet

set -e

echo "🔧 Setting up server for Print with Muri..."

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "🐙 Installing Docker Compose..."
apt-get install -y docker-compose

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw --force enable

# Install Nginx
echo "🌐 Installing Nginx..."
apt-get install -y nginx

# Create app directory
echo "📁 Creating app directory..."
mkdir -p /opt/print-with-muri/config

# Create systemd service for Docker container (optional)
cat > /etc/systemd/system/print-with-muri.service << 'EOF'
[Unit]
Description=Print with Muri Docker Container
Requires=docker.service
After=docker.service

[Service]
Type=forking
Restart=always
ExecStart=/usr/bin/docker start -a print-with-muri
ExecStop=/usr/bin/docker stop -t 10 print-with-muri

[Install]
WantedBy=multi-user.target
EOF

# Enable service (will start after first deployment)
# systemctl enable print-with-muri.service

echo "✅ Server setup complete!"
echo "📝 Next steps:"
echo "  1. Copy your .env.production file to /opt/print-with-muri/.env"
echo "  2. Configure Nginx (see scripts/nginx.conf)"
echo "  3. Run deployment script from your local machine"
echo "  4. Setup SSL with certbot: sudo certbot --nginx -d yourdomain.com"

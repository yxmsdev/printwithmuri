#!/bin/bash
DROPLET_IP="${DROPLET_IP:-165.232.35.220}"
DROPLET_USER="${DROPLET_USER:-root}"

echo "🚀 Force-Updating Nginx configuration on $DROPLET_IP..."

# 1. Upload to /tmp first
echo "📤 Uploading config to temp location..."
scp nginx-printwithmuri.conf $DROPLET_USER@$DROPLET_IP:/tmp/printwithmuri.conf

# 2. Move to correct location and RESTART
echo "🔄 Moving file and RESTARTING Nginx..."
ssh $DROPLET_USER@$DROPLET_IP << 'ENDSSH'
    echo "📋 Copying config to /etc/nginx/sites-available/..."
    cp /tmp/printwithmuri.conf /etc/nginx/sites-available/printwithmuri
    
    echo "🔗 Ensuring symlink exists..."
    ln -sf /etc/nginx/sites-available/printwithmuri /etc/nginx/sites-enabled/printwithmuri
    
    echo "🧪 Testing configuration..."
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Config valid. Restarting service..."
        systemctl restart nginx
        echo "🎉 Nginx restarted successfully!"
    else
        echo "❌ Configuration failed validation:"
        nginx -t
        exit 1
    fi
    
    # Cleanup
    rm /tmp/printwithmuri.conf
ENDSSH

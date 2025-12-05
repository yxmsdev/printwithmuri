#!/bin/bash
DROPLET_IP="${DROPLET_IP:-165.232.35.220}"
DROPLET_USER="${DROPLET_USER:-root}"

echo "🔍 Reading Nginx configuration from $DROPLET_IP..."

ssh $DROPLET_USER@$DROPLET_IP "cat /etc/nginx/sites-enabled/printwithmuri"

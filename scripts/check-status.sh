#!/bin/bash
DROPLET_IP="${DROPLET_IP:-165.232.35.220}"
DROPLET_USER="${DROPLET_USER:-root}"

echo "🔍 Checking server status on $DROPLET_IP..."

ssh $DROPLET_USER@$DROPLET_IP << 'ENDSSH'
    echo "--- Docker Containers ---"
    docker ps -a | grep print-with-muri
    
    echo -e "\n--- App Logs (Last 50 lines) ---"
    docker logs --tail 50 print-with-muri

    echo -e "\n--- Nginx Error Logs (Last 20 lines) ---"
    tail -n 20 /var/log/nginx/error.log
ENDSSH

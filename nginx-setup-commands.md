# Nginx Setup Commands

Run these commands in your droplet console:

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/print-with-muri << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name 165.232.35.220;

    client_max_body_size 50M;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/print-with-muri-access.log;
    error_log /var/log/nginx/print-with-muri-error.log;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/print-with-muri /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

# Verify container is running
docker ps | grep print-with-muri

# Check app is responding
curl http://localhost:3000
```

After running these commands, your app will be accessible at: **http://165.232.35.220**

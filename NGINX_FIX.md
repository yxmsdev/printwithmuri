# Nginx Fix Commands

## Step 1: Edit the nginx config

Run this command:
```
nano /etc/nginx/sites-available/printwithmuri
```

Delete all content (press Ctrl+K repeatedly), then paste this config:

```
server {
    listen 80;
    listen [::]:80;
    server_name printwithmuri.com www.printwithmuri.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name printwithmuri.com www.printwithmuri.com;
    client_max_body_size 100M;

    ssl_certificate /etc/letsencrypt/live/printwithmuri.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/printwithmuri.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save with Ctrl+O, Enter, then exit with Ctrl+X.

## Step 2: Copy to sites-enabled
```
cp /etc/nginx/sites-available/printwithmuri /etc/nginx/sites-enabled/printwithmuri
```

## Step 3: Test and reload nginx
```
nginx -t && systemctl reload nginx
```

## Step 4: Check if Docker container is running
```
docker ps
```

## Step 5: If container is not running, start it
```
docker run -d --name print-with-muri --restart unless-stopped -p 3000:3000 --env-file /opt/print-with-muri/.env print-with-muri
```

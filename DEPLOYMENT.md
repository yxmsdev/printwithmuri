# Deployment Guide - Print with Muri

This guide covers deploying Print with Muri to a DigitalOcean Droplet with server-side 3D model slicing using CuraEngine.

## Prerequisites

- DigitalOcean account (or any VPS provider)
- Domain name (optional, but recommended)
- Local machine with Docker installed
- SSH access to your droplet

## Server Requirements

- **Minimum**: 1 CPU, 2GB RAM, 25GB SSD ($12/month)
- **Recommended**: 2 CPUs, 4GB RAM, 50GB SSD ($24/month)
- **OS**: Ubuntu 22.04 LTS
- **Region**: Choose closest to Nigeria (Frankfurt or London)

---

## Step 1: Create DigitalOcean Droplet

1. Go to DigitalOcean → Create → Droplets
2. Choose **Ubuntu 22.04 LTS**
3. Select **Basic** plan ($12-24/month)
4. Add your **SSH key**
5. Choose **Frankfurt** or **London** datacenter
6. Create droplet and note the IP address

---

## Step 2: Setup Server

SSH into your droplet:

```bash
ssh root@165.232.35.220
```

Run the setup script:

```bash
# Download setup script
wget https://raw.githubusercontent.com/yxmsdev/print-with-muri/main/scripts/setup-server.sh

# Make executable
chmod +x setup-server.sh

# Run setup
./setup-server.sh
```

This will install:
- Docker & Docker Compose
- Nginx
- UFW firewall
- Create necessary directories

---

## Step 3: Configure Environment Variables

On your **local machine**, create `.env.production`:

```bash
# Copy example
cp .env.example .env.production

# Edit with production values
nano .env.production
```

Required variables:
```env
NODE_ENV=production
NEXT_PUBLIC_URL=https://yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment (Paystack)
PAYSTACK_SECRET_KEY=your-secret-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-public-key

# Email (Resend)
RESEND_API_KEY=your-resend-key

# Slicer Configuration
CURAENGINE_PATH=/usr/local/bin/CuraEngine
SLICER_TIMEOUT=60000
SLICER_TEMP_DIR=/tmp/slicing
```

Upload to server:
```bash
scp .env.production root@your-droplet-ip:/opt/print-with-muri/.env
```

---

## Step 4: Deploy Application

On your **local machine**:

```bash
# Set droplet IP
export DROPLET_IP=your-droplet-ip

# Run deployment script
./scripts/deploy.sh
```

This will:
1. Build Docker image locally
2. Upload to droplet
3. Run container with CuraEngine

---

## Step 5: Configure Nginx

On the **droplet**:

```bash
# Copy Nginx config
nano /etc/nginx/sites-available/print-with-muri
```

Paste the content from `scripts/nginx.conf` and update `yourdomain.com`.

Enable the site:
```bash
ln -s /etc/nginx/sites-available/print-with-muri /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 6: Setup SSL (Optional but Recommended)

Install Certbot:
```bash
apt-get install -y certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS.

---

## Step 7: Verify Deployment

Check if the container is running:
```bash
docker ps | grep print-with-muri
```

Check logs:
```bash
docker logs print-with-muri
```

Test the application:
```bash
curl http://localhost:3000
```

---

## Maintenance

### View Logs
```bash
# Application logs
docker logs -f print-with-muri

# Nginx access logs
tail -f /var/log/nginx/print-with-muri-access.log

# Nginx error logs
tail -f /var/log/nginx/print-with-muri-error.log
```

### Restart Application
```bash
docker restart print-with-muri
```

### Update Application
On your local machine:
```bash
# Pull latest code
git pull

# Redeploy
export DROPLET_IP=your-droplet-ip
./scripts/deploy.sh
```

### Clean Up Old G-code Files
The application automatically cleans files older than 24 hours. To manually clean:
```bash
docker exec print-with-muri find /tmp/slicing -name "*.gcode" -mtime +1 -delete
```

### Monitor Disk Space
```bash
df -h
docker system df
```

### Backup Data
```bash
# Backup Supabase data (handled by Supabase)
# Backup environment file
scp root@your-droplet-ip:/opt/print-with-muri/.env ./backups/.env.backup
```

---

## Troubleshooting

### Slicing is slow
- Check CPU usage: `top`
- Consider upgrading droplet size
- Typical slicing time: 10-30 seconds

### Out of disk space
```bash
# Remove old Docker images
docker system prune -a

# Check /tmp/slicing directory
du -sh /tmp/slicing
```

### Container won't start
```bash
# Check logs
docker logs print-with-muri

# Verify CuraEngine is installed
docker exec print-with-muri /usr/local/bin/CuraEngine help
```

### Nginx errors
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

---

## Cost Estimate

| Service | Cost |
|---------|------|
| DigitalOcean Droplet (2GB) | $12/month |
| Domain name | $12/year |
| SSL Certificate (Let's Encrypt) | Free |
| **Total** | **~$13/month** |

Compare to Cloud Slicer API costs (would be variable based on usage).

---

## Security Checklist

- [x] UFW firewall enabled
- [x] SSH key authentication
- [x] Nginx configured
- [ ] SSL certificate installed
- [ ] Regular backups configured
- [ ] Monitoring setup (optional: UptimeRobot, etc.)
- [ ] Disable root login (optional)
- [ ] Setup fail2ban (optional)

---

## Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Use CDN** for static assets (Cloudflare free tier)
3. **Database optimization** in Supabase
4. **Monitor slicing times** and upgrade if consistently slow
5. **Cache G-code files** (already implemented - 24h TTL)

---

## Scaling

If you need to handle more concurrent slicing requests:

1. **Vertical scaling**: Upgrade droplet size
2. **Horizontal scaling**: Multiple droplets with load balancer
3. **Dedicated slicing server**: Separate droplet just for slicing
4. **Queue system**: Add Redis + BullMQ for job queue

---

## Support

For issues:
1. Check logs first
2. Review this documentation
3. Check GitHub issues
4. Contact support

---

**You're all set! Your 3D printing platform is now live with server-side slicing!** 🎉

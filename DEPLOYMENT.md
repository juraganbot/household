# Deployment Guide - Easypanel

## Prerequisites
- GitHub account
- Easypanel account
- Git installed locally

## Step 1: Initialize Git Repository

```bash
cd "d:/BOT/HOUSHOLD BARU/netflix"
git init
git add .
git commit -m "Initial commit: Waroengku Email Search System"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `waroengku-email-search`)
3. Don't initialize with README (we already have files)

## Step 3: Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/waroengku-email-search.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy on Easypanel

### Method 1: Using Easypanel UI

1. **Login to Easypanel**
   - Go to your Easypanel dashboard

2. **Create New Service**
   - Click "Create Service"
   - Select "GitHub"

3. **Connect Repository**
   - Authorize Easypanel to access your GitHub
   - Select your repository: `waroengku-email-search`
   - Branch: `main`

4. **Configure Build**
   - Build Method: `Dockerfile`
   - Dockerfile Path: `./Dockerfile`
   - Port: `3000`

5. **Environment Variables** (Optional)
   ```
   NODE_ENV=production
   PORT=3000
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Method 2: Using Docker Compose (If Easypanel supports it)

1. Upload `docker-compose.yml`
2. Easypanel will auto-detect and deploy

## Step 5: Configure Domain (Optional)

1. In Easypanel dashboard
2. Go to your service settings
3. Add custom domain or use Easypanel subdomain
4. Configure SSL (usually automatic)

## Step 6: Persistent Data

Ensure the `/app/data` directory is mounted as a volume:
- In Easypanel: Add volume mount
- Source: Host path or volume
- Destination: `/app/data`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Application port |
| `HOSTNAME` | `0.0.0.0` | Bind address |

## Post-Deployment

### 1. Access Admin Dashboard
```
https://your-domain.com/admin
Master Key: WAROENGKU_ADMIN_2025
```

### 2. Add Protected Emails
- Login to admin dashboard
- Click "+ Add Protected Email"
- Enter email and optional custom key
- Share access key with authorized users

### 3. Test Email Search
- Go to homepage
- Enter email address
- If protected, enter access key
- Search emails

## Updating the Application

```bash
# Make changes locally
git add .
git commit -m "Update: description of changes"
git push origin main
```

Easypanel will automatically rebuild and redeploy.

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Ensure all dependencies in package.json
- Check build logs in Easypanel

### Database Not Persisting
- Verify volume mount: `/app/data`
- Check file permissions
- Ensure directory exists

### Port Issues
- Default port: 3000
- Easypanel usually handles port mapping
- Check service logs

### API Routes Not Working
- Ensure Next.js API routes are in `/app/api`
- Check server logs
- Verify standalone build

## Monitoring

### Health Check
```bash
curl https://your-domain.com/
```

### Logs
- View in Easypanel dashboard
- Real-time logs available
- Download logs for debugging

## Backup

### Database Backup
```bash
# Download data/database.json from server
# Store securely
```

### Automated Backup (Recommended)
- Setup cron job to backup `/app/data/database.json`
- Store in external storage (S3, etc.)

## Security

1. **Change Master Key**
   - Edit `ADMIN_MASTER_KEY` in code
   - Rebuild and redeploy

2. **HTTPS**
   - Easypanel provides automatic SSL
   - Ensure it's enabled

3. **Environment Variables**
   - Store sensitive data in Easypanel env vars
   - Don't commit `.env` files

## Performance

### Optimization
- Next.js standalone build (already configured)
- Static assets cached
- API routes optimized

### Scaling
- Easypanel handles scaling
- Increase resources if needed
- Monitor CPU/Memory usage

## Support

For issues:
1. Check Easypanel logs
2. Review Docker logs
3. Check GitHub issues
4. Contact: waroengkubusiness@gmail.com

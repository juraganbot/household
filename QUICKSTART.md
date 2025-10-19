# 🚀 Quick Start - Deploy to Easypanel

## 1️⃣ Prepare Repository

### Option A: Using PowerShell Script (Recommended)
```powershell
# Run deployment script
.\deploy.ps1
```

### Option B: Manual Commands
```bash
# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Waroengku Email Search"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/waroengku.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 2️⃣ Deploy on Easypanel

### Step-by-Step:

1. **Login to Easypanel**
   - Go to your Easypanel dashboard
   - URL: https://your-easypanel-domain.com

2. **Create New App**
   ```
   Click: "Create" → "App"
   ```

3. **Connect GitHub**
   ```
   Source: GitHub
   Repository: Select your repo
   Branch: main
   ```

4. **Configure Build**
   ```
   Build Method: Dockerfile
   Dockerfile Path: ./Dockerfile
   Port: 3000
   ```

5. **Add Volume (Important!)**
   ```
   Mount Path: /app/data
   Type: Volume
   Name: waroengku-data
   ```

6. **Deploy**
   ```
   Click: "Deploy"
   Wait for build (2-5 minutes)
   ```

## 3️⃣ Access Your App

### URLs:
- **Homepage**: `https://your-app.easypanel.host/`
- **Admin**: `https://your-app.easypanel.host/admin`

### Admin Login:
```
Master Key: WAROENGKU_ADMIN_2025
```

## 4️⃣ First Steps

1. **Login to Admin**
   - Go to `/admin`
   - Enter master key

2. **Add Protected Email**
   - Click "+ Add Protected Email"
   - Enter email address
   - Optional: Enter custom key
   - Click "Add Email"

3. **Test Search**
   - Go to homepage
   - Enter email address
   - If protected, enter access key
   - Search!

## 🔄 Update Deployment

```bash
# Make changes
git add .
git commit -m "Update: your changes"
git push origin main
```

Easypanel will auto-rebuild and redeploy!

## 📊 Monitor

### View Logs:
```
Easypanel Dashboard → Your App → Logs
```

### Check Health:
```bash
curl https://your-app.easypanel.host/
```

## ⚙️ Configuration

### Change Master Key:
1. Edit `app/admin/page.tsx`
2. Change `ADMIN_MASTER_KEY`
3. Commit and push

### Custom Domain:
1. Easypanel Dashboard → Your App → Domains
2. Add your domain
3. Configure DNS

## 🆘 Troubleshooting

### Build Failed?
- Check Dockerfile syntax
- View build logs in Easypanel
- Ensure all dependencies in package.json

### Database Not Saving?
- Verify volume mount: `/app/data`
- Check Easypanel volume settings

### Can't Access Admin?
- Check URL: `/admin` (not `/admin/`)
- Clear browser cache
- Check console for errors

## 📞 Support

- Email: waroengkubusiness@gmail.com
- Check logs in Easypanel
- Review DEPLOYMENT.md for detailed guide

---

**That's it! Your app is live! 🎉**

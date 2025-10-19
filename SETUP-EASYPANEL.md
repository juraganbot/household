# 📘 Setup Lengkap - GitHub & Easypanel

## ✅ Step 1: Push ke GitHub (SUDAH SELESAI)

Kode sudah di-commit! Sekarang push ke GitHub:

```powershell
# Jalankan command ini satu per satu:
git branch -M main
git push -u origin main
```

Jika diminta login:
- Username: `juraganbot`
- Password: Gunakan **Personal Access Token** (bukan password biasa)

### Cara Buat Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click: **Generate new token (classic)**
3. Name: `Easypanel Deploy`
4. Expiration: `No expiration` atau `90 days`
5. Select scopes: ✅ **repo** (full control)
6. Click: **Generate token**
7. **COPY TOKEN** (hanya muncul sekali!)
8. Paste sebagai password saat git push

---

## 🚀 Step 2: Setup di Easypanel

### A. Login ke Easypanel

1. Buka browser
2. Go to: **https://your-easypanel-domain.com**
3. Login dengan credentials Anda

### B. Create New App

```
1. Click: "Apps" di sidebar
2. Click: "+ Create" button (pojok kanan atas)
3. Pilih: "App"
```

### C. Configure Source

```
Tab: Source
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Source Type: GitHub
   
2. Click: "Connect GitHub"
   - Authorize Easypanel
   - Allow access to repositories
   
3. Repository: juraganbot/household
   
4. Branch: main
   
5. Auto Deploy: ✅ ON (deploy otomatis saat push)
```

### D. Configure Build

```
Tab: Build
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Build Method: Dockerfile
   
2. Dockerfile Path: ./Dockerfile
   
3. Build Context: . (root directory)
   
4. Build Args: (kosongkan)
```

### E. Configure Domains

```
Tab: Domains
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Click: "+ Add Domain"

2. Pilih salah satu:
   
   Option A - Subdomain Easypanel (Gratis):
   ┌────────────────────────────────────────┐
   │ waroengku.easypanel.host              │
   │ atau                                   │
   │ household.easypanel.host              │
   └────────────────────────────────────────┘
   
   Option B - Custom Domain:
   ┌────────────────────────────────────────┐
   │ yourdomain.com                         │
   │ www.yourdomain.com                     │
   └────────────────────────────────────────┘
   
3. SSL: ✅ Auto (Let's Encrypt)
```

### F. Configure Ports

```
Tab: Networking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Port Mapping:
   ┌────────────────────────────────────────┐
   │ Container Port: 3000                   │
   │ Public Port: 80 (HTTP)                 │
   │ Public Port: 443 (HTTPS)               │
   └────────────────────────────────────────┘
   
2. Protocol: HTTP
```

### G. Configure Volumes (PENTING!)

```
Tab: Volumes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Click: "+ Add Volume"

2. Volume Configuration:
   ┌────────────────────────────────────────┐
   │ Name: waroengku-data                   │
   │ Mount Path: /app/data                  │
   │ Type: Volume (persistent)              │
   └────────────────────────────────────────┘
   
⚠️ INI PENTING! Tanpa volume, database akan hilang saat restart!
```

### H. Configure Environment Variables (Optional)

```
Tab: Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tambahkan jika perlu:

NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

### I. Configure Resources (Optional)

```
Tab: Resources
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommended:
┌────────────────────────────────────────┐
│ CPU: 0.5 - 1 vCPU                      │
│ Memory: 512MB - 1GB                    │
│ Replicas: 1                            │
└────────────────────────────────────────┘
```

### J. Deploy!

```
1. Click: "Deploy" button (pojok kanan atas)

2. Wait for build:
   ┌────────────────────────────────────────┐
   │ Building... (2-5 minutes)              │
   │ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50%              │
   └────────────────────────────────────────┘

3. Build logs akan muncul:
   - Downloading dependencies...
   - Building Next.js...
   - Creating Docker image...
   - Deploying...
   
4. Status berubah: ✅ Running
```

---

## 🎉 Step 3: Access Your App!

### URLs:

```
Homepage:
https://waroengku.easypanel.host/
atau
https://yourdomain.com/

Admin Dashboard:
https://waroengku.easypanel.host/admin
atau
https://yourdomain.com/admin
```

### Login Admin:

```
Master Key: WAROENGKU_ADMIN_2025
```

---

## 🧪 Step 4: Test Aplikasi

### A. Test Homepage

1. Buka: `https://your-domain.com/`
2. Lihat form email search
3. Coba enter email (belum protected)
4. Click search

### B. Test Admin Dashboard

1. Buka: `https://your-domain.com/admin`
2. Enter master key: `WAROENGKU_ADMIN_2025`
3. Click "Access Dashboard"
4. Dashboard terbuka ✅

### C. Add Protected Email

1. Di admin dashboard
2. Click: "+ Add Protected Email"
3. Enter email: `test@example.com`
4. Custom key (optional): `TEST-KEY-123`
5. Click: "Add Email"
6. Email muncul di list ✅

### D. Test Protection

1. Go to homepage
2. Enter email: `test@example.com`
3. Click search
4. Key input muncul ✅
5. Enter key: `TEST-KEY-123`
6. Click search lagi
7. Access granted ✅

---

## 🔄 Step 5: Update Aplikasi

Setiap kali ada perubahan:

```powershell
# 1. Edit files...

# 2. Commit changes
git add .
git commit -m "Update: deskripsi perubahan"

# 3. Push to GitHub
git push origin main

# 4. Easypanel auto-deploy! 🚀
# Tunggu 2-5 menit, app akan update otomatis
```

---

## 📊 Step 6: Monitor Aplikasi

### View Logs:

```
Easypanel Dashboard:
1. Go to: Apps → household
2. Tab: Logs
3. Real-time logs muncul
```

### Check Status:

```
Easypanel Dashboard:
1. Go to: Apps → household
2. Status: ✅ Running
3. CPU/Memory usage visible
```

### View Metrics:

```
Easypanel Dashboard:
1. Go to: Apps → household
2. Tab: Metrics
3. Lihat CPU, Memory, Network usage
```

---

## 🛠️ Troubleshooting

### Build Failed?

```
1. Check build logs di Easypanel
2. Common issues:
   - Missing dependencies
   - Syntax errors
   - Port conflicts
   
3. Fix locally, commit, push lagi
```

### Can't Access App?

```
1. Check status: Running?
2. Check domain configuration
3. Check port mapping (3000)
4. Check SSL certificate
5. Try: https:// (not http://)
```

### Database Not Saving?

```
1. Check volume mount: /app/data
2. Restart app
3. Check volume permissions
4. View logs for errors
```

### Admin Login Failed?

```
1. Check master key: WAROENGKU_ADMIN_2025
2. Clear browser cache
3. Try incognito mode
4. Check console for errors
```

---

## 📱 Custom Domain Setup

Jika pakai domain sendiri:

### A. Di Easypanel:

```
1. Domains tab
2. Add: yourdomain.com
3. Copy DNS records yang diberikan
```

### B. Di Domain Provider (Namecheap, GoDaddy, etc):

```
1. Go to DNS settings
2. Add A Record:
   ┌────────────────────────────────────────┐
   │ Type: A                                │
   │ Host: @                                │
   │ Value: [IP dari Easypanel]            │
   │ TTL: Automatic                         │
   └────────────────────────────────────────┘
   
3. Add CNAME (optional):
   ┌────────────────────────────────────────┐
   │ Type: CNAME                            │
   │ Host: www                              │
   │ Value: yourdomain.com                  │
   │ TTL: Automatic                         │
   └────────────────────────────────────────┘
   
4. Wait 5-60 minutes for DNS propagation
```

---

## 🔐 Security Checklist

- ✅ Change master key di production
- ✅ Use HTTPS (Easypanel provides)
- ✅ Regular backups of database.json
- ✅ Monitor access logs
- ✅ Keep dependencies updated

---

## 📞 Need Help?

### Easypanel Support:
- Docs: https://easypanel.io/docs
- Discord: https://discord.gg/easypanel

### App Support:
- Email: waroengkubusiness@gmail.com
- Check logs in Easypanel
- Review DEPLOYMENT.md

---

## ✅ Checklist Deployment

```
☐ Push code to GitHub
☐ Create app di Easypanel
☐ Connect GitHub repo
☐ Configure Dockerfile build
☐ Add volume mount (/app/data)
☐ Configure domain
☐ Deploy app
☐ Test homepage
☐ Test admin login
☐ Add test email
☐ Test protection
☐ Monitor logs
☐ Setup custom domain (optional)
☐ Configure backups
```

---

**Selamat! Aplikasi Anda sudah live! 🎉**

Access di: `https://your-domain.com/`

# 🔐 Setup HTTPS untuk Development

## 📋 Overview

Web Push Notifications memerlukan HTTPS untuk berfungsi (kecuali di localhost HTTP). Untuk development yang lebih realistis dan testing di network devices, kita perlu setup HTTPS dengan self-signed certificates.

---

## 🚀 Quick Start

### Step 1: Setup SSL Certificates

```bash
npm run setup:https
```

**Atau manual:**
```bash
./setup-https.sh
```

**Apa yang dilakukan script ini:**
1. Install `mkcert` (jika belum ada)
2. Install local Certificate Authority
3. Generate SSL certificates untuk localhost
4. Simpan di folder `certs/`

**Expected output:**
```
🔐 Setting up HTTPS for development...
✅ mkcert is installed
🔑 Installing local Certificate Authority...
📜 Generating SSL certificates...
✅ SSL certificates generated!
```

---

### Step 2: Start HTTPS Development Server

```bash
npm run dev:https
```

**Expected output:**
```
🔐 HTTPS Development Server

✅ Ready on https://localhost:3000
✅ Network: https://192.168.x.x:3000

💡 Press Ctrl+C to stop
```

---

### Step 3: Open Browser

```
https://localhost:3000
```

**✅ Certificate akan trusted otomatis!** (karena menggunakan mkcert)

---

## 📁 File Structure

```
nova-reminders/
├── certs/                      # SSL certificates (auto-generated)
│   ├── localhost.pem           # Certificate
│   └── localhost-key.pem       # Private key
├── server-https.js             # HTTPS development server
├── setup-https.sh              # Setup script
└── package.json                # Updated with new scripts
```

---

## 🛠️ Manual Setup (Jika Script Gagal)

### Option 1: Using mkcert (Recommended)

#### Install mkcert

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Arch Linux
sudo pacman -S mkcert

# Fedora
sudo dnf install mkcert
```

**macOS:**
```bash
brew install mkcert
brew install nss # for Firefox
```

**Windows:**
```bash
choco install mkcert
```

#### Generate Certificates

```bash
# Install local CA
mkcert -install

# Create certs directory
mkdir -p certs
cd certs

# Generate certificates
mkcert localhost 127.0.0.1 ::1 192.168.*.* *.local

# Rename files
mv localhost+*.pem localhost.pem
mv localhost+*-key.pem localhost-key.pem

cd ..
```

---

### Option 2: Using OpenSSL (Alternative)

```bash
# Create certs directory
mkdir -p certs
cd certs

# Generate private key
openssl genrsa -out localhost-key.pem 2048

# Generate certificate
openssl req -new -x509 -key localhost-key.pem -out localhost.pem -days 365 \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Nova/CN=localhost"

cd ..
```

**⚠️ Note:** Dengan OpenSSL, browser akan menampilkan warning "Not Secure". Anda perlu click "Advanced" → "Proceed to localhost".

---

## 🧪 Testing

### Test 1: Verify HTTPS Server

```bash
# Start HTTPS server
npm run dev:https

# In another terminal, test with curl
curl -k https://localhost:3000
```

**Expected:** HTML response dari Next.js

---

### Test 2: Test Push Notification

1. **Open browser:** `https://localhost:3000`
2. **Login** ke aplikasi
3. **Izinkan notifikasi** saat modal muncul
4. **Check console** untuk logs
5. **Verify subscription:**
   ```bash
   ./test-push-manual.sh subscriptions
   ```

---

### Test 3: Test dari Device Lain

1. **Get your local IP:**
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Or
   ip addr show
   ```

2. **Open dari device lain:**
   ```
   https://192.168.x.x:3000
   ```

3. **Accept certificate warning** (jika ada)

4. **Test push notification**

---

## 🔍 Troubleshooting

### Issue 1: mkcert not found

**Solution:**
```bash
# Install manually
# Linux
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# macOS
brew install mkcert

# Windows
choco install mkcert
```

---

### Issue 2: Certificate not trusted

**Solution:**
```bash
# Reinstall local CA
mkcert -install

# Check if CA is installed
mkcert -CAROOT
```

---

### Issue 3: Port 3000 already in use

**Solution:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
# Edit server-https.js, change port to 3001
```

---

### Issue 4: "Cannot find module 'next'"

**Solution:**
```bash
# Install dependencies
npm install

# Or
bun install
```

---

### Issue 5: Browser still shows "Not Secure"

**Possible causes:**
1. Certificate not generated correctly
2. Local CA not installed
3. Browser cache

**Solution:**
```bash
# Regenerate certificates
rm -rf certs
npm run setup:https

# Clear browser cache
# Chrome: Settings > Privacy > Clear browsing data

# Restart browser
```

---

## 📊 Comparison: HTTP vs HTTPS

| Feature | HTTP (localhost) | HTTPS (localhost) |
|---------|------------------|-------------------|
| Push Notifications | ✅ Works | ✅ Works |
| Service Worker | ✅ Works | ✅ Works |
| Geolocation API | ⚠️ Limited | ✅ Full access |
| Camera/Microphone | ❌ Blocked | ✅ Works |
| Clipboard API | ⚠️ Limited | ✅ Full access |
| Network Testing | ❌ Can't test from other devices | ✅ Can test from any device |
| Production-like | ❌ Different from prod | ✅ Same as production |

---

## 🎯 Why HTTPS for Development?

### 1. **Realistic Testing**
- Test exactly like production
- No surprises when deploying

### 2. **Network Testing**
- Test dari mobile devices
- Test dari tablet
- Test dari komputer lain di network

### 3. **Full API Access**
- Geolocation
- Camera/Microphone
- Clipboard
- Payment APIs
- dll.

### 4. **Security Testing**
- Test CORS policies
- Test secure cookies
- Test CSP headers

---

## 🔧 Advanced Configuration

### Custom Domain

Edit `setup-https.sh`:
```bash
# Add custom domain
mkcert localhost 127.0.0.1 ::1 192.168.*.* *.local myapp.local
```

Edit `/etc/hosts`:
```
127.0.0.1 myapp.local
```

Access via: `https://myapp.local:3000`

---

### Different Port

Edit `server-https.js`:
```javascript
const port = 3001; // Change to your preferred port
```

---

### Environment-specific

Create `.env.local`:
```env
HTTPS_PORT=3000
HTTPS_HOST=localhost
```

Update `server-https.js` to read from env.

---

## 📝 Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| Setup HTTPS | `npm run setup:https` | Generate SSL certificates |
| Dev (HTTP) | `npm run dev` | Start HTTP server (port 3000) |
| Dev (HTTPS) | `npm run dev:https` | Start HTTPS server (port 3000) |

---

## 🔒 Security Notes

### Development Certificates

- ✅ **Safe for development** - Only trusted on your machine
- ✅ **Not for production** - Use proper SSL from Let's Encrypt, Cloudflare, etc.
- ✅ **Auto-expires** - Certificates expire after 1 year
- ✅ **Local only** - CA is only installed on your machine

### Best Practices

1. **Never commit certificates** - Already in `.gitignore`
2. **Regenerate periodically** - Run `npm run setup:https` every few months
3. **Use production SSL in production** - Don't use self-signed certs
4. **Keep mkcert updated** - Update regularly for security patches

---

## 🚀 Production Deployment

For production, use proper SSL certificates:

### Option 1: Vercel (Automatic)
- Deploy to Vercel
- SSL automatically configured
- Free SSL certificate

### Option 2: Let's Encrypt (Manual)
```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com
```

### Option 3: Cloudflare (Proxy)
- Add domain to Cloudflare
- Enable "Full (strict)" SSL mode
- Free SSL certificate

---

## 📚 Resources

- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker over HTTPS](https://web.dev/service-worker-lifecycle/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## ✅ Checklist

Setup HTTPS:
- [ ] Run `npm run setup:https`
- [ ] Certificates generated in `certs/` folder
- [ ] Start server with `npm run dev:https`
- [ ] Open `https://localhost:3000`
- [ ] No certificate warnings
- [ ] Push notifications work
- [ ] Test from mobile device (optional)

---

**Status:** ✅ HTTPS Development Ready!

**Next Steps:**
1. Start HTTPS server: `npm run dev:https`
2. Test push notifications: `https://localhost:3000`
3. Verify subscription: `./test-push-manual.sh subscriptions`

---

**Created by:** Kiro AI Assistant  
**Date:** 30 April 2026

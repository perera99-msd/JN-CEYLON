# 🚀 Deployment Guide — Render

> JN Ceylon ERP is deployed as a **single Render Web Service** — both the Express API and the React frontend are served from the same process.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Render Setup](#-render-setup)
- [Environment Variables](#-environment-variables)
- [Health Checks](#-health-checks)
- [Auto-Deploy from GitHub](#-auto-deploy-from-github)
- [Release Checklist](#-release-checklist)
- [Troubleshooting](#-troubleshooting)

---

## 🌐 Overview

| Item | Value |
|------|-------|
| **Platform** | [Render](https://render.com) |
| **Service Type** | Web Service (Node.js) |
| **Live URL** | https://jn-ceylon.onrender.com/ |
| **Build Command** | `npm ci && npm ci --prefix client && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | 20+ |
| **Database** | MongoDB Atlas (external) |

In production, Express serves the React build from `client/dist` as static files. All `/api/*` routes are handled by Express, and all other routes fall through to `index.html` for client-side routing.

---

## ⚙️ Render Setup

### 1️⃣ Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**
2. Connect your GitHub repository: `perera99-msd/JN-CEYLON`
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `jn-ceylon` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm ci --prefix client && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free (or paid for better uptime) |

### 2️⃣ Add Environment Variables

Navigate to **Environment** tab and add all required variables (see table below).

### 3️⃣ Configure Health Check

Navigate to **Settings** → **Health Check Path**: `/api/health`

---

## 🔐 Environment Variables

Configure these in Render's **Environment** tab. Never commit these values to Git.

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | `production` | Must be `production` |
| `PORT` | ❌ | `10000` | Render assigns this automatically |
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/jn_ceylon_erp` | MongoDB Atlas connection string |
| `SESSION_SECRET` | ✅ | `a1b2c3d4e5...` (32+ chars) | Random secret for session encryption |
| `CORS_ORIGINS` | ✅ | `https://jn-ceylon.onrender.com` | Your Render URL (exact match) |
| `COOKIE_SAME_SITE` | ✅ | `lax` | Use `lax` (frontend & backend same origin) |
| `ADMIN_USERNAME` | ✅ | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | ✅ | `StrongP@ssw0rd!` (12+ chars) | Initial admin password |
| `ADMIN_FULL_NAME` | ❌ | `JN Ceylon Administrator` | Admin display name |

> ⚠️ **Important:** `SESSION_SECRET` must be a long, random string. Generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 🏥 Health Checks

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /api/health` | Process liveness | `200 { "status": "ok" }` |
| `GET /api/ready` | Database readiness | `200 { "status": "ready", "database": "connected" }` |

Configure `/api/health` as the **Health Check Path** in Render settings. Render uses this to determine if your service is running.

> 💡 **Tip:** A healthy process (`/api/health`) does not guarantee a connected database. Use `/api/ready` for full readiness checks.

---

## 🔄 Auto-Deploy from GitHub

Render automatically deploys when you push to the `main` branch (if auto-deploy is enabled).

### Manual Deploy Trigger

You can also trigger deploys via a **Deploy Hook**:

1. Go to Render Dashboard → Your Service → **Settings**
2. Find **Deploy Hook** → Copy the URL
3. Add it as a GitHub secret: `RENDER_DEPLOY_HOOK_URL`
4. The GitHub Actions deploy workflow triggers this hook on merge to `main`

---

## ✅ Release Checklist

Before deploying a new version:

- [ ] 🔐 `.env` is configured via Render environment (not committed)
- [ ] 🔑 Production secrets differ from all development values
- [ ] 👤 Default admin credentials are changed after first login
- [ ] 🌐 `CORS_ORIGINS` matches the exact Render URL
- [ ] 🔒 `COOKIE_SAME_SITE` is set to `lax`
- [ ] 🗄️ MongoDB Atlas has authentication, network restrictions, and backups enabled
- [ ] ✅ `npm test` passes locally
- [ ] 🔨 `npm run build` passes locally
- [ ] 🏥 `/api/ready` returns HTTP 200 after deploy
- [ ] 📊 Render logs show no errors on startup

---

## 🔧 Troubleshooting

### Service won't start

| Symptom | Cause | Fix |
|---------|-------|-----|
| `CORS_ORIGINS must be configured` | Missing env var | Add `CORS_ORIGINS` in Render environment |
| `SESSION_SECRET must be configured` | Missing env var | Add `SESSION_SECRET` in Render environment |
| `MongoDB Connection Error` | Wrong connection string | Verify `MONGODB_URI` and Atlas network access |
| Port binding error | Wrong port config | Remove `PORT` from env — Render sets it automatically |

### Build failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npm ci` fails | Lock file mismatch | Regenerate `package-lock.json` locally and commit |
| Client build fails | Missing client deps | Ensure build command includes `npm ci --prefix client` |
| Out of memory | Large build | Upgrade Render plan or optimize bundle |

### Common issues

- **Cold starts on free plan** — Render free tier services spin down after inactivity. First request may take 30-60 seconds.
- **Session loss** — If `SESSION_SECRET` changes, all users are logged out. Rotate deliberately.
- **CORS errors** — Ensure `CORS_ORIGINS` exactly matches the browser URL (including `https://`).

---

## 📚 Related Documentation

- [📐 Architecture](ARCHITECTURE.md) — System design and data models
- [🔒 Security](SECURITY.md) — Security policy and practices
- [📖 README](README.md) — Project overview and quick start

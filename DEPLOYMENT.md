# Deployment Guide

## Production prerequisites

- Node.js 20 or newer
- Managed MongoDB or a secured MongoDB replica set
- HTTPS at the application or reverse-proxy layer
- A private production environment for secrets
- Automated MongoDB backups and a tested restore procedure
- A process manager or container restart policy

## Required environment

Start from `.env.example`. Production must provide:

- `NODE_ENV=production`
- `PORT`
- `MONGODB_URI` with authenticated, network-restricted MongoDB
- `SESSION_SECRET` with a long random value
- `CORS_ORIGINS` containing only the exact browser origin(s)
- `COOKIE_SAME_SITE=lax` when the client is served by the same site
- `COOKIE_SAME_SITE=none` only when a separate HTTPS frontend is required
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` with at least 12 characters
- `ADMIN_FULL_NAME`

Never put these values in GitHub, source files, Docker images, or frontend environment variables.

## Build and start

```powershell
npm ci
npm ci --prefix client
npm run build
$env:NODE_ENV = "production"
npm start
```

The production server serves `client/dist`. Build output is generated during deployment and is intentionally ignored by Git.

## Health probes

- Liveness: `GET /api/health`
- Readiness: `GET /api/ready`

Route deployment traffic only after `/api/ready` returns HTTP 200. A healthy process does not guarantee a connected database.

## Reverse proxy requirements

- Terminate TLS and redirect HTTP to HTTPS.
- Forward the original host and protocol.
- Forward `X-Forwarded-For` and `X-Forwarded-Proto`.
- Allow the application port only from the proxy or private network.
- Do not expose MongoDB publicly.
- Set request and response timeouts.
- Rotate `SESSION_SECRET` deliberately because rotation logs users out.

## Release checklist

- [ ] `.env` is supplied by the deployment secret store and is not committed.
- [ ] Production secrets differ from all development values.
- [ ] Default admin bootstrap credentials are changed before first login.
- [ ] HTTPS is active and cookies are marked secure.
- [ ] `CORS_ORIGINS` is exact and does not use `*`.
- [ ] MongoDB authentication, TLS, network restrictions, and backups are enabled.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `/api/ready` returns HTTP 200.
- [ ] A restore test has been completed for the latest backup.
- [ ] Monitoring captures application errors and restart events.

## Important product controls

Before public or multi-user production use, add capability permissions, audit logs, login rate limiting, transactional payment updates, duplicate quotation-conversion protection, and financial reconciliation. These are not replaced by deployment configuration.

# 🔒 Security Policy

> This document outlines the security practices, vulnerability reporting process, and production requirements for JN Ceylon ERP.

---

## 📋 Supported Versions

| Version | Status | Support |
|---------|--------|---------|
| 1.0.x | ✅ Current | Active security updates |

The `main` branch is the supported development line. Deploy only reviewed commits and keep dependencies updated.

---

## 🚨 Reporting a Vulnerability

> ⚠️ **Do NOT open a public issue for security vulnerabilities.**

### How to Report

1. **Contact** the project owner privately via GitHub
2. **Include** the following information:
   - 📝 Short description and severity estimate (Critical / High / Medium / Low)
   - 📁 Affected route, file, or dependency
   - 🔄 Reproduction steps (without real customer data)
   - 💡 Suggested mitigation, if known

### What NOT to Include

- ❌ Passwords, session cookies, or API keys
- ❌ Database credentials or connection strings
- ❌ Personal data or customer information
- ❌ Screenshots containing sensitive data

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledge receipt | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix or mitigation | Based on severity |

---

## 🔐 Secret Handling

### Rules

- 🚫 `.env` files are ignored by Git and must never be committed
- 📝 Use `.env.example` only as a placeholder template — never put real values
- 🔄 Rotate any credential that has appeared in source, logs, screenshots, commits, or chat
- ⚡ If a secret was committed, assume it is **compromised** — rotate first, then clean history
- 🔑 The repository previously contained default bootstrap credentials in older commits — those must never be used

### Secret Rotation

```
1. Generate new credential
2. Update in Render environment variables
3. Verify service restarts successfully
4. Invalidate old credential
5. If committed to Git — perform history rewrite (with team approval)
```

---

## 🛡️ Production Security Baseline

### Required Configuration

| Requirement | Details |
|-------------|---------|
| 🌐 HTTPS | Render provides automatic TLS |
| 🔑 `SESSION_SECRET` | Must be random, 32+ characters |
| 🌍 `CORS_ORIGINS` | Must be an explicit allowlist (no `*`) |
| 🗄️ MongoDB Auth | Must require authentication |
| 🔒 Network Access | MongoDB must use private/restricted network |
| 🏥 Health Probes | Use `/api/ready` for database readiness |
| 💾 Backups | Keep encrypted backups; test restoration regularly |

### Authentication Security

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ Session-based auth with httpOnly cookies
- ✅ Configurable `sameSite` and `secure` cookie flags
- ✅ Admin bootstrap from environment variables only
- ✅ Origin validation on all mutating requests (POST/PUT/PATCH/DELETE)

### Security Checklist (Pre-Deploy)

- [ ] 🔐 All secrets configured via environment variables
- [ ] 🔑 `SESSION_SECRET` is unique and random
- [ ] 🌍 `CORS_ORIGINS` does not contain `*` or `localhost`
- [ ] 👤 Admin password changed from bootstrap value
- [ ] 🗄️ MongoDB Atlas has IP allowlist configured
- [ ] 💾 Database backups are enabled and tested
- [ ] 📦 Dependencies audited (`npm audit`)

---

## 🔮 Planned Security Improvements

The following features are recommended before multi-user production use:

- 🔐 Capability-based permissions (fine-grained access control)
- 📋 Audit logs for financial mutations
- 🚦 Login rate limiting / brute-force protection
- 🔄 Transactional payment updates
- 🛑 Duplicate quotation-conversion protection
- 💰 Financial reconciliation tools

---

## 📚 Related Documentation

- [🚀 Deployment](DEPLOYMENT.md) — Render deployment and environment setup
- [📐 Architecture](ARCHITECTURE.md) — System architecture and security layers
- [🤝 Contributing](CONTRIBUTING.md) — Development setup and guidelines

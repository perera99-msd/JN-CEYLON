# 📜 Changelog

All notable changes to JN Ceylon ERP are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-09-05

### 🚀 Mini-ERP Enhancements & Hardening

#### ⚡ Performance & Efficiency
- **Gzip Response Compression** — Integrated `compression` middleware, cutting JSON response payloads by 60–80% (essential for free-tier latency reduction).
- **MongoDB Compound Indexes** — Added startup indexes on frequently queried fields (`isDeleted`, `status`, `company`, `createdAt`).
- **Dashboard Aggregation Pipelines** — Replaced memory-heavy JS array reducers with database-native MongoDB `$group` aggregation pipelines with `.lean()` queries.
- **Cursor Pagination** — Added `page` and `limit` support to all list endpoints (`/quotations`, `/invoices`, `/payments`, `/companies`) with frontend pagination controls.

#### 🛡️ Security
- **HTTP Security Headers** — Added `helmet` middleware for standard HTTP protection (`X-Content-Type-Options`, `X-Frame-Options`, `X-DNS-Prefetch-Control`).
- **Brute-Force Login Rate Limiting** — Enforced 10 attempts per 15 minutes limit per IP on `/api/auth/login`.
- **API-Wide Rate Limiting** — Added 100 requests per minute general rate limiter across all endpoints.
- **Global Error Handler** — Centralized error middleware concealing internal error stack traces in production.
- **Self-Service Password Change** — `POST /api/auth/change-password` endpoint allowing any authenticated user to securely change their own password.

#### ✨ New ERP Features
- **Audit Trail & Activity Log** — Complete tamper-evident audit logging for user logins, document creations, duplicates, and deletions (`/activity`).
- **Data Export (CSV)** — One-click CSV export for quotations (`/api/quotations/export`), invoices (`/api/invoices/export`), and payments (`/api/payments/export`).
- **Automated Overdue Detection** — Background worker checking due dates every 6 hours and auto-flagging overdue invoices.
- **Quotation Duplication** — One-click quotation cloning with sequential number generation.
- **Global Command Search (Ctrl+K)** — Instant search modal searching across quotations, invoices, companies, and payments with keyboard navigation.
- **6-Month Revenue & Collection Trend** — Visual cash flow trend comparison on the executive dashboard.
- **Skeleton Shimmer Loading** — Responsive skeleton screens with free-tier wake-up feedback.

---

## [1.0.0] — 2026-09-05

### 🎉 Initial Production Release

#### ✨ Added
- **Dashboard** — Real-time KPI metrics (quotation values, invoice totals, pending & paid amounts, recent activity)
- **Quotations** — Full CRUD with auto-numbering, line items, status tracking (Draft → Sent → PO Received → Converted), and invoice conversion
- **Invoices** — Full CRUD with payment tracking, status management (Pending → Partial → Paid → Overdue), and quotation linking
- **Payments** — Record payments against invoices with multiple methods (Bank Transfer, Cheque, Cash, Other)
- **Statements** — Auto-generated statements per company and custom statement editor
- **Companies** — Client company management with addresses, contact details, and custom codes
- **PDF Printing** — Professional A4 document printing for quotations, invoices, and statements
- **Recycle Bin** — Soft-delete with 30-day auto-purge via MongoDB TTL indexes and one-click recovery
- **User Management** — Admin & Normal roles with session-based authentication
- **Settings** — Admin-only panel for user management and sequence configuration
- **Health Checks** — `/api/health` (liveness) and `/api/ready` (database readiness) endpoints
- **API Smoke Tests** — Health and readiness endpoint tests using Node.js test runner
- **Render Deployment** — Single-service deployment with frontend + backend unified
- **GitHub Actions CI/CD** — Automated testing, building, security auditing, and deployment pipelines
- **Comprehensive Documentation** — README, Architecture, Deployment, Security, User Guide, API Reference, Contributing Guide

#### 🔒 Security
- Session-based authentication with bcrypt password hashing
- CORS origin allowlist enforcement
- Origin validation on mutating requests
- Secure cookie configuration (httpOnly, sameSite, secure in production)
- Admin bootstrap from environment variables (no hardcoded credentials)
- Production guards requiring `SESSION_SECRET` and `CORS_ORIGINS`

---

## [Unreleased]

### 🔮 Planned
- Capability-based permissions (fine-grained access control)
- Audit logging for financial mutations
- Login rate limiting
- Transactional payment updates
- Duplicate quotation-conversion protection
- Financial reconciliation tools
- CSV/Excel export functionality
- Email notification system

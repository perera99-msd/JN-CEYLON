# 📜 Changelog

All notable changes to JN Ceylon ERP are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

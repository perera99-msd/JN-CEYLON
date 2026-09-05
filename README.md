<p align="center">
  <img src="client/public/Logo.png" alt="JN Ceylon Logo" width="120" />
</p>

<h1 align="center">🌿 JN Ceylon ERP</h1>

<p align="center">
  <strong>A modern, full-stack Quote-to-Cash ERP system built for Sri Lankan export businesses</strong>
</p>

<p align="center">
  <a href="https://github.com/perera99-msd/JN-CEYLON/actions/workflows/ci.yml">
    <img src="https://github.com/perera99-msd/JN-CEYLON/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://jn-ceylon.onrender.com/">
    <img src="https://img.shields.io/badge/deploy-Render-46E3B7?logo=render&logoColor=white" alt="Deployed on Render" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white" alt="Node.js ≥ 20" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

---

## ✨ What is JN Ceylon ERP?

JN Ceylon ERP is a **lightweight, production-ready ERP system** designed for small-to-medium export businesses. It streamlines the entire **quote-to-cash** lifecycle — from creating quotations to recording final payments — in one unified platform.

> 🌐 **Live Demo:** [jn-ceylon.onrender.com](https://jn-ceylon.onrender.com/)

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time KPIs — quotation values, invoice totals, pending & paid amounts |
| 📝 **Quotations** | Create, edit, send, track PO, and convert to invoices with auto-numbering |
| 🧾 **Invoices** | Full invoice lifecycle with payment tracking and status management |
| 💰 **Payments** | Record payments against invoices with multiple methods (bank, cheque, cash) |
| 📄 **Statements** | Auto-generated and custom statement of accounts per company |
| 🏢 **Companies** | Manage client companies with contact details and custom codes |
| 🖨️ **PDF Printing** | Professional A4 document printing for quotations, invoices & statements |
| 🗑️ **Recycle Bin** | Soft-delete with 30-day auto-purge and one-click recovery |
| 👥 **User Management** | Admin & Normal roles with session-based authentication |
| ⚙️ **Settings** | Admin-only configuration panel for user and sequence management |

---

## 🔄 Business Workflow

```
📝 Quotation  →  🧾 Invoice  →  💰 Payment  →  📄 Statement
   (DRAFT)        (PENDING)      (RECORDED)     (GENERATED)
   (SENT)         (PARTIAL)
   (PO RECEIVED)  (PAID)
   (CONVERTED)    (OVERDUE)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · Vite 5 · React Router 6 · Lucide Icons |
| **Backend** | Node.js 20 · Express 4 · Mongoose 8 |
| **Database** | MongoDB 7+ (Atlas or self-hosted) |
| **Auth** | Express Session + connect-mongo (session-based) |
| **Deployment** | Render (unified frontend + backend service) |
| **CI/CD** | GitHub Actions |

---

## 📂 Project Structure

```
JN-CEYLON/
├── 📁 client/                 # React frontend (Vite)
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   │   ├── auth/          # PrivateRoute guard
│   │   │   ├── layout/        # Sidebar, Header, DashboardLayout
│   │   │   └── templates/     # Document print templates
│   │   ├── 📁 context/        # AuthContext provider
│   │   ├── 📁 contexts/       # ConfirmContext provider
│   │   ├── 📁 pages/          # Page components
│   │   │   ├── quotations/    # Quotation list, editor, view
│   │   │   ├── invoices/      # Invoice list, editor, view
│   │   │   ├── statements/    # Statement list, view, custom editor
│   │   │   ├── payments/      # Payment list
│   │   │   ├── companies/     # Company management
│   │   │   └── print/         # Print-only standalone pages
│   │   ├── 📁 styles/         # Global CSS (dashboard, document)
│   │   └── 📁 utils/          # Formatting & print helpers
│   └── vite.config.js         # Vite config with API proxy
├── 📁 server/                 # Express backend
│   ├── 📁 config/             # Database connection
│   ├── 📁 middleware/         # Auth middleware (protect, adminOnly)
│   ├── 📁 models/             # Mongoose schemas (7 models)
│   ├── 📁 routes/             # API routes (10 route files)
│   └── 📁 services/           # Business logic (seed, sequences)
├── 📁 test/                   # API smoke tests
├── 📁 docs/                   # Extended documentation
├── 📁 .github/                # CI/CD workflows & templates
├── 📄 seed.js                 # Database seeding script
├── 📄 ARCHITECTURE.md         # System architecture
├── 📄 DEPLOYMENT.md           # Render deployment guide
├── 📄 CONTRIBUTING.md         # Contribution guidelines
└── 📄 SECURITY.md             # Security policy
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20 or newer
- **MongoDB** 7+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** (comes with Node.js)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/perera99-msd/JN-CEYLON.git
cd JN-CEYLON

# Install server dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 2️⃣ Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jn_ceylon_erp
SESSION_SECRET=your-random-secret-at-least-32-characters
CORS_ORIGINS=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password-12-chars
ADMIN_FULL_NAME=JN Ceylon Administrator
```

### 3️⃣ Start Development

```bash
npm run dev
```

This launches both servers concurrently:
- 🖥️ **Frontend:** http://localhost:5173
- ⚙️ **Backend API:** http://localhost:5000

### 4️⃣ Seed Sample Data (Optional)

```bash
npm run seed
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [📐 Architecture](ARCHITECTURE.md) | System architecture, data models & design patterns |
| [🚀 Deployment](DEPLOYMENT.md) | Render deployment guide & environment setup |
| [🔒 Security](SECURITY.md) | Security policy & vulnerability reporting |
| [👤 User Guide](docs/USER_GUIDE.md) | End-user documentation for all features |
| [📡 API Reference](docs/API_REFERENCE.md) | Complete REST API documentation |
| [🤝 Contributing](CONTRIBUTING.md) | How to contribute to this project |
| [📜 Changelog](CHANGELOG.md) | Version history & release notes |
| [🤗 Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |

---

## 🧪 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend & backend in dev mode |
| `npm run server` | Start backend only (with nodemon) |
| `npm run client` | Start frontend only (Vite dev server) |
| `npm test` | Run API smoke tests |
| `npm run build` | Build production client bundle |
| `npm start` | Start production server |
| `npm run seed` | Seed default company & sequences |

---

## 🏥 Health Checks

| Endpoint | Purpose | Success |
|----------|---------|---------|
| `GET /api/health` | Process liveness | `200 { status: "ok" }` |
| `GET /api/ready` | Database readiness | `200 { status: "ready" }` |

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the <strong>JN Ceylon</strong> team
</p>

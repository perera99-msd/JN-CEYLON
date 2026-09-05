# 📐 Architecture — JN Ceylon ERP

> A technical deep-dive into the system architecture, data models, and design decisions behind JN Ceylon ERP.

---

## 🏗️ High-Level Architecture

JN Ceylon ERP follows a **monolithic full-stack** architecture deployed as a single service on Render. In production, the Express server serves both the REST API and the pre-built React SPA from `client/dist`.

```
┌─────────────────────────────────────────────────────────────┐
│                      Render Service                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Express.js Server                     │   │
│  │                                                      │   │
│  │   ┌─────────────┐    ┌───────────────────────────┐   │   │
│  │   │  Static      │    │    REST API (/api/*)      │   │   │
│  │   │  File Server │    │                           │   │   │
│  │   │  (React SPA) │    │  ┌─────┐ ┌──────────┐    │   │   │
│  │   │              │    │  │Auth │ │ Business  │    │   │   │
│  │   │  client/dist │    │  │Mid. │ │ Routes    │    │   │   │
│  │   └─────────────┘    │  └─────┘ └──────────┘    │   │   │
│  │                      └───────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│                   ┌────────────────┐                        │
│                   │  MongoDB Atlas │                        │
│                   │   (Database)   │                        │
│                   └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Monolithic deployment** | Simplicity — single Render service, one build step, no CORS complexity in production |
| **Session-based auth** | Simpler than JWT for server-rendered patterns; sessions stored in MongoDB via connect-mongo |
| **App factory pattern** | `createApp()` enables testing without MongoDB (pass `useMongoSessionStore: false`) |
| **Soft-delete + TTL** | Recycle bin pattern with 30-day auto-purge via MongoDB TTL indexes |

---

## ⚙️ Backend Architecture

### Express Application Factory

The server uses a **factory pattern** (`server/app.js`) that creates and configures the Express app. This allows the test suite to create isolated app instances without connecting to MongoDB.

```
server/
├── index.js              # Entry point — connects DB, seeds admin, starts server
├── app.js                # App factory — creates & configures Express app
├── config/
│   └── db.js             # MongoDB connection with graceful error handling
├── middleware/
│   └── authMiddleware.js  # protect (session check) + adminOnly (role check)
├── models/               # Mongoose schemas
│   ├── User.js           # User with bcrypt password hashing
│   ├── Company.js        # Client companies
│   ├── Quotation.js      # Quotations with line items
│   ├── Invoice.js        # Invoices with payment tracking
│   ├── Payment.js        # Payment records
│   ├── Sequence.js       # Auto-increment sequence counters
│   └── CustomStatement.js # Custom statement of accounts
├── routes/               # Express route handlers
│   ├── auth.js           # Login, logout, session check
│   ├── users.js          # User CRUD (admin-only)
│   ├── quotations.js     # Quotation CRUD + status transitions
│   ├── invoices.js       # Invoice CRUD + quotation conversion
│   ├── payments.js       # Payment recording against invoices
│   ├── statements.js     # Auto-generated statements
│   ├── customStatements.js # Custom statement CRUD
│   ├── companies.js      # Company management
│   ├── dashboard.js      # KPI metrics aggregation
│   └── recycleBin.js     # Soft-deleted item management
└── services/
    ├── seedAdmin.js       # Bootstrap admin user on startup
    └── sequenceService.js # Auto-increment number generation
```

### Middleware Pipeline

```
Request
  │
  ▼
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│  CORS    │ →  │  Body Parser │ →  │   Origin    │ →  │ Session  │
│  Filter  │    │  (JSON/URL)  │    │   Check     │    │  Store   │
└──────────┘    └──────────────┘    └─────────────┘    └──────────┘
                                                            │
                                                            ▼
                                    ┌─────────────┐    ┌──────────┐
                                    │  Route      │ ←  │ protect  │
                                    │  Handler    │    │ Middleware│
                                    └─────────────┘    └──────────┘
```

### Security Layers

1. **CORS** — Origin allowlist; rejects unlisted origins for mutating requests
2. **Session** — Encrypted cookies with configurable `sameSite` and `secure` flags
3. **Auth Middleware** — `protect` validates session; `adminOnly` checks role
4. **Input Validation** — Body size limited to 10MB; required fields enforced by Mongoose
5. **Password Hashing** — bcrypt with 10 salt rounds
6. **Production Guards** — `SESSION_SECRET` and `CORS_ORIGINS` required in production

---

## 🎨 Frontend Architecture

### React SPA Structure

```
client/src/
├── App.jsx                 # Root component with routing
├── main.jsx                # React DOM entry point
├── context/
│   └── AuthContext.jsx     # Authentication state provider
├── contexts/
│   └── ConfirmContext.jsx  # Confirmation dialog provider
├── components/
│   ├── auth/
│   │   └── PrivateRoute.jsx    # Route guard (redirects to /login)
│   ├── layout/
│   │   ├── DashboardLayout.jsx # Main layout wrapper
│   │   ├── Header.jsx          # Top navigation bar
│   │   └── Sidebar.jsx         # Side navigation menu
│   └── templates/
│       ├── DocumentHeader.jsx     # Shared print header
│       ├── QuotationTemplate.jsx  # Quotation print layout
│       ├── InvoiceTemplate.jsx    # Invoice print layout
│       └── StatementTemplate.jsx  # Statement print layout
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── SettingsPage.jsx
│   ├── RecycleBinPage.jsx
│   ├── quotations/     # List, Editor, View
│   ├── invoices/        # List, Editor, View
│   ├── statements/      # List, View, Custom Editor
│   ├── payments/        # List
│   ├── companies/       # List
│   └── print/           # Standalone print pages
├── styles/
│   ├── dashboard.css    # Dashboard & layout styles
│   └── document.css     # Print document styles
└── utils/
    ├── format.js        # Number/currency formatting
    └── print.js         # Print window helpers
```

### Component Hierarchy

```
<AuthProvider>
  <ConfirmProvider>
    <BrowserRouter>
      <Routes>
        /login          → LoginPage
        /               → PrivateRoute → DashboardLayout → DashboardPage
        /quotations     → PrivateRoute → QuotationListPage
        /quotations/new → PrivateRoute → QuotationEditorPage
        /invoices       → PrivateRoute → InvoiceListPage
        /settings       → PrivateRoute (adminOnly) → SettingsPage
        /print/*        → Standalone print pages (no layout)
      </Routes>
    </BrowserRouter>
  </ConfirmProvider>
</AuthProvider>
```

### State Management

| Provider | Purpose |
|----------|---------|
| `AuthContext` | Stores logged-in user, provides login/logout, persists session check via `/api/auth/me` |
| `ConfirmContext` | Global confirmation dialog — avoids prop-drilling for delete/action confirmations |

---

## 📊 Data Model & Relationships

```
┌──────────┐         ┌─────────────┐         ┌──────────┐
│   User   │         │   Company   │         │ Sequence │
│──────────│         │─────────────│         │──────────│
│ username │         │ name        │         │ type     │
│ fullName │         │ address     │         │ prefix   │
│ password │         │ custCode    │         │ current  │
│ role     │         │ contact*    │         │ Number   │
└──────────┘         │ isDefault   │         └──────────┘
                     │ isDeleted ◄─┤── TTL index (30 days)
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌────────────┐ ┌──────────┐ ┌──────────────────┐
       │ Quotation  │ │ Invoice  │ │ CustomStatement  │
       │────────────│ │──────────│ │──────────────────│
       │ quotationNo│ │ invoiceNo│ │ title            │
       │ date       │ │ date     │ │ statementDate    │
       │ company ──►│ │ company►│ │ company ────────►│
       │ items[]    │ │ items[]  │ │ items[]          │
       │ status     │ │ status   │ │ pendingTotal     │
       │ terms      │ │ poNumber │ │ accountTotal     │
       │ grandTotal │ │ quotation│ │ isDeleted        │
       │ isDeleted  │ │ amountPaid│ └──────────────────┘
       └─────┬──────┘ │ balanceDue│
             │        │ isDeleted │
             │        └─────┬─────┘
             │              │
             │  (converts)  │
             └──────────────┘
                            │
                            ▼
                     ┌──────────┐
                     │ Payment  │
                     │──────────│
                     │ invoice►│
                     │ company►│
                     │ amount   │
                     │ method   │
                     │ reference│
                     │ date     │
                     │ isDeleted│
                     └──────────┘
```

### Relationship Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| Company → Quotation | 1:N | A company has many quotations |
| Company → Invoice | 1:N | A company has many invoices |
| Company → Payment | 1:N | A company has many payments |
| Company → CustomStatement | 1:N | A company has many custom statements |
| Quotation → Invoice | 1:1 | A quotation converts to one invoice (optional) |
| Invoice → Payment | 1:N | An invoice has many payments |
| Invoice → Quotation | N:1 | An invoice may reference its source quotation |

---

## 🔄 Business Workflow Detail

### Quotation Lifecycle

```
DRAFT → SENT → PO_RECEIVED → CONVERTED → (linked Invoice)
                    ↓
                REJECTED
```

### Invoice Lifecycle

```
DRAFT → SENT → PENDING → PARTIAL → PAID
                  ↓
               OVERDUE
```

### Payment Flow

```
1. User records a payment against an invoice
2. Invoice.amountPaid += payment.amount
3. Invoice.balanceDue = Invoice.grandTotal - Invoice.amountPaid
4. If balanceDue == 0 → Invoice.status = "PAID"
5. If balanceDue > 0  → Invoice.status = "PARTIAL"
```

---

## 🔐 Authentication Flow

```
┌────────┐          ┌─────────┐          ┌─────────┐
│ Client │          │ Express │          │ MongoDB │
└───┬────┘          └────┬────┘          └────┬────┘
    │  POST /api/auth/login                   │
    │  { username, password }                 │
    ├────────────────────►│                   │
    │                     │  User.findOne()   │
    │                     ├──────────────────►│
    │                     │◄─────────────────┤
    │                     │  bcrypt.compare() │
    │                     │  session.userId=id│
    │                     │  Store session ──►│
    │  Set-Cookie: sid    │                   │
    │◄────────────────────┤                   │
    │                     │                   │
    │  GET /api/quotations│                   │
    │  Cookie: sid        │                   │
    ├────────────────────►│                   │
    │                     │  protect()        │
    │                     │  session.userId?  │
    │                     │  User.findById() ►│
    │  200 + data         │                   │
    │◄────────────────────┤                   │
```

---

## 🔢 Sequence Number Generation

The system uses a custom auto-increment service (`sequenceService.js`) for generating unique quotation and invoice numbers:

```
Format: {prefixNumber}{code}{paddedNumber}

Example Quotation: 158RC578
Example Invoice:   111NVO353

Logic:
1. currentNumber += 2
2. If currentNumber >= 1000 → prefixNumber += 1, wrap number
3. Pad number to 3 digits
4. Combine: prefixNumber + code + paddedNumber
```

---

## 🗑️ Soft-Delete & Recycle Bin

All primary entities (Quotation, Invoice, Payment, Company, CustomStatement) use a **soft-delete pattern**:

```javascript
// Soft-delete fields on each model:
{
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}

// MongoDB TTL index — auto-purges after 30 days:
Schema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
```

- **Delete** → sets `isDeleted: true`, `deletedAt: Date.now()`
- **Restore** → sets `isDeleted: false`, `deletedAt: null`
- **Auto-purge** → MongoDB TTL index removes documents 30 days after `deletedAt`

---

## 🌐 Deployment Architecture

```
GitHub (main branch)
        │
        ▼ (push / merge)
┌──────────────────┐
│  GitHub Actions  │
│  ├── CI Pipeline │ ── tests, lint, build
│  ├── Security    │ ── npm audit (weekly)
│  └── Deploy      │ ── Render deploy hook
└──────────────────┘
        │
        ▼ (webhook trigger)
┌──────────────────────────────────────┐
│           Render Platform            │
│  ┌────────────────────────────────┐  │
│  │  Web Service (Node.js)        │  │
│  │                               │  │
│  │  Build:  npm ci &&            │  │
│  │          npm ci --prefix      │  │
│  │          client &&            │  │
│  │          npm run build        │  │
│  │                               │  │
│  │  Start:  npm start            │  │
│  │                               │  │
│  │  Health: /api/health          │  │
│  └────────────────────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌────────────────────────────────┐  │
│  │  MongoDB Atlas (External)     │  │
│  │  via MONGODB_URI env var      │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Production Build Flow

1. **Build command** installs both server and client deps, then builds the React SPA
2. **Start command** launches Express, which serves `client/dist` as static files
3. All client-side routes fall through to `index.html` (SPA catch-all)
4. API routes are served under `/api/*`

---

## 📏 Design Patterns Used

| Pattern | Where Used |
|---------|-----------|
| **Factory Pattern** | `createApp()` — configurable app creation for prod/test |
| **MVC (Model-View-Controller)** | Models → Routes → React Pages |
| **Repository Pattern** | Mongoose models abstract data access |
| **Provider Pattern** | React Context (Auth, Confirm) |
| **Guard Pattern** | PrivateRoute component, protect middleware |
| **Soft Delete** | All primary entities support recycle bin |
| **TTL Auto-Purge** | MongoDB TTL indexes clean deleted records |
| **Atomic Counter** | Sequence service with `findOneAndUpdate` |

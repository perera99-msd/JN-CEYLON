# 👤 User Guide — JN Ceylon ERP

> A complete guide to using JN Ceylon ERP for managing quotations, invoices, payments, and statements.

---

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Dashboard](#-dashboard)
- [Managing Companies](#-managing-companies)
- [Quotations](#-quotations)
- [Invoices](#-invoices)
- [Payments](#-payments)
- [Statements](#-statements)
- [Printing Documents](#-printing-documents)
- [Recycle Bin](#-recycle-bin)
- [Settings (Admin Only)](#-settings-admin-only)
- [Tips & Best Practices](#-tips--best-practices)

---

## 🚀 Getting Started

### First Login

1. Open the application at your deployment URL
2. Enter the admin credentials configured during deployment
3. You will be redirected to the **Dashboard**

> 💡 **Tip:** Change the default admin password immediately after first login via **Settings**.

### Navigation

The **sidebar** provides quick access to all modules:

| Icon | Module | Description |
|------|--------|-------------|
| 📊 | Dashboard | Overview of business metrics |
| 📝 | Quotations | Create and manage quotations |
| 🧾 | Invoices | Create and manage invoices |
| 💰 | Payments | View recorded payments |
| 📄 | Statements | Generate account statements |
| 🏢 | Companies | Manage client companies |
| 🗑️ | Recycle Bin | Recover deleted items |
| ⚙️ | Settings | User & system management (Admin only) |

---

## 📊 Dashboard

The Dashboard provides a real-time overview of your business:

### KPI Metrics

| Metric | Description |
|--------|-------------|
| **Total Quotations** | Count and total value of all quotations |
| **Total Invoices** | Count and total value of all invoices |
| **Total Paid** | Sum of all payments received |
| **Total Pending** | Outstanding balance across all invoices |
| **Pending Invoices** | Number of unpaid invoices |
| **Paid Invoices** | Number of fully paid invoices |

### Recent Activity

The dashboard shows the 5 most recent:
- 📝 Quotations
- 🧾 Invoices
- 💰 Payments

---

## 🏢 Managing Companies

Companies represent your clients/customers. Each quotation, invoice, and statement is linked to a company.

### Create a Company

1. Navigate to **Companies** from the sidebar
2. Click **Add Company**
3. Fill in the details:
   - **Name** — Company name (required, must be unique)
   - **Address** — Line 1, Line 2, Country
   - **Customer Code** — Internal reference code
   - **Contact Email** — Primary email
   - **Contact Phone** — Primary phone number
4. Click **Save**

### Edit a Company

1. Find the company in the list
2. Click the **Edit** button
3. Update the details and click **Save**

### Delete a Company

1. Click the **Delete** button next to the company
2. Confirm the deletion
3. The company moves to the **Recycle Bin** (recoverable for 30 days)

> ⚠️ **Note:** Deleting a company does not delete its linked quotations, invoices, or payments.

---

## 📝 Quotations

Quotations are the first step in the quote-to-cash workflow.

### Create a Quotation

1. Navigate to **Quotations** → **New Quotation**
2. Fill in the header:
   - **Quotation Number** — Auto-generated (preview shown)
   - **Date** — Select the quotation date
   - **Company** — Select the client company
   - **Customer Code** — Auto-filled from company
   - **Prepared By** — Default: JN Ceylon
3. Add **line items**:
   - Item Number, Name, Description, Image (optional)
   - Quantity, Unit Price → Total is auto-calculated
4. Review **financial summary**:
   - Subtotal, Tax, Discount, IVA → Grand Total
5. Set **terms**:
   - Price terms, Delivery, Payment terms, Validity
6. Click **Save**

### Quotation Status Flow

| Status | Meaning | Next Actions |
|--------|---------|-------------|
| 📋 **DRAFT** | Just created, not yet sent | Edit, Send, Delete |
| 📤 **SENT** | Sent to client | Mark PO Received, Reject |
| 📬 **PO_RECEIVED** | Purchase order received | Convert to Invoice |
| ✅ **CONVERTED** | Converted to an invoice | View linked invoice |
| ❌ **REJECTED** | Client rejected | Delete, Re-create |

### Convert Quotation to Invoice

1. Open a quotation with status **PO_RECEIVED**
2. Click **Convert to Invoice**
3. Enter the **PO Number**
4. An invoice is created with all items copied from the quotation
5. The quotation status changes to **CONVERTED**

---

## 🧾 Invoices

Invoices track amounts owed by clients and payment progress.

### Create an Invoice

Invoices can be created in two ways:

1. **From a Quotation** — Convert an approved quotation (recommended)
2. **Standalone** — Create directly via **Invoices** → **New Invoice**

### Invoice Fields

| Field | Description |
|-------|-------------|
| Invoice No. | Auto-generated unique number |
| Date | Invoice date |
| Company | Client company |
| PO Number | Client's purchase order reference |
| Due Date | Payment due date |
| Items | Line items (same as quotation) |
| Amount Paid | Running total of payments received |
| Balance Due | Grand Total − Amount Paid |

### Invoice Status Flow

| Status | Meaning |
|--------|---------|
| 📋 **DRAFT** | Just created |
| 📤 **SENT** | Sent to client |
| ⏳ **PENDING** | Awaiting payment |
| 💳 **PARTIAL** | Partially paid |
| ✅ **PAID** | Fully paid |
| ⚠️ **OVERDUE** | Past due date |

---

## 💰 Payments

Payments are recorded against specific invoices.

### Record a Payment

1. Navigate to **Invoices** → select an invoice
2. Click **Record Payment**
3. Fill in payment details:
   - **Amount** — Payment amount (minimum $0.01)
   - **Method** — Bank Transfer, Cheque, Cash, or Other
   - **Reference** — Transaction reference number
   - **Date** — Payment date
   - **Notes** — Optional notes
4. Click **Save**

The invoice automatically updates:
- `Amount Paid` increases by the payment amount
- `Balance Due` decreases accordingly
- Status changes to **PARTIAL** or **PAID**

### Payment Methods

| Method | Icon | Description |
|--------|------|-------------|
| Bank Transfer | 🏦 | Wire transfer or bank payment |
| Cheque | 📝 | Paper cheque payment |
| Cash | 💵 | Cash payment |
| Other | 📋 | Any other payment method |

---

## 📄 Statements

Statements provide a summary of account activity for a company.

### Auto-Generated Statements

1. Navigate to **Statements**
2. Select a **Company** from the list
3. The statement is auto-generated showing all invoices for that company
4. View pending balances and total account balance

### Custom Statements

For tailored statements:

1. Navigate to **Statements** → **New Custom Statement**
2. Select a **Company** and **Statement Date**
3. Add custom line items:
   - Date, Invoice reference, Description, PO, Status, Due, Total
4. Set Pending Total Balance and Account Total Balance
5. Click **Save**

---

## 🖨️ Printing Documents

All documents can be printed as professional A4 PDFs.

### How to Print

1. Open any quotation, invoice, or statement
2. Click the **Print** button
3. A new print-ready page opens with the document template
4. Use your browser's **Print** dialog (Ctrl+P / Cmd+P)
5. Select **Save as PDF** or your printer

### Print Templates

| Document | Template Features |
|----------|-------------------|
| Quotation | Company header, line items with images, terms & conditions |
| Invoice | Company header, line items, payment status, due date |
| Statement | Account summary, invoice breakdown, balance totals |

> 💡 **Tip:** For best results, use **A4** paper size and **Portrait** orientation in the print dialog. Disable headers and footers for a clean output.

---

## 🗑️ Recycle Bin

Deleted items are moved to the Recycle Bin instead of being permanently removed.

### How It Works

- 🗑️ **Delete** any quotation, invoice, payment, company, or custom statement
- ♻️ Items stay in the Recycle Bin for **30 days**
- 🔄 **Restore** items anytime within 30 days
- ⏰ After 30 days, items are **automatically purged** (permanent deletion)

### Restore an Item

1. Navigate to **Recycle Bin** from the sidebar
2. Browse deleted items (organized by type)
3. Click **Restore** next to the item you want to recover
4. The item is restored to its original location and status

> ⚠️ **Warning:** Items purged after 30 days cannot be recovered. Make sure to restore anything you need within the retention period.

---

## ⚙️ Settings (Admin Only)

The Settings page is accessible only to users with the **ADMIN** role.

### User Management

| Action | Description |
|--------|-------------|
| **View Users** | See all registered users |
| **Add User** | Create new users with username, full name, password, and role |
| **Edit User** | Update user details or change role |
| **Delete User** | Remove a user (cannot delete yourself) |

### User Roles

| Role | Permissions |
|------|-------------|
| 🔑 **ADMIN** | Full access to all features including Settings |
| 👤 **NORMAL** | Access to all features except Settings |

---

## 💡 Tips & Best Practices

### Workflow Tips

1. 📝 **Always start with a quotation** — Convert to invoice when the PO is received for clean tracking
2. 📬 **Update quotation status** as it progresses — it helps the dashboard show accurate metrics
3. 💰 **Record payments promptly** — Keep invoice balances up to date
4. 📄 **Generate statements monthly** — Use custom statements for specific reporting periods

### Data Management

5. 🏢 **Set up companies first** — They're required for quotations and invoices
6. 🗑️ **Use the Recycle Bin** — Don't worry about accidental deletes; they're recoverable for 30 days
7. 📊 **Check the Dashboard daily** — Monitor pending payments and recent activity

### Security

8. 🔑 **Change the admin password** immediately after first deployment
9. 👥 **Use NORMAL role** for general users — Only give ADMIN to users who need settings access
10. 🚪 **Log out** when leaving a shared computer

---

## ❓ Need Help?

- Check the [README](../README.md) for setup instructions
- Review the [API Reference](API_REFERENCE.md) for technical details
- Report bugs via [GitHub Issues](https://github.com/perera99-msd/JN-CEYLON/issues)

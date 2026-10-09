# SmartBiz Calculator & Business Management

### A browser-based calculator, point-of-sale, inventory and customer-ledger (*Udhar*) application for small shops

SmartBiz is a single-page web application that combines a business calculator with a billing/POS terminal, product and stock management, supplier purchases, customer credit ledgers, returns, expenses, and basic profit reporting. It is built with React, TypeScript, Vite and Tailwind CSS.

> **Read this first.** SmartBiz is currently a **fully client-side application**. There is **no server, no cloud database and no real authentication**. All business data is stored in the browser's `localStorage`, and the "login" screen is a role switcher. The repository also contains Firebase/Gemini/Express dependencies and many planning documents that describe a cloud architecture; **none of that is present in the source code**. This README describes only what the code actually does.

**Status legend used throughout this document**

| Label | Meaning |
|---|---|
| ✅ **Implemented** | Code exists and performs the described function end to end in the browser |
| ⚠️ **Partial** | Code exists but is incomplete, inconsistent, or only works in some paths |
| 🖼️ **UI only** | A control, label or component exists but nothing is wired behind it |
| ❌ **Not implemented** | No code exists for the feature (even if mentioned elsewhere) |

**How this was verified:** the entire `src/` tree was read, `tsc --noEmit` passes, and `vite build` succeeds (after the dependency workaround in [Section 15](#15-step-by-step-installation-instructions)). The application was **not** exercised in a live browser session and the repository contains **no automated tests**, so behaviour statements come from code inspection.

---

## Table of Contents

1. [Project Title](#1-project-title)
2. [Project Overview](#2-project-overview)
3. [Project Description](#3-project-description)
4. [Main Features](#4-main-features)
5. [Implemented Functionalities](#5-implemented-functionalities)
6. [Admin/User Features](#6-adminuser-features)
7. [All Implemented Modules and Pages](#7-all-implemented-modules-and-pages)
8. [Technologies and Tools Used](#8-technologies-and-tools-used)
9. [Frontend Technologies](#9-frontend-technologies)
10. [Backend Technologies](#10-backend-technologies)
11. [Database Information](#11-database-information)
12. [Project Architecture](#12-project-architecture)
13. [Project Folder/File Structure](#13-project-folderfile-structure)
14. [Installation and Setup Requirements](#14-installation-and-setup-requirements)
15. [Step-by-Step Installation Instructions](#15-step-by-step-installation-instructions)
16. [Database Setup and Configuration](#16-database-setup-and-configuration)
17. [How to Run the Project](#17-how-to-run-the-project)
18. [Main Project Workflow](#18-main-project-workflow)
19. [Important Files and Their Purpose](#19-important-files-and-their-purpose)
20. [Current Implementation Status](#20-current-implementation-status)
21. [Completed Features](#21-completed-features)
22. [Partially Implemented Features](#22-partially-implemented-features)
23. [Features That Are Not Implemented](#23-features-that-are-not-implemented)
24. [Security Considerations](#24-security-considerations)
25. [Known Limitations](#25-known-limitations)
26. [Future Improvements](#26-future-improvements)
27. [Testing/Verification Information](#27-testingverification-information)
28. [Conclusion](#28-conclusion)

---

## 1. Project Title

**SmartBiz Calculator & Business Management** (branded "SmartBiz — POS PRO" in the navigation bar)

---

## 2. Project Overview

SmartBiz targets shopkeepers and small retail businesses (the seed data models a Pakistani grocery store using PKR and the *Udhar* credit-sale concept). A user can:

- calculate with a shop-oriented calculator (GST, markup, memory, running grand total, calculation tape),
- turn a calculation into a bill,
- sell through a one-screen *Quick Sale* terminal or a fuller *Billing / POS* screen,
- keep per-customer credit balances and ledgers,
- manage products, stock, supplier purchases, returns and expenses,
- view a dashboard and simple financial reports.

Everything runs in the browser and persists to `localStorage`; there is nothing to deploy except static files.

---

## 3. Project Description

The application is organised as twelve tabs inside a single React app (see [Section 7](#7-all-implemented-modules-and-pages)). Two React contexts hold the application state:

- `AuthContext` — current user, business profile, role-based permission table.
- `DbContext` — all business collections (products, customers, invoices, etc.) and their create/update/delete actions.

Both sit on top of a small custom data layer, `src/services/db.ts` (`DatabaseEngine`), which reads and writes JSON to `localStorage`, seeds demo data on first launch, notifies subscribers on change, and implements the multi-collection business transactions (creating an invoice, recording a purchase, processing a return, adjusting stock, recording a customer payment).

The project was scaffolded from a Google AI Studio template (comments in `vite.config.ts` and `.env.example` show this), which is why some template dependencies and settings remain even though no AI feature was built.

---

## 4. Main Features

| Feature | Status |
|---|---|
| Business calculator with GST add/remove, markup, memory, grand total, tape, history | ✅ Implemented |
| Convert calculator result/tape into a bill | ✅ Implemented |
| Quick Sale walk-in checkout | ✅ Implemented |
| Billing / POS with customer selection, three price tiers, discounts, tax, partial payment, credit | ✅ Implemented |
| Printable/WhatsApp-shareable receipts (58 mm, 80 mm, A4 setting) | ✅ Implemented (print/WhatsApp are browser actions) |
| Customer Udhar balances, ledger, payment settlement | ✅ Implemented |
| WhatsApp balance reminder | ⚠️ Opens a pre-filled `wa.me` link; nothing is sent automatically |
| Product catalogue with SKU, barcode, categories, units, retail/wholesale/special prices | ✅ Implemented |
| Stock tracking, low-stock list, manual stock adjustments with history | ✅ Implemented |
| Supplier purchases that restock inventory and track supplier dues | ⚠️ Dues can be created but never paid down (see [Section 22](#22-partially-implemented-features)) |
| Sales returns with optional restocking | ⚠️ Works, with accounting caveats (see Section 22) |
| Expenses | ✅ Implemented |
| Dashboard with KPI cards and charts | ✅ Implemented |
| Reports (P&L, customer dues, supplier dues, best sellers, cashier totals) | ⚠️ Works; print and CSV export have limitations |
| Backup / restore as JSON | ✅ Implemented |
| Roles (Admin / Manager / Cashier) | ⚠️ Demo-grade; enforced in only a few places |
| Real login, cloud sync, multi-device, AI features | ❌ Not implemented |

---

## 5. Implemented Functionalities

### 5.1 Smart Calculator (`calculator/SmartCalculator.tsx`)

- Digits, decimal point, `+ − × ÷`, `%`, backspace, clear (C) and all-clear (AC).
- Keyboard input: `0–9 . + - * /`, `Enter` / `=`, `Backspace`, `Esc`, `%` (ignored while typing in an input field).
- Expressions are evaluated after a character whitelist check (digits, whitespace, `+ - * / . ( )`), then run through `Function(...)`. `%` is rewritten as `/100`.
- **Memory:** `M+`, `M−`, `MRC` (recalls the memory value; it does not clear it).
- **Grand Total (GT):** every `=` adds to a running total and counter; GT recalls it.
- **Markup (MU):** adds a **fixed 20 %** to the current value (the rate is hard-coded, not user-adjustable).
- **GST:** add or remove GST using presets (5 %, 12 %, 18 %, 28 %) or a custom rate; the default is 18 %.
- **Calculation tape** of the session, and a **history** modal (search, category filter, favourites, delete, clear). History keeps the latest 300 records and is stored in `localStorage`.
- **Quick-add from catalogue:** with a number typed, tapping a product adds `quantity × retail price` to the tape.
- **Convert to Bill:** sends the tape (or the single result) to the Billing screen as line items.
- **Save to Customer:** sends the amount to the Billing screen as a single line item (see [Section 22](#22-partially-implemented-features); it does not write to a customer record).
- Optional sound feedback generated with the Web Audio API (toggle in the navbar and Settings).

### 5.2 Quick Sale (`pos/QuickSale.tsx`)

- Product search by name/SKU/barcode text, cart, quantity changes, fixed bill discount.
- Always records the sale to the built-in **Walk-in Customer**, fully paid, with no tax.
- Payment method selection including **QR Pay**, receipt preview, print and WhatsApp share.

### 5.3 Billing / POS (`pos/BillingView.tsx`)

- Customer search/selection and inline customer registration.
- Product picker with **retail / wholesale / special** price tiers; per-line quantity, price and discount editing.
- Bill-level fixed discount, bill-level tax rate (defaults from Settings), paid amount (defaults to the grand total and can be lowered to leave a balance).
- Payment status derived automatically: `paid` / `partial` / `unpaid`; unpaid sales are recorded with method `credit`.
- **Invoice archive** tab with search and status filter, invoice detail view and receipt re-print.
- Invoice creation (`db.createInvoice`) atomically updates, in one function: stock, inventory transaction log, customer totals/due, customer ledger, payment reminder record, and the activity log.
- Gross profit per invoice is computed from each product's purchase price at the time of sale.

### 5.4 Customers & Udhar (`customers/CustomerManagement.tsx`)

- Customer list with phone/name search and type filter (`walk-in`, `regular`, `wholesale`, `vip`).
- Add / edit / delete customers.
- Profile with totals (purchases, paid, due), invoice history and a ledger of sales, payments and returns.
- **Receive payment** against an outstanding balance (`db.recordCustomerPayment`), which reduces the due balance and appends a ledger entry.
- **WhatsApp reminder** button builds a message and opens `https://wa.me/<phone>?text=…` in a new tab.

### 5.5 Products (`products/ProductManagement.tsx`)

- Create / edit / delete products with name, SKU, barcode (auto-generated for new items), category, unit, purchase / retail / wholesale / special prices, stock, minimum stock, tax rate and description.
- Favourite flag, search by name/SKU/barcode.
- Purchase (cost) price is hidden for roles without the `view_purchase_cost` permission.

### 5.6 Inventory (`inventory/InventoryManagement.tsx`)

- Stock list, low-stock banner (`stock ≤ minStock`), search.
- **Stock adjustment** (positive or negative) with reason `adjustment` or `damaged`, recorded via `db.adjustStock` and shown in a stock-movement history list.

### 5.7 Purchases & Suppliers (`purchases/PurchaseManagement.tsx`)

- Supplier list and creation.
- Purchase entry with line items, paid amount and payment method. Saving a purchase (`db.createPurchase`) increases stock, updates each product's purchase price, adds an inventory transaction, increases the supplier's totals/due, and appends a supplier-ledger record.

### 5.8 Returns (`returns/ReturnManagement.tsx`)

- Select an existing invoice, choose quantities to return (capped at the invoiced quantity), reason, refund method (`cash` or `credit_adjust`) and per-item restock flag.
- `db.processReturn` restocks flagged items, reduces the customer's due balance, writes a ledger entry and marks the invoice `partial_refund`.

### 5.9 Expenses (`expenses/ExpenseManagement.tsx`)

- Add and delete expenses with title, category, amount, date, payment method, receipt number and notes. Deletion requires the `manage_expenses` permission.

### 5.10 Dashboard (`dashboard/DashboardOverview.tsx`)

- Today's sales, invoice count, profit / net profit (profit card shown only when the user has `view_reports`).
- Low-stock indicator and reorder list, recent customer sales.
- Recharts **7-day sales & revenue area chart** and **revenue-by-category pie chart**.

### 5.11 Reports (`reports/BusinessReports.tsx`)

- Profit & Loss (all-time totals), customer due list, supplier payables, best-selling items (by quantity), cashier performance (invoice count and sales total).
- `Export CSV` and `Print Report` buttons (see limitations in [Section 22](#22-partially-implemented-features) and [Section 25](#25-known-limitations)).

### 5.12 Settings (`settings/SettingsView.tsx`)

- Shop profile (name, owner, phone, email, address, tax ID, currency code and symbol).
- Invoice settings (prefix, default tax rate, receipt paper size, QR payment identifier, receipt footer note).
- Read-only staff list.
- **Backup / restore**: download all collections as JSON; upload a JSON file to restore.
- Sound toggle.

---

## 6. Admin/User Features

Three roles exist: **Admin**, **Manager**, **Cashier**. Three demo users are seeded:

| Name | Email | Role |
|---|---|---|
| Youza Manzoor (Owner) | `admin@smartbiz.com` | admin |
| Hamza Tariq (Manager) | `manager@smartbiz.com` | manager |
| Bilal Ahmed (Cashier) | `cashier@smartbiz.com` | cashier |

### 6.1 Permission table (defined in `AuthContext.tsx`)

| Permission | Admin | Manager | Cashier | Enforced in UI? |
|---|:-:|:-:|:-:|---|
| `view_reports` | ✅ | ✅ | ❌ | ✅ Hides the **Reports** tab and the dashboard profit card |
| `manage_products` | ✅ | ✅ | ❌ | ✅ Hides Add / Delete product buttons |
| `view_purchase_cost` | ✅ | ✅ | ❌ | ✅ Hides cost price in the product list |
| `manage_expenses` | ✅ | ✅ | ❌ | ✅ Hides the expense delete button |
| `create_sale` | ✅ | ✅ | ✅ | ❌ Not checked anywhere |
| `cancel_sale` | ✅ | ✅ | ❌ | ❌ Not checked (no invoice-cancel feature exists) |
| `give_discount` | ✅ | ✅ | ✅ | ❌ Not checked |
| `view_profit` | ✅ | ✅ | ❌ | ❌ Not checked |
| `manage_customers` | ✅ | ✅ | ✅ | ❌ Not checked |
| `manage_suppliers` | ✅ | ✅ | ❌ | ❌ Not checked |
| `record_payments` | ✅ | ✅ | ✅ | ❌ Not checked |
| `manage_staff` | ✅ | ❌ | ❌ | ❌ Not checked (there is no staff-management UI) |
| `backup_restore` | ✅ | ❌ | ❌ | ❌ Not checked — any role can export or restore from Settings |

### 6.2 How "login" works

- On load the app signs in the first **admin** user automatically. The current user is **not persisted**, so a page refresh returns to admin.
- The **Staff Login & Role Switcher** modal lets *anyone* switch to any seeded role with one click.
- The email/password form **does not check the password**. An email that matches a seeded user signs in as that user; any other email creates a temporary session whose role defaults to **admin**. The new user is not saved to the user list.
- "Sign Out" switches the session to the cashier role.

This is a demonstration of role-based UI, not an access-control system. See [Section 24](#24-security-considerations).

---

## 7. All Implemented Modules and Pages

All "pages" are tabs rendered by `src/App.tsx` according to a `useState` value (there is no router, so tabs have no URLs).

| # | Tab | Component | Visible to |
|---|---|---|---|
| 1 | Dashboard | `components/dashboard/DashboardOverview.tsx` | All |
| 2 | Calculator | `components/calculator/SmartCalculator.tsx` | All |
| 3 | Quick Sale | `components/pos/QuickSale.tsx` | All |
| 4 | Billing / POS | `components/pos/BillingView.tsx` | All |
| 5 | Customers & Udhar | `components/customers/CustomerManagement.tsx` | All |
| 6 | Products | `components/products/ProductManagement.tsx` | All (actions role-limited) |
| 7 | Inventory | `components/inventory/InventoryManagement.tsx` | All |
| 8 | Purchases | `components/purchases/PurchaseManagement.tsx` | All |
| 9 | Returns | `components/returns/ReturnManagement.tsx` | All |
| 10 | Expenses | `components/expenses/ExpenseManagement.tsx` | All |
| 11 | Reports | `components/reports/BusinessReports.tsx` | Admin, Manager (tab hidden for Cashier) |
| 12 | Settings | `components/settings/SettingsView.tsx` | All |

**Shared components:** `layout/AppNavbar.tsx` (navigation, role badge, sound toggle, mobile menu), `auth/AuthModal.tsx` (role switcher), `pos/ThermalReceipt.tsx` (receipt, print, WhatsApp share), `pos/QrPaymentModal.tsx` (QR payment dialog).

**Present but unused:** `calculator/SaveToCustomerModal.tsx` is not imported anywhere in the application.

> Hiding a tab is cosmetic: `App.tsx` renders whichever tab is active without re-checking permissions.

---

## 8. Technologies and Tools Used

| Category | Technology | Used in code? |
|---|---|---|
| UI framework | React 19 | ✅ |
| Language | TypeScript | ✅ |
| Build tool / dev server | Vite 8 (`@vitejs/plugin-react`) | ✅ |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | ✅ |
| Charts | Recharts 3 | ✅ (Dashboard) |
| Icons | lucide-react | ✅ |
| Persistence | Browser `localStorage` | ✅ |
| Sound | Web Audio API | ✅ |
| Barcodes | Text matching on a typed/scanned value only | ✅ (no camera scanning) |
| QR image | Third-party `api.qrserver.com` | ✅ (needs internet) |
| WhatsApp sharing | `wa.me` links | ✅ |
| Package managers | npm (`package.json`), Bun lockfile (`bun.lock`) | — |
| `@google/genai`, `express`, `dotenv`, `motion`, `tsx`, `esbuild`, `autoprefixer` | Declared in `package.json` | ❌ Never imported by `src/` |

---

## 9. Frontend Technologies

- **React 19.0.x** with function components, hooks and context.
- **TypeScript** (strict-style typing of all domain models in `src/types/index.ts`; `tsc --noEmit` passes).
- **Vite 8** with the `@` alias configured in `vite.config.ts` (not used by the current imports).
- **Tailwind CSS 4** via `@import "tailwindcss"` in `src/index.css`, plus a small `@media print` block that makes only `.printable-thermal` elements printable.
- **Recharts** for the dashboard area and pie charts.
- **lucide-react** for icons.
- Responsive layout with a mobile drawer menu.

---

## 10. Backend Technologies

**None.** There is no server code in the repository: no API routes, no server entry file, no database driver. `package.json` lists `express` and `dotenv`, and `.env.example` defines `GEMINI_API_KEY` and `APP_URL`, but nothing in `src/` reads an environment variable or calls an API of its own. `metadata.json` declares a "server-side Gemini API" capability that is likewise unused.

The only network calls the application makes are:
1. loading the QR image from `https://api.qrserver.com`, and
2. opening `https://wa.me/...` links in a new tab.

---

## 11. Database Information

- **Engine:** the browser's `localStorage` (via `DatabaseEngine` in `src/services/db.ts`). Data is JSON, stored per browser profile and origin.
- **Key format:** `smartbiz_biz_main_<collection>` for each collection, plus `smartbiz_initialized` (seed flag) and `smartbiz_sound` (sound setting).
- **Change notification:** each `set()` notifies subscribers so React state refreshes.
- **Collections:**

| Collection | Contents |
|---|---|
| `settings` | Business profile and invoice/receipt configuration |
| `users` | Seeded staff accounts (no passwords stored) |
| `products` | Catalogue and live stock quantity |
| `customers` / `customerLedger` | Customer records, totals and ledger entries |
| `suppliers` / `supplierLedger` | Supplier records, totals and ledger entries |
| `invoices` | Sales with line items, cost, profit and payment status |
| `purchases` | Supplier purchases |
| `returns` | Sale returns |
| `expenses` | Operating expenses |
| `calculations` | Calculator history (max 300) |
| `inventoryTransactions` | Stock movement log (sale, purchase, return, adjustment) |
| `activityLogs` | Audit entries (max 500) — written but not displayed (see Section 22) |
| `paymentReminders` | Reminder records — written but not displayed (see Section 22) |

- **Seed data (first launch):** 1 business ("Al-Madina Smart Superstore", currency PKR / `Rs.`), 3 users, 8 products, 4 customers (including a Walk-in Customer), 2 suppliers, 3 customer-ledger entries, 3 expenses, 3 calculator history entries, 1 payment reminder, and 1 activity-log entry.
- **Document numbers:** invoices `SB-1001…` (prefix configurable), purchases `PUR-5001…`, returns `RET-3001…`.
- **Capacity:** `localStorage` is typically limited to roughly 5 MB per origin; a write failure is only logged to the console.

---

## 12. Project Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       Browser (SPA)                         │
│                                                            │
│  App.tsx  ── tab state (no router)                         │
│     │                                                      │
│     ├── AuthProvider  (AuthContext.tsx)                    │
│     │      current user · business profile · can(permission)│
│     │                                                      │
│     └── DbProvider    (DbContext.tsx)                      │
│            collections in React state + CRUD actions       │
│                      │                                     │
│                      ▼                                     │
│           services/db.ts  (DatabaseEngine)                 │
│     get/set/subscribe · seeding · multi-step transactions  │
│        createInvoice · createPurchase · processReturn      │
│        adjustStock · recordCustomerPayment · backup        │
│                      │                                     │
│                      ▼                                     │
│                window.localStorage                         │
└────────────────────────────────────────────────────────────┘
        External (optional): api.qrserver.com · wa.me
```

Design notes:
- Components read data from `useDb()` and permissions from `useAuth()`.
- Multi-collection business rules live in `db.ts`, not in components.
- "Transactions" are sequential writes to `localStorage`; there is no rollback if one fails.
- There is one hard-coded business ID, `biz_main`.

---

## 13. Project Folder/File Structure

```
smartbiz-calculator/
├── index.html                  # Vite HTML entry (title/meta tags)
├── package.json                # Scripts and dependencies
├── bun.lock                    # Bun lockfile (no package-lock.json is shipped)
├── tsconfig.json
├── vite.config.ts              # React + Tailwind plugins, "@" alias
├── metadata.json               # AI Studio app metadata
├── .env.example                # GEMINI_API_KEY / APP_URL (not used by the code)
├── .gitignore
├── public/assets/aistudio/     # Placeholder (.gitignore only)
├── src/
│   ├── main.tsx                # React root
│   ├── App.tsx                 # Providers + tab switching
│   ├── index.css               # Tailwind import + print rules
│   ├── types/index.ts          # All domain interfaces
│   ├── services/db.ts          # localStorage data engine + seed data
│   ├── context/
│   │   ├── AuthContext.tsx     # User, business settings, permissions
│   │   └── DbContext.tsx       # Collections, CRUD actions, sound
│   └── components/
│       ├── layout/AppNavbar.tsx
│       ├── auth/AuthModal.tsx
│       ├── calculator/{SmartCalculator,SaveToCustomerModal}.tsx
│       ├── pos/{QuickSale,BillingView,ThermalReceipt,QrPaymentModal}.tsx
│       ├── customers/CustomerManagement.tsx
│       ├── products/ProductManagement.tsx
│       ├── inventory/InventoryManagement.tsx
│       ├── purchases/PurchaseManagement.tsx
│       ├── returns/ReturnManagement.tsx
│       ├── expenses/ExpenseManagement.tsx
│       ├── dashboard/DashboardOverview.tsx
│       ├── reports/BusinessReports.tsx
│       └── settings/SettingsView.tsx
└── *.md                        # 18 planning/design documents (see note below)
```

> **Documentation note:** the repository root contains documents such as `FIREBASE.md`, `API.md`, `DATABASE.md`, `DEPLOYMENT.md`, `SECURITY.md` and `ROADMAP.md`. Several describe a *planned* Firebase/cloud architecture, REST-style APIs, tests and automated reminders that do **not** exist in the source. Treat them as design/roadmap material, not as a description of the running application.

---

## 14. Installation and Setup Requirements

- **Node.js** — a current LTS release (tested while writing this document with npm 10.9.7). Vite 8 and React 19 require a modern Node version.
- **npm** (or **Bun**, since a `bun.lock` is included; Bun was not available for testing here).
- A modern browser with `localStorage` and Web Audio support.
- Internet access only for the QR payment image and WhatsApp links; the rest works offline once loaded.
- No database, server, API key or environment variable is required.

---

## 15. Step-by-Step Installation Instructions

1. **Get the code**
   ```bash
   git clone <your-repository-url>
   cd smartbiz-calculator
   ```

2. **Install dependencies**

   A plain `npm install` currently **fails** with an `ERESOLVE` peer-dependency conflict (`vite@8` expects `esbuild ^0.27 || ^0.28`, while `package.json` pins the dev dependency `esbuild ^0.25`). Use:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Add the missing peer dependency**

   With `--legacy-peer-deps`, npm does not auto-install `react-is`, which Recharts needs; `vite build` then fails with *"Rolldown failed to resolve import react-is"*. Install it:
   ```bash
   npm install react-is --legacy-peer-deps
   ```
   This sequence was verified: afterwards `npx tsc --noEmit` passes and `npx vite build` succeeds. (The Bun lockfile already includes `react-is`, so `bun install` is expected to avoid both problems, but this was not tested.)

4. **Environment file** — not needed. `.env.example` only lists `GEMINI_API_KEY` and `APP_URL`, which the code never reads.

---

## 16. Database Setup and Configuration

There is **nothing to install or configure**.

- On first load, `DatabaseEngine` seeds demo data into `localStorage` and sets `smartbiz_initialized`.
- **Reset to demo data:** the engine has a `db.resetToDefaults()` method, but nothing in the UI calls it. To reset manually, clear the site's `localStorage` (browser DevTools → Application → Local Storage) and reload.
- **Backup:** Settings → *Backup & Restore Data* → **Download Backup File** writes `smartbiz_backup_<date>.json`.
- **Restore:** Settings → **Choose Backup File** and select a previously exported JSON file. Restore overwrites the collections present in the file.
- Data is per browser and per origin: a different browser, device, private window or port will start with its own seed data.

---

## 17. How to Run the Project

| Command | What it does |
|---|---|
| `npm run dev` | Starts Vite on **http://localhost:3000**, bound to `0.0.0.0` (reachable from other devices on your network) |
| `npm run build` | Production build to `dist/` (verified; main JS bundle ≈ 819 kB, ≈ 219 kB gzipped) |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run lint` | Runs `tsc --noEmit` (type-check only; no ESLint) |
| `npm run clean` | `rm -rf dist server.js` (`server.js` does not exist in this project) |

Then open the app and, if you want to test roles, click the user badge in the top-right corner to open the role switcher.

---

## 18. Main Project Workflow

1. **Open the app** — signed in as the seeded admin; dashboard loads with demo data.
2. **Calculate** — use the Calculator for quick sums, GST or markup; results are logged to history.
3. **Bill** — either *Convert to Bill* from the calculator, or build a bill in **Billing / POS**, or ring up a walk-in in **Quick Sale**.
4. **Complete the sale** — `db.createInvoice` deducts stock, calculates cost and profit, updates the customer's balance/ledger (for non-walk-in customers) and creates a receipt.
5. **Collect payment** — QR Pay shows a QR code; the cashier confirms manually with the **Paid** button. Credit sales stay as customer dues.
6. **Follow up dues** — in **Customers & Udhar**, record payments or open a WhatsApp reminder.
7. **Restock** — low-stock items appear on the Dashboard and Inventory; record a **Purchase** to add stock and supplier dues.
8. **Handle exceptions** — **Returns** for refunds/restocking, **Inventory** adjustments for damaged goods, **Expenses** for running costs.
9. **Review** — Dashboard for today's picture; **Reports** for totals; **Settings → Backup** to export data.

---

## 19. Important Files and Their Purpose

| File | Purpose |
|---|---|
| `src/services/db.ts` | Data engine: `localStorage` access, seed data, invoice/purchase/return/stock/payment transactions, backup helpers (~1,100 lines) |
| `src/context/DbContext.tsx` | React state for all collections, CRUD actions, Web Audio sound effects, JSON export/import |
| `src/context/AuthContext.tsx` | Current user, business settings, role-permission table, `can()` |
| `src/types/index.ts` | TypeScript models for every collection |
| `src/App.tsx` | Providers and tab switching; passes calculator output to billing |
| `src/components/calculator/SmartCalculator.tsx` | Calculator logic and UI (largest component) |
| `src/components/pos/BillingView.tsx` | Full POS billing and invoice archive |
| `src/components/pos/ThermalReceipt.tsx` | Receipt layout, print, WhatsApp share |
| `src/components/pos/QrPaymentModal.tsx` | Builds a `upi://pay` payload and fetches the QR image |
| `src/index.css` | Tailwind import and print stylesheet |
| `vite.config.ts` | Vite plugins, alias, HMR toggle |
| `package.json` / `bun.lock` | Scripts and dependency definitions |

---

## 20. Current Implementation Status

| Area | Status |
|---|---|
| Calculator (arithmetic, GST, memory, GT, tape, history) | ✅ |
| Calculator markup rate | ⚠️ Fixed at 20 % |
| Calculator "Save to Customer" | ⚠️ Routes to Billing only |
| Quick Sale | ✅ (no cash-tendered / change input) |
| Billing / POS and invoice archive | ✅ |
| Receipts (print, WhatsApp text share) | ✅ |
| QR payment dialog | ⚠️ Manual confirmation; external image service |
| Customers, ledger, payment settlement | ✅ |
| Payment reminders | ⚠️ Manual WhatsApp link; stored reminders never shown |
| Products | ✅ |
| Inventory and adjustments | ✅ |
| Purchases | ✅ |
| Supplier payments / supplier ledger view | ❌ |
| Returns | ⚠️ |
| Expenses | ✅ |
| Dashboard | ✅ |
| Reports | ⚠️ |
| Backup / restore | ✅ |
| Staff management (add/edit/remove) | ❌ (read-only list) |
| Authentication | 🖼️ Role switcher only |
| Backend / cloud / AI | ❌ |
| Automated tests | ❌ |

---

## 21. Completed Features

- Shop calculator with GST add/remove, memory, grand total, tape, searchable history and favourites.
- Quick Sale and full Billing/POS with three price tiers, discounts, bill tax, partial and credit payments.
- Atomic-style invoice creation that updates stock, customer balance, ledger and activity log.
- Invoice archive with search, status filter and receipt reprint.
- Thermal-style receipt (58 mm / 80 mm width, A4 option in settings), browser print and WhatsApp text share.
- Customer management with Udhar balances, ledger, payment recording.
- Product catalogue with multi-tier pricing, SKU/barcode text search, favourites, role-based cost hiding.
- Inventory tracking with low-stock warnings, manual adjustments and a movement history.
- Supplier purchases that restock inventory and update purchase prices.
- Expense recording.
- Dashboard KPIs, 7-day area chart and category pie chart.
- Business profile, invoice/receipt configuration, sound toggle.
- JSON backup and restore.
- Responsive layout with mobile navigation menu.

---

## 22. Partially Implemented Features

1. **Authentication and roles.** The role model and permission table exist, but only five checks are enforced (Reports tab, dashboard profit card, product add/delete, product cost visibility, expense delete). Eight permissions are defined but never checked. Any user can switch roles freely.
2. **"Save to Customer" in the calculator.** The button calls `onSaveToCustomer`, which `App.tsx` implements by opening Billing with a single line item. It does not save anything to a customer record. A fuller `SaveToCustomerModal` component exists but is never used.
3. **Payment reminders.** `paymentReminders` records are created when a credit sale leaves a balance and are updated on payments, but no screen displays them, and the customer screen's reminder-modal state is never rendered. Only the one-click WhatsApp link works.
4. **Activity log.** `activityLogs` are written for many actions (up to 500 kept) but there is no screen to view them.
5. **Supplier accounts.** Purchases increase supplier dues and create ledger records, but there is no function or screen to record a payment to a supplier, and supplier ledger entries are not displayed. Supplier dues therefore only grow.
6. **Returns accounting.**
   - `processReturn` reduces the customer's due balance for **every** return (the code comment says "if `credit_adjust`", but the refund method is not checked), so a cash refund also lowers the customer's credit balance.
   - Invoices are always marked `partial_refund`, even for a full return.
   - The return quantity cap is the originally invoiced quantity; earlier returns on the same invoice are not subtracted.
   - Returns are not subtracted from Reports or Dashboard sales/profit.
7. **Reports.**
   - Figures are all-time; there is no date-range filter.
   - **Export CSV** produces a customer-due file only for that report; for every other report tab it exports the P&L summary.
   - **Print Report** calls `window.print()`, but `index.css` hides everything except `.printable-thermal` when printing, so by code inspection a report prints as an empty page. The same applies to the print button in the customer ledger modal.
8. **Quick Sale payment.** The sale is always recorded as fully paid; there is no tendered-cash or change calculation, and the QR **Paid** button simply sets the payment method.
9. **Stock rules.** Selling more than the available stock is allowed; stock is clamped at 0 rather than blocked or warned about.
10. **Custom billing items.** Items coming from the calculator that do not match a product name are billed as `prod_custom`, with cost estimated as 75 % of price for profit purposes, and they do not affect stock.
11. **Walk-in credit.** The Billing screen lets you leave a balance on the Walk-in Customer, but customer balances and ledger are only updated for non-walk-in customers, so that due is not tracked anywhere except the invoice.
12. **Settings.** Staff are listed read-only; `defaultDiscountRate` and `autoPrintReceipt` exist in the data model but have no controls or effect.
13. **Backup format.** The data engine contains a second, versioned backup format (`exportBackup`/`importBackup` with a `data` wrapper), but the UI uses the context's flat export/import instead. Restore performs no schema validation.

---

## 23. Features That Are Not Implemented

- Any server, REST API, or database other than `localStorage`.
- Firebase (Auth, Firestore, Storage, Functions) — documented in `FIREBASE.md` but no Firebase package or code exists.
- Gemini / any AI feature — `@google/genai` and `GEMINI_API_KEY` are unused scaffolding.
- Real user accounts, passwords, password reset, sessions, or multi-user/multi-device sync.
- Invoice cancellation/void (the `cancel_sale` permission and `cancelled` status exist without any feature).
- Supplier payment recording and supplier ledger screen.
- Staff creation, editing, deactivation.
- Product images, expiry-date entry, or camera barcode scanning (fields/types exist for image and expiry, but the product form does not expose them).
- Stock valuation summary.
- Date-range filtering in reports; PDF export.
- The `F2` "Quick Sale" shortcut mentioned in the calculator's help text (no handler exists).
- Hardware integration (receipt-printer drivers, barcode scanner SDKs, cash drawer) — printing uses the browser's print dialog.
- Automated tests, CI/CD, Docker or deployment configuration.

---

## 24. Security Considerations

This application is suitable for local/demo use. It must not be treated as secure for real business data.

- **No authentication.** The password field is ignored. Unknown emails create a session with the **admin** role by default.
- **Client-side authorization only.** Role checks are UI conditionals in the browser; anyone can switch role or edit `localStorage` directly.
- **Unencrypted local data.** Customer names, phone numbers, balances and sales sit in plain JSON in `localStorage`, readable by anyone with access to the browser profile and by any script on the same origin.
- **No backup protection.** Exported JSON files are unencrypted and restore does not validate the contents.
- **Third-party request.** The payment QR is generated by `api.qrserver.com`; the payee identifier, amount, business name and invoice reference are sent in the request URL.
- **QR payload.** The QR encodes a `upi://pay` URI. Compatibility with specific local wallet/bank apps is not verified by the code, and there is no payment verification — "Paid" is a manual button.
- **Expression evaluation.** The calculator evaluates input with `Function(...)` after a strict whitelist regex (digits, whitespace and `+ - * / . ( )` only), which limits the risk, but a purpose-built parser would be safer.
- **Network exposure.** `npm run dev` binds to `0.0.0.0`, making the dev server reachable from other devices on the same network.
- **Seed data.** The demo business details, names, phone numbers and a sample payment identifier are hard-coded in `db.ts`; replace them before real use.

---

## 25. Known Limitations

- Single browser, single device, single business (`biz_main`). Clearing site data deletes everything not backed up.
- `localStorage` size limit (~5 MB); heavy use over time may exceed it, and write failures are only logged.
- Multi-step operations are not transactional; a failure mid-way can leave collections inconsistent.
- Two tabs open at once can overwrite each other's data (no cross-tab synchronisation).
- Document numbers are derived from record counts (e.g. `invoices.length + 1001`), which could produce duplicates if data is edited or imported.
- Cashiers can see purchase cost on the Dashboard low-stock list ("Wholesale Cost") even though the product list hides it.
- The calculator's markup rate is fixed at 20 %.
- Dates use the browser's UTC date (`toISOString()`), so "today" can differ from local date near midnight in some time zones.
- The `@` path alias and several declared dependencies are not used.
- `npm install` needs the workaround described in [Section 15](#15-step-by-step-installation-instructions).
- The main JavaScript bundle is ~819 kB (no code-splitting).
- Reports and ledgers cannot currently be printed (see [Section 22](#22-partially-implemented-features)).
- Not exercised in a live browser or on real printers during this documentation review.

---

## 26. Future Improvements

- Replace the demo login with real authentication and move data to a backend (the cloud design in `FIREBASE.md` is a starting point).
- Enforce permissions on every action, and remove the free role switcher in production builds.
- Add supplier payment recording, supplier ledger views, and invoice void/cancel.
- Correct returns accounting (respect refund method, track cumulative returns, subtract from reports).
- Add date-range filters, full CSV export per report, and fix report/ledger printing (scope the print CSS).
- Surface the activity log and payment reminders in the UI.
- Add a staff-management screen and a "reset demo data" action.
- Expose product expiry and image fields; add camera barcode scanning.
- Block or warn on overselling; add tendered-cash/change to Quick Sale.
- Make the markup rate configurable; implement or remove the `F2` shortcut hint.
- Remove unused dependencies and fix the `esbuild`/`vite` peer conflict so a plain `npm install` works.
- Add automated tests for the transactions in `db.ts` and the calculator logic, and code-split the bundle.

---

## 27. Testing/Verification Information

**No automated tests exist** in the repository (no test runner, test files or CI configuration).

Checks performed while preparing this README:

| Check | Result |
|---|---|
| `npm install` | ❌ Fails with `ERESOLVE` (vite/esbuild peer conflict) |
| `npm install --legacy-peer-deps` | ✅ 220 packages installed |
| `npx tsc --noEmit` (`npm run lint`) | ✅ Passed with no errors |
| `npx vite build` (before adding `react-is`) | ❌ Failed: cannot resolve `react-is` |
| `npx vite build` (after `npm install react-is --legacy-peer-deps`) | ✅ Built; ~819 kB JS / ~52 kB CSS |
| Full read-through of `src/` | ✅ All components, contexts, types and the data engine reviewed |
| Live browser / device / printer testing | ⚠️ Not performed |

**Suggested manual smoke test**

1. Start the app (`npm run dev`) and confirm the Dashboard shows seeded data.
2. Calculator: type `250 × 4 =`, apply 18 % GST, open history, then *Convert to Bill*.
3. Billing: complete a credit sale for a named customer; confirm stock decreases, the customer's due increases and a receipt appears.
4. Customers: record a payment and check the ledger.
5. Purchases: record a purchase and confirm stock increases.
6. Returns: return part of an invoice and check stock and customer balance.
7. Settings: export a backup, clear `localStorage`, reload, restore the file.
8. Switch to the Cashier role and confirm the Reports tab and cost prices are hidden.

---

## 28. Conclusion

SmartBiz is a feature-rich, front-end-only point-of-sale and shop-management prototype. Its calculator, billing, customer-credit, inventory and purchasing workflows are genuinely implemented and share a coherent data layer, and the project type-checks and builds. It is held back from production use by the absence of a backend, real authentication and tests, by a handful of accounting gaps (returns, supplier payments) and unfinished UI paths, and by an install step that currently needs a workaround. Documented honestly as above, it is well suited to a demo, coursework or portfolio submission, and provides a clear foundation to build a backend-backed version on.

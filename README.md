# SMARTBIZ CALCULATOR — Smart Business Management System

> **A production-ready Smart Business Calculator, Point of Sale (POS), Fast Billing, Real-Time Inventory, Customer Udhar Ledger, Supplier Tracking, and Financial Analytics Suite built for shopkeepers and retail businesses.**

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Application Modules](#application-modules)
- [User Roles & Permissions (RBAC)](#user-roles--permissions-rbac)
- [Documentation Index](#documentation-index)
- [License](#license)

---

## Overview

**SMARTBIZ CALCULATOR** bridges the gap between everyday handheld shopkeeper calculators and modern cloud-connected enterprise POS software. Traditional retailers, convenience stores, grocery superstores, and wholesalers often lose revenue due to slow cash calculations, unrecorded credit (*Udhar*), inventory shrink, and disconnected bookkeeping.

SMARTBIZ provides an integrated system that allows shopkeepers to:
1. Perform instant arithmetic, markups (MU), tax additions/removals (GST), and memory operations on a tactile business calculator.
2. Directly convert calculations or shopping tapes into formal POS bills with one tap.
3. Manage walk-in customers and long-term credit ledgers (*Khata/Udhar*) with automated payment reminders and WhatsApp balance receipts.
4. Track multi-tier product pricing (Retail, Wholesale, Special), live stock quantities, minimum stock alerts, and damaged stock adjustments.
5. Record supplier replenishment purchases and accounts payable ledgers.
6. Generate complete Profit & Loss (P&L) statements, cost of goods sold (COGS) tracking, cashier shift activity audits, and thermal receipt printing (58mm/80mm).

---

## Key Features

- **Smart Business Calculator**:
  - Full mathematical engine (+, -, ×, ÷, %, decimal, backspace, clear, all clear).
  - Business functions: Markup (`MU`), Grand Total (`GT`), Memory operations (`M+`, `M-`, `MRC`), and instant GST additions/removals (`+17%`, `-17%` or custom rates).
  - Audit calculation tape with categorized tags (Shopping, Customer, GST, Discount, Profit, Markup).
  - One-tap conversion: Send calculation total directly to Billing or assign to a Customer's Udhar ledger.
  - Responsive Web Audio API acoustic feedback for tactile input confirmation.

- **Dual POS Modes**:
  - **Quick Sale**: High-throughput 5-second walk-in checkout terminal with quick-cash tender buttons and instant change calculation.
  - **Advanced POS Billing**: Multi-item basket, multi-tier pricing, barcode scanning search, customizable item discounts, overall bill discounts, tax handling, and customer selection.

- **Customer Udhar Ledger (Khata)**:
  - Phone and name lookup with instant balance due tracking.
  - Double-entry customer transaction history (Debits, Credits, Running Balance).
  - Payment settlement drawer with custom notes and settlement receipts.
  - Automated payment reminder queue with click-to-WhatsApp balance notifications.

- **Inventory & Catalog Control**:
  - Multi-unit product management (KG, L, PCS, PACK, BOX, GM, MTR).
  - Cost price vs. Retail price margin monitoring (with RBAC masking for cashiers).
  - Low-stock reorder indicators and stock valuation summaries.
  - Batch stock adjustment for damaged, expired, or misplaced goods.

- **Suppliers & Purchase Orders**:
  - Supplier directory and accounts payable tracking.
  - Restocking purchase orders that automatically update inventory quantities and unit cost prices.
  - Supplier ledger accounting for credits and payments.

- **Returns & Refunds**:
  - Return processing for sold goods with restocking vs. damaged flags.
  - Customer credit adjustment or cash refund mechanisms.
  - Linked invoice reconciliation and activity audit logs.

- **Financial Intelligence & Overhead Tracking**:
  - Store expense manager categorized by Rent, Utilities, Salaries, Transport, Supplies, Tea & Refreshments, and Marketing.
  - Net Profit & Loss (P&L) dashboard powered by Recharts (Gross Revenue, COGS, Gross Profit, Expenses, Net Profit).
  - Cashier performance breakdown and CSV export.

- **Role-Based Access Control (RBAC)**:
  - Built-in roles: **Admin (Owner)**, **Manager**, and **Cashier**.
  - Strict security policies: Cashiers cannot inspect purchase costs or company net profit.

- **Offline-First & Data Portability**:
  - Client-side reactive persistence using an event-driven `DatabaseEngine`.
  - Full JSON backup export and zero-loss restore capability.
  - Thermal receipt printing format (58mm, 80mm, and A4) via native CSS media print rules.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript 5/7](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 8](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS 4](https://tailwindcss.com/), `@tailwindcss/vite` |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) |
| **Motion & Transitions** | [Motion](https://motion.dev/) |
| **Charts & Analytics** | [Recharts 3](https://recharts.org/) |
| **Audio Engine** | Web Audio API (Synthesized acoustic tones) |
| **Database Architecture** | Local-First Reactive Database Engine with event-driven subscriptions, ready for Cloud Firestore sync |
| **Server / Proxy** | Express 4, Node.js / Tsx (optional full-stack backend) |

---

## System Architecture

SMARTBIZ CALCULATOR uses a unidirectional data flow and reactive repository architecture:

```
[ User Interaction / UI Components ]
             │
             ▼
[ Context Layer: AuthContext & DbContext ]
             │
             ▼
[ DatabaseEngine (src/services/db.ts) ]
  ├── Atomic Transactions (createInvoice, createPurchase, processReturn)
  ├── Inventory Balance Calculation & COGS Evaluation
  ├── Double-Entry Customer & Supplier Ledger Maintenance
  └── Event Bus (Subscription-based UI Re-rendering)
             │
             ▼
[ Storage Persistence / Firebase Adapter ]
```

For complete architectural details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: `npm`, `yarn`, or `bun`

### 2. Installation

Clone the repository and install all dependencies:

```bash
git clone <repository-url>
cd smartbiz-calculator
npm install
```

### 3. Development Server

Start the local Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:3000` (or the host port configured in your environment).

### 4. Build for Production

Compile TypeScript and build the optimized production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### 5. Type Checking & Verification

Run the TypeScript validator:

```bash
npm run lint
```

For step-by-step setup guides, refer to [SETUP.md](SETUP.md) and [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Application Modules

The application interface is structured into dedicated business modules accessible via the navigation header:

1. **Dashboard** (`/src/components/dashboard/DashboardOverview.tsx`): Real-time KPI counters (Today's Sales, Net Profit, Udhar Outstanding, Low Stock Alerts) and revenue charts.
2. **Smart Calculator** (`/src/components/calculator/SmartCalculator.tsx`): Dual-display business calculator with tape history and direct POS routing.
3. **Quick Sale** (`/src/components/pos/QuickSale.tsx`): Ultra-fast single-screen checkout for counter speed.
4. **Billing / POS** (`/src/components/pos/BillingView.tsx`): Full basket POS with barcode lookup, discounts, customer selection, thermal receipts, and QR payment generation.
5. **Customers** (`/src/components/customers/CustomerManagement.tsx`): Customer directory, credit limits, Udhar settlement, and transaction statements.
6. **Products** (`/src/components/products/ProductManagement.tsx`): SKU, barcode, unit, category, tiered pricing, and margin manager.
7. **Inventory** (`/src/components/inventory/InventoryManagement.tsx`): Stock ledger, damaged item write-offs, and stock adjustments.
8. **Purchases** (`/src/components/purchases/PurchaseManagement.tsx`): Supplier replenishment orders and cost tracking.
9. **Returns** (`/src/components/returns/ReturnManagement.tsx`): Customer sale returns, refund disbursement, and inventory restock handling.
10. **Expenses** (`/src/components/expenses/ExpenseManagement.tsx`): Operating expense logging and category analysis.
11. **Reports** (`/src/components/reports/BusinessReports.tsx`): Financial P&L, sales summaries, and cashier audits.
12. **Settings** (`/src/components/settings/SettingsView.tsx`): Store branding, tax configurations, currency settings, staff accounts, and JSON backup/restore.

---

## User Roles & Permissions (RBAC)

The application provides three built-in roles:

| Privilege | Admin (Owner) | Manager | Cashier |
|---|:---:|:---:|:---:|
| Create & Complete Sales | ✅ | ✅ | ✅ |
| Grant Line / Bill Discounts | ✅ | ✅ | ✅ |
| Record Customer Payments | ✅ | ✅ | ✅ |
| View Customer Due (Udhar) | ✅ | ✅ | ✅ |
| Cancel Invoices / Process Returns | ✅ | ✅ | ❌ |
| View Product Purchase Cost | ✅ | ✅ | ❌ *(Hidden)* |
| View Store Profit & Loss (P&L) | ✅ | ✅ | ❌ *(Hidden)* |
| Manage Staff Accounts | ✅ | ❌ | ❌ |
| Backup & Restore System Data | ✅ | ❌ | ❌ |

For full permission specifications, see [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md).

---

## Documentation Index

Explore the comprehensive system documentation:

- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture, state management, and transaction flows.
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Complete file tree, module roles, and component mapping.
- [SETUP.md](SETUP.md) — Installation, environment configuration, and initial boot.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Coding conventions, scripts, workflow, and styling guide.
- [FIREBASE.md](FIREBASE.md) — Firebase Firestore, Auth, Storage, and Cloud Functions integration blueprint.
- [DATABASE.md](DATABASE.md) — Database schema, data models, entities, and index designs.
- [API.md](API.md) — DatabaseEngine transactional API, service methods, and context hooks.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — Authentication flows, user sessions, and RBAC matrix.
- [CALCULATOR_AND_BILLING.md](CALCULATOR_AND_BILLING.md) — Mathematical engine, tape history, POS billing, and receipt generation.
- [INVENTORY_AND_PURCHASES.md](INVENTORY_AND_PURCHASES.md) — Inventory lifecycle, supplier purchasing, and stock ledger.
- [BUSINESS_INTELLIGENCE.md](BUSINESS_INTELLIGENCE.md) — Reports, P&L calculations, COGS accounting, and charts.
- [SECURITY.md](SECURITY.md) — Security policies, cost masking, data sanitization, and audit logs.
- [TESTING.md](TESTING.md) — Unit testing, component testing, end-to-end flows, and type verification.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Production build, static hosting, Cloud Run, and Firebase Hosting guide.
- [CHANGELOG.md](CHANGELOG.md) — Version history, major updates, and feature progression.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Developer guidelines, pull requests, and commit standards.
- [ROADMAP.md](ROADMAP.md) — Upcoming features, cloud synchronization, and future enhancements.

---

## License

This software is released under the **Apache-2.0 License**. See individual source file headers for license notices.
#   S m a r t B i z P O S - P r o - S y s t e m  
 
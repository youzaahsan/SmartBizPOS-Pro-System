# Project Structure & Directory Blueprint

This document outlines the directory structure, file organization, module responsibilities, and source tree of the **SMARTBIZ CALCULATOR** codebase.

---

## 📌 Table of Contents

- [Repository Tree](#repository-tree)
- [Root Configuration Files](#root-configuration-files)
- [Application Entry Points](#application-entry-points)
- [Context Layer (`src/context/`)](#context-layer-srccontext)
- [Services Layer (`src/services/`)](#services-layer-srcservices)
- [Types & Data Models (`src/types/`)](#types--data-models-srctypes)
- [Component Modules (`src/components/`)](#component-modules-srccomponents)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Repository Tree

```
smartbiz-calculator/
├── .env.example                               # Environment variable templates
├── .gitignore                                 # Git ignore patterns
├── bun.lock                                   # Bun package lockfile
├── index.html                                 # HTML5 entry page with SEO metadata
├── metadata.json                              # AI Studio application descriptor
├── package.json                               # Dependencies and npm script definitions
├── tsconfig.json                              # TypeScript compiler settings
├── vite.config.ts                             # Vite + Tailwind + React plugins configuration
│
├── public/                                    # Public static directory
│   └── assets/
│       └── aistudio/
│           └── .gitignore
│
└── src/                                       # Core application source code
    ├── main.tsx                               # React DOM root mounting script
    ├── App.tsx                                # Main application router & module orchestrator
    ├── index.css                              # Tailwind CSS rules & thermal print styles
    │
    ├── types/                                 # Global TypeScript interfaces & entity types
    │   └── index.ts                           # Comprehensive data model definitions
    │
    ├── services/                              # Core business logic & storage engines
    │   └── db.ts                              # Reactive DatabaseEngine with ACID transactions
    │
    ├── context/                               # React Context state management
    │   ├── AuthContext.tsx                    # Authentication, session & RBAC engine
    │   └── DbContext.tsx                      # Database subscriptions & audio feedback
    │
    └── components/                            # Business UI modules
        ├── auth/
        │   └── AuthModal.tsx                  # Staff login & 1-click role switcher
        ├── calculator/
        │   ├── SmartCalculator.tsx            # Business calculator keypad, tape & functions
        │   └── SaveToCustomerModal.tsx        # Direct calculation to customer assignment
        ├── pos/
        │   ├── BillingView.tsx                # Advanced POS basket, barcode & checkout
        │   ├── QuickSale.tsx                  # Rapid 5-second walk-in checkout terminal
        │   ├── QrPaymentModal.tsx             # Dynamic UPI / Bank QR payment interface
        │   └── ThermalReceipt.tsx             # ESC/POS style 58mm/80mm receipt renderer
        ├── customers/
        │   └── CustomerManagement.tsx         # Customer directory, Udhar ledger & payments
        ├── products/
        │   └── ProductManagement.tsx          # Catalog, tiered prices & stock alerts
        ├── inventory/
        │   └── InventoryManagement.tsx        # Stock ledger, damage write-offs & audits
        ├── purchases/
        │   └── PurchaseManagement.tsx         # Supplier orders, restocking & payables
        ├── returns/
        │   └── ReturnManagement.tsx           # Sale returns, refund ledger & restock
        ├── expenses/
        │   └── ExpenseManagement.tsx          # Overhead expense tracker & categories
        ├── dashboard/
        │   └── DashboardOverview.tsx          # Visual KPI dashboard with Recharts
        ├── reports/
        │   └── BusinessReports.tsx            # Financial P&L statements & cashier audits
        ├── settings/
        │   └── SettingsView.tsx               # Store profile, tax, staff RBAC & backup
        └── layout/
            └── AppNavbar.tsx                  # Header navigation, tab routing & connectivity
```

---

## Root Configuration Files

| File | Purpose |
|---|---|
| `package.json` | Defines project metadata, npm scripts (`dev`, `build`, `lint`, `clean`), and dependencies (`react`, `recharts`, `lucide-react`, `motion`, `tailwindcss`). |
| `tsconfig.json` | Configures TypeScript compilation (`target: ES2022`, `moduleResolution: bundler`, `paths: {"@/*": ["./*"]}`). |
| `vite.config.ts` | Configures the Vite development server on port 3000, host `0.0.0.0`, React plugin, and Tailwind CSS Vite plugin. |
| `index.html` | The single-page application HTML entry document, complete with OpenGraph meta tags, viewport settings, and root `<div id="root"></div>`. |
| `metadata.json` | AI Studio application manifest containing app name, description, and permissions. |
| `.env.example` | Template demonstrating runtime environment variables (`GEMINI_API_KEY`, `APP_URL`). |
| `.gitignore` | Standard Git ignore file preventing `node_modules`, build artifacts (`dist`), and local caches from being tracked. |

---

## Application Entry Points

### `src/main.tsx`
Initializes React 19 by binding `<App />` to the DOM root element (`#root`) within a `<StrictMode>` container.

### `src/App.tsx`
The primary application router and container.
- Wraps the component tree with `<AuthProvider>` and `<DbProvider>`.
- Maintains active navigation tab state (`dashboard`, `calculator`, `quick_sale`, `billing`, `customers`, `products`, `inventory`, `purchases`, `returns`, `expenses`, `reports`, `settings`).
- Passes calculation data between the `SmartCalculator` and `BillingView` when a user chooses to convert a tape calculation into an invoice.
- Controls the visibility of the global `AuthModal`.

### `src/index.css`
Contains:
- Global Tailwind CSS initialization (`@import "tailwindcss";`).
- Custom styling resets and scrollbar designs.
- `@media print` CSS rules that isolate `#thermal-receipt` for physical ESC/POS receipt printing while hiding the rest of the web application.

---

## Context Layer (`src/context/`)

### `src/context/AuthContext.tsx`
- **Responsibilities**: Session state, staff user identities, active business profile, and security permissions.
- **Key Exports**:
  - `useAuth()`: Hook providing access to user identity, business settings, and role switching.
  - `can(permission)`: Core RBAC authorization checker.
  - `isOnline`: Reactive boolean tracking real-time browser network availability.

### `src/context/DbContext.tsx`
- **Responsibilities**: Reactively connects the presentation layer to the `DatabaseEngine`.
- **Key Exports**:
  - `useDb()`: Exposes reactive arrays for all 15 system collections.
  - Mutation handlers: `saveProduct`, `deleteProduct`, `saveCustomer`, `saveExpense`, `saveCalculation`, etc.
  - Audio cues: `playSound('beep' | 'success' | 'cash' | 'error')`.
  - Database utilities: `exportBackup()`, `importBackup()`.

---

## Services Layer (`src/services/`)

### `src/services/db.ts`
The authoritative heart of the local-first application architecture.
- **Seed Data**: Pre-seeded with authentic Pakistani retail goods, customers, suppliers, and users.
- **DatabaseEngine Class**:
  - `createInvoice()`: Transactional sale execution, stock decrement, customer credit calculation, and ledger logging.
  - `recordCustomerPayment()`: Udhar settlement, balance reduction, and ledger posting.
  - `createPurchase()`: Supplier restocking, cost adjustment, and accounts payable ledger.
  - `processReturn()`: Return verification, restocking flag logic, and refund credit adjustment.
  - `adjustStock()`: Damaged or misplaced stock balance correction.
  - `exportBackup()` & `importBackup()`: Complete JSON database backup and restore.
  - `subscribe()` & `notify()`: Reactive pub/sub event bus.

---

## Types & Data Models (`src/types/`)

### `src/types/index.ts`
Centralizes all entity interfaces and types:
- `UserRole`, `User`, `Permission`
- `BusinessSettings`
- `Product`
- `Customer`, `CustomerLedgerEntry`
- `Supplier`, `SupplierLedgerEntry`
- `Invoice`, `InvoiceItem`, `PaymentMethod`
- `Purchase`, `PurchaseItem`
- `SaleReturn`, `ReturnItem`
- `Expense`
- `InventoryTransaction`
- `CalculationRecord`
- `PaymentReminder`
- `ActivityLog`

For in-depth schema documentation, see [DATABASE.md](DATABASE.md).

---

## Component Modules (`src/components/`)

### 1. Auth Module (`src/components/auth/`)
- **`AuthModal.tsx`**: Staff credential login modal with one-click demo role switching between Admin, Manager, and Cashier for instant testing of permission boundaries.

### 2. Calculator Module (`src/components/calculator/`)
- **`SmartCalculator.tsx`**: Dual-line business calculator with tactile keypad, memory registers, markup (`MU`), grand total (`GT`), tax shortcuts (+17% GST, -17% GST), and categorized calculation tape.
- **`SaveToCustomerModal.tsx`**: Modal facilitating direct transfer of a calculated total into a customer's Udhar ledger.

### 3. POS & Billing Module (`src/components/pos/`)
- **`BillingView.tsx`**: Full-fledged POS terminal featuring barcode product lookup, multi-tier pricing selector, quantity controls, line item discounts, bill discounts, and customer linking.
- **`QuickSale.tsx`**: Streamlined rapid checkout interface for high-traffic peak hours with quick cash buttons (Rs. 500, Rs. 1,000, Rs. 5,000) and change display.
- **`QrPaymentModal.tsx`**: Renders scan-and-pay QR codes linked to the store's configured UPI/bank ID.
- **`ThermalReceipt.tsx`**: ESC/POS thermal receipt formatting component supporting 58mm and 80mm paper widths with direct WhatsApp sharing.

### 4. Customer Module (`src/components/customers/`)
- **`CustomerManagement.tsx`**: Customer directory, Udhar accounts list, full ledger transaction statement, payment settlement modal, and click-to-WhatsApp balance reminders.

### 5. Catalog Module (`src/components/products/`)
- **`ProductManagement.tsx`**: Product directory with category filters, unit selection, purchase vs. retail margin display, low stock badges, and add/edit product modal.

### 6. Inventory Module (`src/components/inventory/`)
- **`InventoryManagement.tsx`**: Live stock levels, total inventory valuation, transaction audit history, and damaged stock adjustment forms.

### 7. Purchases Module (`src/components/purchases/`)
- **`PurchaseManagement.tsx`**: Supplier directory, purchase order creation, automatic stock level incrementing, and accounts payable ledger.

### 8. Returns Module (`src/components/returns/`)
- **`ReturnManagement.tsx`**: Return processing terminal linked to original invoices, with restock decision toggles and customer credit adjustments.

### 9. Expenses Module (`src/components/expenses/`)
- **`ExpenseManagement.tsx`**: Store overhead tracking (Rent, Electricity, Salaries, Refreshments) with expense breakdown summaries.

### 10. Dashboard Module (`src/components/dashboard/`)
- **`DashboardOverview.tsx`**: Executive overview displaying today's sales, gross profit, outstanding Udhar, low stock alerts, quick action shortcuts, and 7-day sales charts.

### 11. Reports Module (`src/components/reports/`)
- **`BusinessReports.tsx`**: Comprehensive financial reporting engine with P&L statements, COGS analysis, category revenue breakdown, and staff sales audits.

### 12. Settings Module (`src/components/settings/`)
- **`SettingsView.tsx`**: Business profile manager, tax rate settings, receipt printer customization, staff user management, and JSON backup export/import.

### 13. Layout Module (`src/components/layout/`)
- **`AppNavbar.tsx`**: Persistent navigation header with active tab highlighting, network status indicator, current staff avatar, and one-click role switcher trigger.

---

## Cross-Document Navigation

- [README.md](README.md) — System introduction and feature summary.
- [ARCHITECTURE.md](ARCHITECTURE.md) — Architectural patterns and data flow.
- [DATABASE.md](DATABASE.md) — Schema definitions and collection models.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Developer setup and engineering workflow.
- [CALCULATOR_AND_BILLING.md](CALCULATOR_AND_BILLING.md) — Calculator and POS deep dive.

# Changelog

All notable changes to the **SMARTBIZ CALCULATOR** project are documented in this file.

The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (`MAJOR.MINOR.PATCH`).

---

## 📌 Table of Contents

- [Version 1.0.0 — Production Release](#version-100--production-release)
- [Version 0.9.0 — Beta POS & Ledger Integration](#version-090--beta-pos--ledger-integration)
- [Version 0.5.0 — Core Calculator & Storage Engine](#version-050--core-calculator--storage-engine)
- [Cross-Document Navigation](#cross-document-navigation)

---

## [1.0.0] — 2026-10-09

### 🎉 Initial Production Release

#### Added
- **Smart Business Calculator**:
  - Dual-line display showing real-time expression tape and accumulated formatted result.
  - Complete arithmetic operations: `+`, `-`, `×`, `÷`, `%`, `.`, `C`, `AC`, `⌫`.
  - Business functions: Markup (`MU`), Grand Total (`GT`), Memory registers (`M+`, `M-`, `MRC`).
  - Instant tax calculations: `+17% GST` (tax-inclusive) and `-17% GST` (tax extraction).
  - Categorized calculation tape history with favorite tagging (`calculations` collection).
  - Web Audio API acoustic feedback synthesizer for tactile keypad clicks and cash sounds.
  - Direct conversion bridges: **"Convert to Bill"** and **"Save to Customer (Udhar)"**.

- **Dual POS Terminals**:
  - **Quick Sale**: 5-second walk-in checkout terminal with quick-cash tender buttons (Rs. 500, Rs. 1,000, Rs. 2,000, Rs. 5,000) and change due calculator.
  - **Advanced POS Billing**: Multi-item basket, hardware barcode scanner support, multi-tier pricing selector (Retail, Wholesale, Special), line item discounts, whole-bill discounts, tax rate handling, and customer selection.

- **Thermal Receipts & Digital Payments**:
  - ESC/POS thermal receipt formatting for 58mm and 80mm paper widths.
  - Native browser `@media print` CSS isolation.
  - Click-to-WhatsApp balance and receipt sharing links.
  - Dynamic QR payment code generation (`QrPaymentModal.tsx`) supporting Raast, Easypaisa, JazzCash, UPI, and Bank IBAN.

- **Customer Udhar & Khata Ledger**:
  - Searchable customer directory with phone and address records.
  - Double-entry ledger (`customerLedger`) tracking debits, credits, and running balances.
  - Payment settlement drawer with custom memos and settlement receipts.
  - Automated payment reminder queue with WhatsApp dispatch.

- **Product Catalog & Live Inventory**:
  - Product management with SKU, barcode, unit (`KG`, `L`, `PCS`, `PACK`, `BOX`, `GM`, `MTR`), and category.
  - Wholesale cost vs. retail price margin monitoring.
  - Stock movement transaction ledger (`inventoryTransactions`).
  - Damage write-offs and manual recount adjustment tools.
  - Low-stock visual badges and dashboard alerts.
  - Real-time inventory asset valuation (Cost vs. Retail potential).

- **Suppliers, Purchases & Returns**:
  - Supplier directory and accounts payable tracking.
  - Restocking purchase orders (`PUR-XXXX`) that atomically increment inventory counts and update purchase costs.
  - Sales returns processing (`RET-XXXX`) with restockable vs. damaged goods toggles and credit reconciliation.

- **Overheads & Financial Intelligence**:
  - Operating expense tracker categorized by Rent, Utilities, Salaries, Transport, Supplies, and Tea & Refreshments.
  - Comprehensive Profit & Loss (P&L) statements calculating Gross Revenue, COGS, Gross Profit, Operating Overheads, and Net Profit.
  - Interactive Recharts analytics for 7-day sales trends and category distributions.
  - Staff cashier sales volume audits.

- **Security & Role-Based Access Control (RBAC)**:
  - Three distinct roles: **Admin (Owner)**, **Manager**, and **Cashier**.
  - Strict purchase cost masking ensuring cashiers cannot view wholesale acquisition prices.
  - Profit and loss reporting restrictions.
  - 1-Click staff role switcher (`AuthModal.tsx`) for fast counter shift handovers.
  - Immutable activity audit log (`activityLogs`).

- **Data Portability & Offline Engine**:
  - Event-driven, local-first `DatabaseEngine` with real-time pub/sub subscriptions.
  - Full-system JSON backup export and schema-validated restore.
  - Factory demo reset capability.

---

## [0.9.0] — 2026-10-01

### 🚀 Beta POS & Ledger Integration

#### Added
- Double-entry ledger records for customers and suppliers.
- Advanced POS basket with multi-tier price selection.
- ESC/POS thermal receipt layout styles.
- Recharts visualizations on the executive dashboard.

#### Changed
- Upgraded Tailwind CSS to v4 with `@tailwindcss/vite`.
- Replaced third-party audio files with native Web Audio API oscillators.

---

## [0.5.0] — 2026-09-20

### 🛠️ Core Calculator & Storage Engine

#### Added
- Foundational `DatabaseEngine` prototype with `localStorage` key-value persistence.
- Initial calculator arithmetic parser and expression tape.
- Basic product catalog and customer list interfaces.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [ROADMAP.md](ROADMAP.md) — Future releases and feature roadmap.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines.

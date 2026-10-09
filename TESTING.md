# Testing Strategy & Quality Assurance

This document details the testing methodologies, type verification procedures, transactional test cases, and manual QA checklists for **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Testing Strategy Overview](#testing-strategy-overview)
- [Static Type Verification (`npm run lint`)](#static-type-verification-npm-run-lint)
- [Unit Testing Core Logic](#unit-testing-core-logic)
  - [1. Calculator Evaluation & Business Math](#1-calculator-evaluation--business-math)
  - [2. Tax (GST) Calculations](#2-tax-gst-calculations)
  - [3. Markup (`MU`) Formula](#3-markup-mu-formula)
- [Transactional Integration Testing](#transactional-integration-testing)
  - [1. Sale Creation & Inventory Decrement](#1-sale-creation--inventory-decrement)
  - [2. Customer Udhar Balance & Ledger Balancing](#2-customer-udhar-balance--ledger-balancing)
  - [3. Supplier Purchase & Stock Replenishment](#3-supplier-purchase--stock-replenishment)
  - [4. Sales Return & Restocking Logic](#4-sales-return--restocking-logic)
- [Role-Based Access Control (RBAC) Testing](#role-based-access-control-rbac-testing)
- [Manual Counter QA Checklist](#manual-counter-qa-checklist)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Testing Strategy Overview

Because retail POS systems process real financial transactions and inventory movements, software defects directly impact cash drawers and shelf stock accuracy. The testing strategy combines:
1. **Static Type Safety**: Comprehensive TypeScript type checking.
2. **Deterministic Transaction Testing**: Validating atomic state mutations in `DatabaseEngine`.
3. **Permission Boundary Verification**: Ensuring cashiers cannot access cost or profit data.
4. **Counter QA Verification**: Real-world hardware and workflow verification (barcode scanners, thermal printers, keyboard shortcuts).

---

## Static Type Verification (`npm run lint`)

Static type verification guarantees that all component props, entity interfaces, and transaction parameters strictly adhere to the contracts defined in `/src/types/index.ts`.

Run type checking across the entire repository:

```bash
npm run lint
```

Output:
```
> react-example@0.0.0 lint
> tsc --noEmit
```

*A clean exit code (`0`) confirms that there are zero TypeScript compiler warnings or interface mismatches.*

---

## Unit Testing Core Logic

### 1. Calculator Evaluation & Business Math
- **Order of Operations**: Verify expressions such as `250 + 50 * 2` evaluate correctly.
- **Percentage Evaluation**: Verify `1000 + 15%` yields `1,150`, and `1000 - 15%` yields `850`.
- **Memory Operations**: Verify `M+` increments accumulator, `M-` decrements, and `MRC` recalls and clears on consecutive taps.

### 2. Tax (GST) Calculations
- **GST Addition (`+17%`)**:
  $$\text{Net} = 100 \implies \text{Gross} = 100 \times 1.17 = 117$$
- **GST Extraction (`-17%`)**:
  $$\text{Gross} = 117 \implies \text{Net} = \frac{117}{1.17} = 100$$
  $$\text{Tax Extracted} = 117 - 100 = 17$$

### 3. Markup (`MU`) Formula
- Given Cost = `800` and Margin Target = `20%`:
  $$\text{Retail} = \frac{800}{1 - 0.20} = \frac{800}{0.80} = 1,000$$
  $$\text{Gross Margin} = \frac{1,000 - 800}{1,000} = 20.0\%$$

---

## Transactional Integration Testing

The following automated or manual integration tests verify state consistency in `src/services/db.ts`:

### 1. Sale Creation & Inventory Decrement
**Scenario**: Selling 5 units of Sugar (`prod_1`, initial stock = 250).
- **Execution**: Call `db.createInvoice()`.
- **Assertions**:
  - `products.find(p => p.id === 'prod_1').stockQuantity === 245`.
  - An `InventoryTransaction` of type `'sale'` exists with `quantityDelta === -5`.
  - `invoice.totalCost === 5 * 140 === 700`.
  - `invoice.grossProfit === (5 * 180) - 700 === 200`.

### 2. Customer Udhar Balance & Ledger Balancing
**Scenario**: Customer *Ali Khan* buys Rs. 2,000 on credit and pays Rs. 500 cash.
- **Execution**: Create invoice with `paidAmount: 500`, `dueAmount: 1500`.
- **Assertions**:
  - Customer's `totalDue` increments by exactly `1500`.
  - A `CustomerLedgerEntry` is created with `debit: 2000`, `credit: 500`, and `balance: previousDue + 1500`.
  - A `PaymentReminder` entry is queued with `status: 'pending'`.

### 3. Supplier Purchase & Stock Replenishment
**Scenario**: Purchasing 50 units of Rice from *Chaudhry Rauf Sugar Mills*.
- **Execution**: Call `db.createPurchase()`.
- **Assertions**:
  - Product stock increments by `+50`.
  - Supplier `totalPurchases` and `totalDue` update accordingly.
  - A `SupplierLedgerEntry` is recorded with `credit: totalAmount`.

### 4. Sales Return & Restocking Logic
**Scenario**: Customer returns 1 damaged item and 1 salable item.
- **Execution**: Call `db.processReturn()` with `item1.restock = true` and `item2.restock = false`.
- **Assertions**:
  - `item1` stock increases by `+1`.
  - `item2` stock remains unchanged.
  - Customer's debt balance decreases by the refund amount if `credit_adjust` was selected.

---

## Role-Based Access Control (RBAC) Testing

| Test Case | Actor Role | Expected Behavior |
|---|:---:|---|
| Inspect Product Catalog | `cashier` | Purchase Cost column is hidden/masked with *Confidential* badge. |
| Inspect Product Catalog | `manager` | Purchase Cost (Rs. 140) is visible in plain text. |
| Access Reports & P&L | `cashier` | Access denied banner rendered; P&L charts hidden. |
| Access Reports & P&L | `admin` | Full P&L statement, COGS, and Net Profit rendered. |
| Staff Management Tab | `manager` | Disabled or omitted from settings screen. |
| Staff Management Tab | `admin` | Full staff list and role configuration available. |

---

## Manual Counter QA Checklist

Before deploying updates to an active counter terminal, perform this 5-minute QA smoke test:

- [ ] **1. Quick Sale Test**:
  - Open **Quick Sale**.
  - Type `1500`, press Quick Cash `2000`, verify change due shows `500`.
  - Press Enter to complete sale; verify cash chime audio cue plays.
- [ ] **2. Advanced POS Basket Test**:
  - Open **Billing**.
  - Search product by typing barcode `89640001`.
  - Select *Wholesale* pricing tier; verify unit price adjusts to Rs. 165.
  - Apply 5% item discount; verify totals recalculate immediately.
- [ ] **3. Customer Udhar Settlement**:
  - Open **Customers**.
  - Select *Ali Khan*, click **Settle Payment**.
  - Enter Rs. 1,000 cash; verify outstanding balance decreases by Rs. 1,000.
  - Check transaction history in ledger.
- [ ] **4. Thermal Print Layout**:
  - Complete an invoice and click **Print Receipt**.
  - Verify browser print preview formats cleanly for 80mm paper width without clipping.
- [ ] **5. Backup & Restore Verification**:
  - Go to **Settings** > **Backup**.
  - Click **Download JSON Backup**.
  - Verify downloaded `.json` contains all 15 collections.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Engineering workflows and scripts.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — RBAC definitions.
- [CALCULATOR_AND_BILLING.md](CALCULATOR_AND_BILLING.md) — Calculator operations.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Production release verification.

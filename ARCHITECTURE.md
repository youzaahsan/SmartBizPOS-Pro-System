# System Architecture & Technical Design

This document details the software architecture, data flow patterns, transaction guarantees, and component topology of the **SMARTBIZ CALCULATOR** system.

---

## 📌 Table of Contents

- [Architectural Overview](#architectural-overview)
- [Layered Architecture Pattern](#layered-architecture-pattern)
- [Unidirectional Data Flow & State Management](#unidirectional-data-flow--state-management)
- [The Event-Driven Database Engine](#the-event-driven-database-engine)
- [Transactional Integrity & Business Flows](#transactional-integrity--business-flows)
  - [1. POS Sale & Invoice Generation](#1-pos-sale--invoice-generation)
  - [2. Customer Payment & Udhar Settlement](#2-customer-payment--udhar-settlement)
  - [3. Supplier Purchase & Stock Replenishment](#3-supplier-purchase--stock-replenishment)
  - [4. Sales Return & Inventory Restoration](#4-sales-return--inventory-restoration)
  - [5. Stock Adjustment (Damage / Misplacement)](#5-stock-adjustment-damage--misplacement)
- [Audio Subsystem Architecture](#audio-subsystem-architecture)
- [Print & Thermal Receipt Architecture](#print--thermal-receipt-architecture)
- [Scalability & Cloud Migration Architecture](#scalability--cloud-migration-architecture)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Architectural Overview

SMARTBIZ CALCULATOR is engineered with an **Offline-First, Reactive Repository Architecture**. Because physical retail counters cannot tolerate network latency or intermittent internet dropouts, data operations are executed synchronously against a structured in-memory repository synchronized with persistent browser storage and an event bus for real-time reactivity.

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  [Smart Calculator] [Quick Sale] [POS Billing] [Customer Udhar] │
│  [Inventory Ledger] [Purchases]  [Returns]     [P&L Reports]    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ React Hooks
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION CONTEXT LAYER                   │
│         [AuthContext.tsx]             [DbContext.tsx]           │
│    (Session, RBAC, Permissions)  (Data Collections & Sound)     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Synchronous Invocations & Subscriptions
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE & TRANSACTION LAYER                    │
│                     DatabaseEngine (src/services/db.ts)         │
│  ├── Atomic Sale & Invoice Generator                            │
│  ├── Double-Entry Customer & Supplier Ledger Maintenance        │
│  ├── FIFO/Average COGS & Gross Profit Computer                  │
│  ├── Real-time Inventory Delta Tracking                         │
│  └── Pub/Sub Event Notification Bus                             │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Storage Drivers
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE ENGINE                         │
│   [LocalStorage Storage Driver]  ──▶  [Cloud Firestore Sync]    │
│   [JSON Full Backup / Restore]   ──▶  [Firebase Auth & Storage] │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layered Architecture Pattern

The codebase is organized into four clearly demarcated layers:

### 1. Presentation Layer (`src/components/`)
- Encapsulates UI presentation, keyboard input capture, calculation displays, and responsive layouts.
- Completely decoupled from direct storage mechanics; all operations invoke functions provided by React Context hooks (`useDb` and `useAuth`).
- Responsive on mobile screens, counter tablets, and large desktop cash desks.

### 2. State & Context Layer (`src/context/`)
- **`AuthContext`**: Manages the current authenticated staff member, active business settings, network connectivity status (`navigator.onLine`), and the permission authorization engine (`can(permission)`).
- **`DbContext`**: Exposes reactive state hooks for all 15 business collections, manages audio effects, and provides transactional execution triggers. Subscribes to collection mutations emitted by the underlying engine.

### 3. Business Logic & Transaction Layer (`src/services/db.ts`)
- Houses the `DatabaseEngine` singleton (`db`).
- Contains the authoritative business logic:
  - Sequence-safe invoice, purchase, and return numbering (`SB-1001`, `PUR-5001`, `RET-3001`).
  - Cost of Goods Sold (COGS) derivation based on authoritative product purchase prices.
  - Multi-tier price validation (retail, wholesale, special).
  - Synchronous double-entry customer credit and debit balancing.
  - Audit activity logging.

### 4. Persistence & Storage Layer
- Prefixed key-value storage engine (`smartbiz_*`).
- Deterministic JSON serializer and deserializer with schema verification.
- Event listener bus enabling instant cross-tab and cross-component reactivity without manual page reloads.

---

## Unidirectional Data Flow & State Management

The application follows strict unidirectional data flow:

```
[ User Interaction ] 
        │
        ▼
[ Context Action (e.g. saveProduct, createInvoice) ]
        │
        ▼
[ DatabaseEngine Method ]
        │
        ├─▶ 1. Validate inputs and calculate derived financial metrics
        ├─▶ 2. Update target collection and related collections (Ledgers, Inventory)
        ├─▶ 3. Commit serialized payload to Storage Engine
        ├─▶ 4. Record Activity Log entry
        └─▶ 5. Emit event to registered subscribers for each modified collection
        │
        ▼
[ DbContext State Update ]
        │
        ▼
[ Component Re-render ]
```

### Pub/Sub Event Mechanism

```typescript
// Pattern in src/services/db.ts
private listeners: Map<string, Array<() => void>> = new Map();

public subscribe(collection: string, callback: () => void): () => void {
  if (!this.listeners.has(collection)) {
    this.listeners.set(collection, []);
  }
  this.listeners.get(collection)!.push(callback);
  return () => {
    // Unsubscribe cleanup
    const subs = this.listeners.get(collection) || [];
    this.listeners.set(collection, subs.filter((cb) => cb !== callback));
  };
}

private notify(collection: string): void {
  const subs = this.listeners.get(collection);
  if (subs) {
    subs.forEach((cb) => cb());
  }
}
```

Whenever any transaction mutates a collection (such as `invoices` or `products`), `this.notify('products')` fires immediately. In `DbContext.tsx`, active subscriptions update the corresponding React state hooks, triggering an instant, non-blocking UI update.

---

## Transactional Integrity & Business Flows

### 1. POS Sale & Invoice Generation
When an order is completed via the POS Billing Terminal or Quick Sale module:

1. **Numbering**: Generates a continuous sequence invoice ID formatted as `${invoicePrefix}${sequence}` (e.g., `SB-1001`).
2. **Authoritative Costing**: Resolves the true `purchasePrice` of each product from the authoritative catalog. Calculates `totalCost` (COGS) and `grossProfit = grandTotal - totalCost`.
3. **Inventory Decrement**: For each sold product:
   - Decrements `stockQuantity = Math.max(0, currentStock - quantity)`.
   - Records an `InventoryTransaction` of type `'sale'` with `quantityDelta = -quantity`.
4. **Customer Credit / Udhar Posting**:
   - If the customer is not a guest walk-in (`customerId !== 'cust_walkin'`), increments `totalPurchases += grandTotal`, `totalPaid += paidAmount`, and `totalDue += dueAmount`.
   - Generates a `CustomerLedgerEntry` recording the debit, credit, and new running balance.
   - If an unpaid balance exists (`dueAmount > 0`), updates or queues a `PaymentReminder`.
5. **Audit Trail**: Writes an `ActivityLog` entry recording the cashier's identity, timestamp, and invoice totals.

### 2. Customer Payment & Udhar Settlement
When a customer settles their balance:

1. Increments customer `totalPaid += amount`.
2. Decrements customer `totalDue = Math.max(0, currentDue - amount)`.
3. Appends a `CustomerLedgerEntry` of type `'payment'` with `debit = 0`, `credit = amount`, and new running balance.
4. Updates the associated `PaymentReminder` record; marks status as `'resolved'` when `totalDue === 0`.
5. Emits notifications to `customers`, `customerLedger`, `paymentReminders`, and `activityLogs`.

### 3. Supplier Purchase & Stock Replenishment
When new stock arrives from a supplier:

1. Assigns a sequential purchase order ID (`PUR-5001`).
2. Updates catalog inventory:
   - Increments product stock: `stockQuantity += quantity`.
   - Updates `purchasePrice` if the supplier price changed.
   - Appends an `InventoryTransaction` of type `'purchase'`.
3. Updates Supplier accounts payable:
   - Increments `totalPurchases += totalAmount`, `totalPaid += paidAmount`, and `totalDue += dueAmount`.
   - Posts a `SupplierLedgerEntry` recording the transaction.

### 4. Sales Return & Inventory Restoration
When a customer returns items:

1. Generates sequential return record (`RET-3001`).
2. Checks the `restock` flag for each item:
   - If `true`: Increments `stockQuantity` and logs an `InventoryTransaction` of type `'return'`.
   - If `false` (damaged/spoiled goods): Inventory count remains untouched; item is logged for write-off.
3. Adjusts payment / customer account:
   - If refund method is `credit_adjust`, reduces customer `totalDue` and posts a ledger adjustment.
   - Updates the parent invoice status to `'partial_refund'`.

### 5. Stock Adjustment (Damage / Misplacement)
When manual inventory audits uncover discrepancies:

1. Calculates `newStock = Math.max(0, prevStock + quantityDelta)`.
2. Updates product record.
3. Appends an `InventoryTransaction` with type `'damaged'` or `'adjustment'`, preserving the audit trail.

---

## Audio Subsystem Architecture

SMARTBIZ incorporates synthesized acoustic feedback for POS speed and keyboard assurance without downloading external audio assets.

- **Technology**: Native browser `AudioContext` / `webkitAudioContext`.
- **Oscillator Types**: High-frequency sine wave oscillators modulated by short attack/decay gain envelopes.
- **Synthesized Sound Profiles**:
  - `beep`: 800Hz tone for 50ms (Keypad clicks).
  - `success`: Two-stage harmonic chime (523.25Hz `C5` rising to 659.25Hz `E5`) for completed actions.
  - `cash`: Frequency ramp from 987.77Hz (`B5`) to 1318.51Hz (`E6`) for sales and cash transactions.
  - `error`: Low 220Hz buzz (`A3`) for input mistakes.
- **Control**: Toggleable via `soundEnabled` in store settings; respects mute configurations.

---

## Print & Thermal Receipt Architecture

The application includes native thermal receipt generation for physical receipt printers (58mm, 80mm, and A4 desktop printing) without third-party printer drivers.

```css
/* Print rules in src/index.css */
@media print {
  body * {
    visibility: hidden;
  }
  #thermal-receipt, #thermal-receipt * {
    visibility: visible;
  }
  #thermal-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
}
```

The receipt component (`/src/components/pos/ThermalReceipt.tsx`) mounts an isolated DOM container rendered according to standard ESC/POS layout formatting:
- Store header, tax ID, and address.
- Itemized tabular list (Qty × Unit Price = Total).
- Item discounts, bill discount, subtotal, and tax breakdowns.
- Payment method, amount paid, and change returned / Udhar balance due.
- Store return policy footer and dynamic QR payment code.

---

## Scalability & Cloud Migration Architecture

While SMARTBIZ is deployed in a fast local-first mode, its interface contracts and data models were designed from day one for seamless cloud backend integration with **Google Cloud & Firebase**:

1. **Entity Models**: All entities (`Invoice`, `Product`, `Customer`, etc.) use flat, document-oriented structures with standardized `businessId` partitioning.
2. **Identity**: IDs use timestamp-prefixed UUIDs compatible with Firestore document IDs.
3. **Cloud Functions Ready**: Transaction methods (`createInvoice`, `createPurchase`, `processReturn`) map 1:1 to callable Firebase Cloud Functions.
4. **Security Rules**: Role-based access rules can be applied at the Firestore collection level directly matching `ROLE_PERMISSIONS`.

For comprehensive details on the cloud architecture and integration plan, see [FIREBASE.md](FIREBASE.md).

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Complete file tree and directory map.
- [DATABASE.md](DATABASE.md) — Schema definitions and collection documentation.
- [API.md](API.md) — Context API and engine method signatures.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — RBAC and security layer.
- [CALCULATOR_AND_BILLING.md](CALCULATOR_AND_BILLING.md) — POS and calculator specifications.
- [SECURITY.md](SECURITY.md) — System security policies and audit features.

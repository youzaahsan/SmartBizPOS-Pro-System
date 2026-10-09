# Application Programming Interface (API) Reference

This document provides a comprehensive API specification for the **DatabaseEngine** service layer and the React Context hooks (`useDb` and `useAuth`) powering **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [API Architecture Overview](#api-architecture-overview)
- [`DatabaseEngine` Authoritative API (`src/services/db.ts`)](#databaseengine-authoritative-api-srcservicesdbts)
  - [1. `createInvoice()`](#1-createinvoice)
  - [2. `recordCustomerPayment()`](#2-recordcustomerpayment)
  - [3. `createPurchase()`](#3-createpurchase)
  - [4. `processReturn()`](#4-processreturn)
  - [5. `adjustStock()`](#5-adjuststock)
  - [6. `logActivity()`](#6-logactivity)
  - [7. `exportBackup()` & `importBackup()`](#7-exportbackup--importbackup)
  - [8. `resetToDefaults()`](#8-resettodefaults)
  - [9. Low-Level Methods (`get`, `set`, `subscribe`)](#9-low-level-methods-get-set-subscribe)
- [`useDb` React Context Hook (`src/context/DbContext.tsx`)](#usedb-react-context-hook-srccontextdbcontexttsx)
- [`useAuth` React Context Hook (`src/context/AuthContext.tsx`)](#useauth-react-context-hook-srccontextauthcontexttsx)
- [Server-Side Endpoints (Express Proxy)](#server-side-endpoints-express-proxy)
- [Cross-Document Navigation](#cross-document-navigation)

---

## API Architecture Overview

The system operates on an authoritative service API contract. All components call operations either through `useDb()` or `useAuth()`, which wrap the `DatabaseEngine` singleton (`db`).

---

## `DatabaseEngine` Authoritative API (`src/services/db.ts`)

### 1. `createInvoice()`
Atomically creates a sales invoice, decrements catalog inventory, calculates true COGS and gross profit, posts customer credit/Udhar if applicable, creates customer ledger entries, updates payment reminders, and appends to the audit log.

#### Signature:
```typescript
public createInvoice(
  invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>,
  actor: { id: string; name: string; role: any }
): Invoice
```

#### Parameters:
- `invoiceData`: Invoice payload containing:
  - `customerId`, `customerName`, `date`, `items` (`InvoiceItem[]`), `subtotal`, `itemDiscountsTotal`, `billDiscount`, `billDiscountType`, `taxTotal`, `grandTotal`, `paidAmount`, `dueAmount`, `paymentStatus`, `paymentMethod`, `notes`.
- `actor`: Identity of the cashier or staff member processing the sale (`{ id, name, role }`).

#### Return Value:
- `Invoice`: The fully committed invoice with generated `id`, sequential `invoiceNumber` (e.g., `SB-1001`), server-calculated `totalCost`, `grossProfit`, and `createdAt` timestamp.

---

### 2. `recordCustomerPayment()`
Processes a customer debt payment (*Udhar* settlement), increments total paid, reduces outstanding balance, and logs a double-entry customer ledger transaction.

#### Signature:
```typescript
public recordCustomerPayment(
  customerId: string,
  amount: number,
  paymentMethod: any,
  notes: string,
  actor: { id: string; name: string; role: any }
): void
```

#### Parameters:
- `customerId`: Unique ID of the customer settling payment.
- `amount`: Monetary payment amount.
- `paymentMethod`: Method of tender (`cash`, `bank_transfer`, `upi_qr`, etc.).
- `notes`: Transaction memo or receipt note.
- `actor`: Identity of the staff member recording payment.

#### Side Effects:
- Decrements customer's `totalDue` balance.
- Creates a `CustomerLedgerEntry` with `debit = 0` and `credit = amount`.
- Updates associated `PaymentReminder` to `'resolved'` if `totalDue` reaches 0.
- Appends to `activityLogs`.

---

### 3. `createPurchase()`
Records a supplier restocking order, increments inventory stock levels, updates product cost prices, updates supplier accounts payable, and logs a supplier ledger entry.

#### Signature:
```typescript
public createPurchase(
  purchaseData: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>,
  actor: { id: string; name: string; role: any }
): Purchase
```

#### Parameters:
- `purchaseData`: Purchase order payload containing `supplierId`, `supplierName`, `date`, `items`, `totalAmount`, `paidAmount`, `dueAmount`, `paymentMethod`, `notes`.
- `actor`: Identity of the purchasing manager or owner.

#### Return Value:
- `Purchase`: Fully persisted purchase order containing generated `purchaseNumber` (e.g., `PUR-5001`).

---

### 4. `processReturn()`
Handles customer merchandise returns, optionally restocks salable items back into inventory, calculates customer credit or cash refund, updates the original invoice status, and records ledger entries.

#### Signature:
```typescript
public processReturn(
  returnData: Omit<SaleReturn, 'id' | 'returnNumber' | 'createdAt'>,
  actor: { id: string; name: string; role: any }
): SaleReturn
```

#### Parameters:
- `returnData`: Return payload containing `invoiceId`, `invoiceNumber`, `customerId`, `items` (each with `restock: boolean`), `totalRefund`, `refundMethod`, `reason`.
- `actor`: Staff member authorizing the return.

#### Return Value:
- `SaleReturn`: The finalized return record with generated `returnNumber` (e.g., `RET-3001`).

---

### 5. `adjustStock()`
Manually adjusts inventory levels for damaged, expired, lost, or recount discrepancies.

#### Signature:
```typescript
public adjustStock(
  productId: string,
  quantityDelta: number,
  reason: 'damaged' | 'adjustment',
  notes: string,
  actor: { id: string; name: string; role: any }
): void
```

#### Parameters:
- `productId`: ID of the target product.
- `quantityDelta`: Number of units to add or subtract (e.g., `-3` for damaged goods).
- `reason`: Classification (`'damaged'` or `'adjustment'`).
- `notes`: Audit explanation.
- `actor`: Staff member making the correction.

---

### 6. `logActivity()`
Appends an immutable audit entry to the activity log.

#### Signature:
```typescript
public logActivity(
  userId: string,
  userName: string,
  userRole: any,
  action: string,
  entity: string,
  details: string,
  entityId?: string
): void
```

---

### 7. `exportBackup()` & `importBackup()`
Full database backup serialization and restoration.

#### Signatures:
```typescript
public exportBackup(): string
public importBackup(jsonString: string): boolean
```

- `exportBackup()`: Returns a formatted JSON string containing metadata and all 15 database collections.
- `importBackup(jsonString)`: Validates the JSON schema, writes all collections to storage, and notifies all subscribers. Returns `true` if successful.

---

### 8. `resetToDefaults()`
Clears all storage keys and re-initializes the application with fresh demo seed data.

#### Signature:
```typescript
public resetToDefaults(): void
```

---

### 9. Low-Level Methods (`get`, `set`, `subscribe`)

```typescript
public get<T>(collection: string): T
public set<T>(collection: string, data: T): void
public subscribe(collection: string, callback: () => void): () => void
```

---

## `useDb` React Context Hook (`src/context/DbContext.tsx`)

The `useDb()` hook exposes reactive state collections, mutation helpers, and audio triggers to React components.

```typescript
const {
  products,                // Product[]
  customers,               // Customer[]
  suppliers,               // Supplier[]
  invoices,                // Invoice[]
  purchases,               // Purchase[]
  returns,                 // SaleReturn[]
  expenses,                // Expense[]
  calculations,            // CalculationRecord[]
  customerLedger,          // CustomerLedgerEntry[]
  supplierLedger,          // SupplierLedgerEntry[]
  inventoryTransactions,   // InventoryTransaction[]
  activityLogs,            // ActivityLog[]
  paymentReminders,        // PaymentReminder[]
  users,                   // User[]
  soundEnabled,            // boolean
  setSoundEnabled,         // (enabled: boolean) => void
  exportBackup,            // () => void (Triggers browser download)
  importBackup,            // (jsonStr: string) => boolean
  refresh,                 // () => void
  saveProduct,             // (prod: Product) => void
  deleteProduct,           // (id: string) => void
  toggleFavoriteProduct,   // (id: string) => void
  saveCustomer,            // (cust: Customer) => void
  deleteCustomer,          // (id: string) => void
  saveSupplier,            // (sup: Supplier) => void
  saveExpense,             // (expense: Expense) => void
  deleteExpense,           // (id: string) => void
  saveCalculation,         // (record: Omit<CalculationRecord, 'id' | 'timestamp'>) => void
  deleteCalculation,       // (id: string) => void
  clearCalculations,       // () => void
  toggleFavoriteCalculation,// (id: string) => void
  playSound,               // (type: 'beep' | 'success' | 'cash' | 'error') => void
} = useDb();
```

---

## `useAuth` React Context Hook (`src/context/AuthContext.tsx`)

The `useAuth()` hook manages staff sessions, role changes, store settings, and RBAC authorization.

```typescript
const {
  currentUser,             // User | null
  currentBusiness,         // BusinessSettings
  users,                   // User[]
  setCurrentUser,          // (user: User | null) => void
  switchRole,              // (role: UserRole) => void
  switchUserRole,          // (role: UserRole) => void
  login,                   // (email: string, password?: string, role?: UserRole) => boolean
  logout,                  // () => void
  updateBusinessSettings,  // (settings: Partial<BusinessSettings>) => void
  can,                     // (permission: Permission) => boolean
  isOnline,                // boolean
} = useAuth();
```

### RBAC Check Example:
```typescript
const { can } = useAuth();

// Hide product purchase cost from unauthorized staff:
{can('view_purchase_cost') && (
  <span className="text-gray-500">Cost: Rs. {product.purchasePrice}</span>
)}
```

---

## Server-Side Endpoints (Express Proxy)

For hybrid deployments using an Express backend proxy (via Node.js/Tsx):
- `GET /api/health`: Healthcheck endpoint returning `{ status: 'ok', uptime: process.uptime() }`.
- Static asset serving via Vite middlewares in development.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — Architectural design and transaction flows.
- [DATABASE.md](DATABASE.md) — Detailed schema and entity specifications.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — Role-based access rules.
- [CALCULATOR_AND_BILLING.md](CALCULATOR_AND_BILLING.md) — POS and calculator features.

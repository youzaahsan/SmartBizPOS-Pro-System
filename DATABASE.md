# Database Schema & Entity Models

This document provides complete documentation of the data structures, entities, collection schemas, relationships, and indexing strategies utilized in **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Database Model Overview](#database-model-overview)
- [Entity Relationship Diagram (Logical)](#entity-relationship-diagram-logical)
- [Collection Schemas & Field Specifications](#collection-schemas--field-specifications)
  - [1. `settings` (Business Settings)](#1-settings-business-settings)
  - [2. `users` (Staff & User Accounts)](#2-users-staff--user-accounts)
  - [3. `products` (Product Catalog)](#3-products-product-catalog)
  - [4. `customers` (Customer Directory)](#4-customers-customer-directory)
  - [5. `customerLedger` (Customer Khata Ledger)](#5-customerledger-customer-khata-ledger)
  - [6. `suppliers` (Supplier Directory)](#6-suppliers-supplier-directory)
  - [7. `supplierLedger` (Supplier Accounts Payable)](#7-supplierledger-supplier-accounts-payable)
  - [8. `invoices` (Sales Invoices & Line Items)](#8-invoices-sales-invoices--line-items)
  - [9. `purchases` (Supplier Purchase Orders)](#9-purchases-supplier-purchase-orders)
  - [10. `returns` (Sales Returns & Refunds)](#10-returns-sales-returns--refunds)
  - [11. `expenses` (Store Operating Expenses)](#11-expenses-store-operating-expenses)
  - [12. `inventoryTransactions` (Stock Movement Audit)](#12-inventorytransactions-stock-movement-audit)
  - [13. `calculations` (Calculator Tape History)](#13-calculations-calculator-tape-history)
  - [14. `paymentReminders` (Udhar Reminders)](#14-paymentreminders-udhar-reminders)
  - [15. `activityLogs` (Audit Trail)](#15-activitylogs-audit-trail)
- [Indexing Strategy & Query Optimization](#indexing-strategy--query-optimization)
- [Backup & Restore JSON Format](#backup--restore-json-format)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Database Model Overview

The database is structured around **15 core collections**. Every document belongs to a specific tenant identified by `businessId`, ensuring complete data isolation and multi-store readiness.

---

## Entity Relationship Diagram (Logical)

```
       ┌────────────────────────┐
       │    BusinessSettings    │
       └───────────┬────────────┘
                   │ 1:N
     ┌─────────────┼──────────────┬──────────────┬──────────────┐
     ▼             ▼              ▼              ▼              ▼
┌─────────┐   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │   │ Customer│    │ Product │    │ Supplier│    │ Expense │
└────┬────┘   └────┬────┘    └────┬────┘    └────┬────┘    └─────────┘
     │             │              │              │
     │             │ 1:N          │ 1:N          │ 1:N
     │             ▼              ▼              ▼
     │     ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
     │     │CustomerLedger│  │ InventoryTx  │ │SupplierLedger│
     │     └──────────────┘  └──────────────┘ └──────────────┘
     │             ▲              ▲              ▲
     │             │              │              │
     │ 1:N         │ 1:N          │ 1:N          │ 1:N
     ▼             │              │              │
┌─────────┐        │              │              │
│ Activity│   ┌────┴─────┐   ┌────┴─────┐   ┌────┴─────┐
│   Log   │   │ Invoice  │   │  Return  │   │ Purchase │
└─────────┘   └──────────┘   └──────────┘   └──────────┘
```

---

## Collection Schemas & Field Specifications

### 1. `settings` (Business Settings)
Stores business identity, tax configurations, currency symbol, receipt options, and sound settings.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique business identifier (e.g., `biz_main`). |
| `name` | `string` | Yes | Legal or display business name. |
| `ownerName` | `string` | Yes | Primary business owner's name. |
| `phone` | `string` | Yes | Business contact phone number. |
| `email` | `string` | Yes | Official email address. |
| `address` | `string` | Yes | Physical street address and market location. |
| `logoUrl` | `string` | No | URL or base64 representation of the store logo. |
| `taxId` | `string` | No | GST / NTN / VAT tax registration number. |
| `currency` | `string` | Yes | Currency code (e.g., `PKR`, `USD`). |
| `currencySymbol` | `string` | Yes | Currency symbol displayed on UI (e.g., `Rs.`, `$`). |
| `invoicePrefix` | `string` | Yes | Prefix for sales receipts (e.g., `SB-`). |
| `defaultTaxRate` | `number` | Yes | Default percentage tax rate (e.g., `0` or `17`). |
| `defaultDiscountRate` | `number` | Yes | Default discount percentage applied at POS. |
| `paymentIdentifier` | `string` | No | UPI / IBAN / Easypaisa identifier for QR generation. |
| `receiptFooterNote` | `string` | Yes | Custom message printed at the bottom of thermal receipts. |
| `paperSize` | `'58mm' \| '80mm' \| 'A4'` | Yes | Preferred printer paper size. |
| `autoPrintReceipt` | `boolean` | Yes | Whether to trigger print dialog automatically after sale. |
| `enableSound` | `boolean` | Yes | Toggle for Web Audio sound cues. |

---

### 2. `users` (Staff & User Accounts)
Stores staff members, login credentials, and assigned role for Role-Based Access Control.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique user identifier (e.g., `user_admin`). |
| `name` | `string` | Yes | Staff member's display name. |
| `email` | `string` | Yes | User login email. |
| `role` | `'admin' \| 'manager' \| 'cashier'` | Yes | Assigned RBAC security role. |
| `phone` | `string` | No | Staff contact number. |
| `businessId` | `string` | Yes | Multi-tenant tenant identifier. |
| `avatarUrl` | `string` | No | Profile photo URL. |
| `active` | `boolean` | Yes | Whether the user account is enabled. |
| `createdAt` | `string` (ISO 8601) | Yes | Account creation timestamp. |

---

### 3. `products` (Product Catalog)
Stores inventory items, multi-tier pricing, units, and reorder thresholds.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique product ID (e.g., `prod_1`). |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `name` | `string` | Yes | Product name and specification. |
| `sku` | `string` | Yes | Stock Keeping Unit code. |
| `barcode` | `string` | Yes | Scannable EAN/UPC barcode number. |
| `category` | `string` | Yes | Classification category (e.g., `Groceries`, `Dairy`). |
| `unit` | `string` | Yes | Measurement unit (`KG`, `L`, `PCS`, `PACK`, `BOX`, `GM`, `MTR`). |
| `purchasePrice` | `number` | Yes | Wholesale cost price (hidden from cashiers). |
| `retailPrice` | `number` | Yes | Standard consumer retail price. |
| `wholesalePrice` | `number` | Yes | Bulk purchase rate for wholesalers. |
| `specialPrice` | `number` | Yes | Discounted VIP/special customer rate. |
| `stockQuantity` | `number` | Yes | Current on-hand quantity. |
| `minStock` | `number` | Yes | Minimum stock threshold triggering low-stock alert. |
| `taxRate` | `number` | Yes | Product-specific tax rate percentage. |
| `expiryDate` | `string` | No | Expiration date if applicable. |
| `isFavorite` | `boolean` | No | Flag indicating quick-access favorite item on POS. |
| `createdAt` | `string` (ISO 8601) | Yes | Creation timestamp. |
| `updatedAt` | `string` (ISO 8601) | Yes | Last modification timestamp. |

---

### 4. `customers` (Customer Directory)
Maintains customer profiles, contact info, total spend, and outstanding Udhar balance.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique customer identifier. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `name` | `string` | Yes | Full customer name. |
| `phone` | `string` | Yes | Primary phone number (used for WhatsApp reminders). |
| `email` | `string` | No | Email address. |
| `address` | `string` | No | Physical residential or business address. |
| `notes` | `string` | No | Shopkeeper notes regarding creditworthiness or habits. |
| `customerType` | `'walk-in' \| 'regular' \| 'wholesale' \| 'vip'` | Yes | Customer tier classification. |
| `totalPurchases` | `number` | Yes | Lifetime cumulative purchase amount. |
| `totalPaid` | `number` | Yes | Lifetime cumulative payments received. |
| `totalDue` | `number` | Yes | Current unpaid balance (*Udhar*). |
| `lastPurchaseDate` | `string` | No | Date of most recent purchase. |
| `createdAt` | `string` (ISO 8601) | Yes | Registration timestamp. |

---

### 5. `customerLedger` (Customer Khata Ledger)
Double-entry ledger logging every transaction affecting a customer's balance.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique ledger entry ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `customerId` | `string` | Yes | Target customer identifier. |
| `date` | `string` | Yes | Transaction date (`YYYY-MM-DD`). |
| `type` | `'sale' \| 'payment' \| 'return' \| 'opening_balance' \| 'adjustment'` | Yes | Transaction category. |
| `referenceId` | `string` | No | Associated invoice or payment receipt number. |
| `description` | `string` | Yes | Human-readable transaction explanation. |
| `debit` | `number` | Yes | Amount added to customer's debt (e.g., new credit sale). |
| `credit` | `number` | Yes | Amount reducing customer's debt (e.g., cash payment). |
| `balance` | `number` | Yes | Running balance owed after this transaction. |
| `createdBy` | `string` | Yes | Name of cashier/staff who recorded the entry. |
| `createdAt` | `string` (ISO 8601) | Yes | Creation timestamp. |

---

### 6. `suppliers` (Supplier Directory)
Stores wholesale vendors, distributors, and total payable balances.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique supplier identifier. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `name` | `string` | Yes | Supplier representative name. |
| `company` | `string` | Yes | Company or distributorship name. |
| `phone` | `string` | Yes | Contact phone number. |
| `totalPurchases` | `number` | Yes | Cumulative volume of purchases from this supplier. |
| `totalPaid` | `number` | Yes | Cumulative payments made to this supplier. |
| `totalDue` | `number` | Yes | Outstanding payable balance owed to supplier. |
| `createdAt` | `string` (ISO 8601) | Yes | Registration timestamp. |

---

### 7. `supplierLedger` (Supplier Accounts Payable)
Maintains the double-entry ledger of goods received from and payments made to suppliers.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique ledger entry ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `supplierId` | `string` | Yes | Associated supplier identifier. |
| `date` | `string` | Yes | Transaction date (`YYYY-MM-DD`). |
| `type` | `'purchase' \| 'payment' \| 'return' \| 'opening_balance'` | Yes | Transaction category. |
| `referenceId` | `string` | No | Purchase order or payment reference number. |
| `description` | `string` | Yes | Transaction description. |
| `debit` | `number` | Yes | Cash paid to supplier (reduces balance owed). |
| `credit` | `number` | Yes | Value of stock received (increases balance owed). |
| `balance` | `number` | Yes | Net balance payable after this entry. |
| `createdAt` | `string` (ISO 8601) | Yes | Creation timestamp. |

---

### 8. `invoices` (Sales Invoices & Line Items)
Represents finalized retail and wholesale sales transactions.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Internal invoice ID. |
| `invoiceNumber` | `string` | Yes | Sequential receipt number (e.g., `SB-1001`). |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `customerId` | `string` | Yes | Linked customer ID or `'cust_walkin'`. |
| `customerName` | `string` | Yes | Customer name. |
| `date` | `string` | Yes | Date of sale (`YYYY-MM-DD`). |
| `items` | `InvoiceItem[]` | Yes | Array of line items sold (see below). |
| `subtotal` | `number` | Yes | Total before overall discounts and taxes. |
| `itemDiscountsTotal` | `number` | Yes | Sum of individual line item discounts. |
| `billDiscount` | `number` | Yes | Overall bill-level discount. |
| `billDiscountType` | `'percentage' \| 'fixed'` | Yes | Unit of overall bill discount. |
| `taxTotal` | `number` | Yes | Total tax collected on the invoice. |
| `grandTotal` | `number` | Yes | Final payable amount. |
| `paidAmount` | `number` | Yes | Amount tendered by customer at POS. |
| `dueAmount` | `number` | Yes | Remaining balance added to customer's Udhar. |
| `totalCost` | `number` | Yes | Authoritative Cost of Goods Sold (COGS). |
| `grossProfit` | `number` | Yes | Profit on this invoice (`grandTotal - totalCost`). |
| `paymentStatus` | `'paid' \| 'partial' \| 'unpaid'` | Yes | Settlement status. |
| `paymentMethod` | `'cash' \| 'card' \| 'upi_qr' \| 'bank_transfer' \| 'credit'` | Yes | Method of payment. |
| `status` | `'completed' \| 'cancelled' \| 'refunded' \| 'partial_refund'` | Yes | Invoice lifecycle status. |
| `cashierId` | `string` | Yes | User ID of the cashier who processed the sale. |
| `cashierName` | `string` | Yes | Cashier's display name. |
| `createdAt` | `string` (ISO 8601) | Yes | Timestamp of sale completion. |

#### Nested `InvoiceItem` Structure:
```typescript
interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  purchaseCost: number;     // Authoritative cost used for profit tracking
  unitPrice: number;        // Price charged to customer
  priceType: 'retail' | 'wholesale' | 'special';
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  total: number;
}
```

---

### 9. `purchases` (Supplier Purchase Orders)
Records stock received from wholesale distributors.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Purchase record ID. |
| `purchaseNumber` | `string` | Yes | Sequential purchase order number (e.g., `PUR-5001`). |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `supplierId` | `string` | Yes | Linked supplier identifier. |
| `supplierName` | `string` | Yes | Supplier business name. |
| `date` | `string` | Yes | Date goods were received. |
| `items` | `PurchaseItem[]` | Yes | Array of restocked products, quantities, and cost prices. |
| `totalAmount` | `number` | Yes | Total invoice value from supplier. |
| `paidAmount` | `number` | Yes | Amount paid to supplier immediately. |
| `dueAmount` | `number` | Yes | Credit balance owed to supplier. |
| `status` | `'received' \| 'pending' \| 'cancelled'` | Yes | Purchase order status. |
| `createdAt` | `string` (ISO 8601) | Yes | Timestamp of creation. |

---

### 10. `returns` (Sales Returns & Refunds)
Tracks returned items, restocking logic, and refund disbursements.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Return record identifier. |
| `returnNumber` | `string` | Yes | Sequential return number (e.g., `RET-3001`). |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `invoiceId` | `string` | Yes | ID of original invoice being returned. |
| `invoiceNumber` | `string` | Yes | Original invoice number. |
| `customerId` | `string` | Yes | Customer ID. |
| `customerName` | `string` | Yes | Customer name. |
| `date` | `string` | Yes | Date return was processed. |
| `items` | `ReturnItem[]` | Yes | List of returned items with `restock: boolean` flag. |
| `totalRefund` | `number` | Yes | Total value refunded to customer. |
| `refundMethod` | `'cash' \| 'credit_adjust' \| 'bank'` | Yes | How refund was disbursed. |
| `reason` | `string` | Yes | Customer reason for return (e.g., *Defective*, *Wrong item*). |
| `processedBy` | `string` | Yes | Staff member who authorized the return. |
| `createdAt` | `string` (ISO 8601) | Yes | Creation timestamp. |

---

### 11. `expenses` (Store Operating Expenses)
Records non-inventory operational expenditures.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique expense ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `title` | `string` | Yes | Short description of expense (e.g., *Shop Electricity Bill*). |
| `category` | `'Rent' \| 'Electricity' \| 'Salaries' \| 'Transport' \| 'Supplies' \| 'Maintenance' \| 'Tea & Refreshments' \| 'Marketing' \| 'Other'` | Yes | Operating expense category. |
| `amount` | `number` | Yes | Expense amount paid. |
| `date` | `string` | Yes | Date incurred. |
| `paymentMethod` | `PaymentMethod` | Yes | Payment method used. |
| `createdBy` | `string` | Yes | Staff member who logged the expense. |
| `createdAt` | `string` (ISO 8601) | Yes | Creation timestamp. |

---

### 12. `inventoryTransactions` (Stock Movement Audit)
Immutable audit ledger of every unit that enters or leaves the shop.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique transaction ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `productId` | `string` | Yes | Target product ID. |
| `productName` | `string` | Yes | Product name at time of transaction. |
| `type` | `'sale' \| 'purchase' \| 'return' \| 'adjustment' \| 'damaged'` | Yes | Cause of stock movement. |
| `quantityDelta` | `number` | Yes | Change in stock (+5 for purchase, -2 for sale). |
| `previousStock` | `number` | Yes | Stock level before transaction. |
| `newStock` | `number` | Yes | Stock level after transaction. |
| `referenceId` | `string` | No | Associated invoice or purchase number. |
| `date` | `string` | Yes | Date of movement. |
| `createdBy` | `string` | Yes | Staff member responsible. |

---

### 13. `calculations` (Calculator Tape History)
Saves calculation records from the Smart Business Calculator.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique calculation ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `userId` | `string` | Yes | Staff member who performed the calculation. |
| `expression` | `string` | Yes | Full mathematical expression (e.g., `250 * 4 + 100`). |
| `result` | `string` | Yes | Evaluated output (e.g., `1,100`). |
| `calculationType` | `string` | Yes | Type (`Multiplication`, `Percentage`, `Markup`). |
| `category` | `'General' \| 'Shopping' \| 'Customer' \| 'GST' \| 'Discount' \| 'Markup' \| 'Profit' \| 'Other'` | Yes | User-assigned category tag. |
| `isFavorite` | `boolean` | Yes | Starred calculation for quick reuse. |
| `date` | `string` | Yes | Date string. |
| `time` | `string` | Yes | Time string (e.g., `09:15 AM`). |
| `timestamp` | `number` | Yes | Epoch millisecond timestamp. |

---

### 14. `paymentReminders` (Udhar Reminders)
Tracks outstanding customer debt and WhatsApp reminder dispatch states.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique reminder ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `customerId` | `string` | Yes | Target customer identifier. |
| `customerName` | `string` | Yes | Customer name. |
| `customerPhone` | `string` | Yes | Phone number for messaging. |
| `dueAmount` | `number` | Yes | Outstanding balance due. |
| `reminderCount` | `number` | Yes | Number of reminders sent. |
| `status` | `'pending' \| 'sent' \| 'resolved'` | Yes | Reminder status. |

---

### 15. `activityLogs` (Audit Trail)
System-wide audit trail recording user actions across all modules.

| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | `string` | Yes | Unique log ID. |
| `businessId` | `string` | Yes | Multi-tenant identifier. |
| `userId` | `string` | Yes | User ID who performed the action. |
| `userName` | `string` | Yes | Display name of staff member. |
| `userRole` | `UserRole` | Yes | Role of user at time of action. |
| `action` | `string` | Yes | Verb (e.g., `Created Invoice`, `Adjusted Stock`). |
| `entity` | `string` | Yes | Target entity type (`invoice`, `inventory`, `customer`). |
| `entityId` | `string` | No | ID of affected entity. |
| `details` | `string` | Yes | Narrative description of the action. |
| `timestamp` | `string` (ISO 8601) | Yes | Exact event timestamp. |

---

## Indexing Strategy & Query Optimization

For cloud Firestore deployments, the following composite indexes ensure query performance under high load:

1. **`invoices`**:
   - `(businessId ASC, date DESC)` — For daily sales reports.
   - `(businessId ASC, customerId ASC, date DESC)` — For customer purchase histories.
2. **`customerLedger`**:
   - `(customerId ASC, date ASC, createdAt ASC)` — For chronological customer statements.
3. **`inventoryTransactions`**:
   - `(productId ASC, date DESC)` — For product audit trails.
4. **`products`**:
   - `(businessId ASC, stockQuantity ASC)` — For low-stock queries.
   - `(businessId ASC, barcode ASC)` — For single-roundtrip barcode lookups.

---

## Backup & Restore JSON Format

The application supports native, full-database backups via `db.exportBackup()`. The exported JSON file adheres to the following structure:

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-10-09T13:30:00.000Z",
  "businessId": "biz_main",
  "data": {
    "settings": { ... },
    "users": [ ... ],
    "products": [ ... ],
    "customers": [ ... ],
    "customerLedger": [ ... ],
    "suppliers": [ ... ],
    "supplierLedger": [ ... ],
    "invoices": [ ... ],
    "purchases": [ ... ],
    "returns": [ ... ],
    "expenses": [ ... ],
    "inventoryTransactions": [ ... ],
    "calculations": [ ... ],
    "paymentReminders": [ ... ],
    "activityLogs": [ ... ]
  }
}
```

The import utility (`db.importBackup()`) parses and validates this schema before atomically writing it into storage.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture and design.
- [API.md](API.md) — API methods and service layer functions.
- [FIREBASE.md](FIREBASE.md) — Cloud Firestore deployment guide.
- [SECURITY.md](SECURITY.md) — Access control and cost protection.

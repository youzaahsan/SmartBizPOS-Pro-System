# Firebase Cloud Architecture & Integration Blueprint

This document specifies the complete cloud backend architecture for **SMARTBIZ CALCULATOR** using **Google Firebase** (Firebase Authentication, Cloud Firestore, Firebase Storage, and Cloud Functions). It provides schema designs, security rules, function triggers, and migration steps from the local-first engine.

---

## 📌 Table of Contents

- [Cloud Architecture Overview](#cloud-architecture-overview)
- [Firebase Authentication & Custom Claims](#firebase-authentication--custom-claims)
- [Cloud Firestore Data Model](#cloud-firestore-data-model)
- [Firebase Storage Structure](#firebase-storage-structure)
- [Cloud Functions Specification](#cloud-functions-specification)
- [Firestore Security Rules (`firestore.rules`)](#firestore-security-rules-firestorerules)
- [Storage Security Rules (`storage.rules`)](#storage-security-rules-storagerules)
- [Local-First to Cloud Migration Guide](#local-first-to-cloud-migration-guide)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Cloud Architecture Overview

The production cloud deployment replaces browser-only local persistence with a fully synced, multi-device, multi-terminal Firebase topology:

```
┌─────────────────────────────────────────────────────────────┐
│                 REACT CLIENT TERMINALS                      │
│        (Counter POS, Owner Mobile, Manager Tablet)           │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    FIREBASE AUTHENTICATION   │ │      FIREBASE STORAGE      │
│  - Email / Password Login    │ │  - Business Logos (/logos) │
│  - Custom Claims (Role/BizId)│ │  - Product Photos (/items) │
│  - Session Token Refresh     │ │  - Cloud Backups (/backups)│
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                     CLOUD FIRESTORE                         │
│  Multi-Tenant Database with Offline Persistence Enabled     │
│  Path: businesses/{businessId}/{collection}/{docId}         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FIREBASE CLOUD FUNCTIONS                    │
│  - Authoritative Invoice Sequence Generator                 │
│  - Atomic Multi-Collection Inventory & Ledger Transactions   │
│  - COGS & Profit Computer (Masked from Cashiers)            │
│  - Nightly Automated Udhar Reminders & Reports              │
└─────────────────────────────────────────────────────────────┘
```

---

## Firebase Authentication & Custom Claims

### 1. User Directory & Custom Claims
Firebase Authentication handles user registration, password changes, and cryptographic JWT session tokens. Roles are stored in Firebase Auth **Custom Claims** to allow immediate, zero-latency security rules evaluation.

```typescript
// Cloud Function: Set Custom Claims on User Creation
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const claims = {
    role: 'cashier', // Default role
    businessId: 'biz_main',
  };
  await admin.auth().setCustomUserClaims(user.uid, claims);
});
```

### 2. Supported Roles
- `role: 'admin'`: Store owner; full access to settings, reports, staff management, and purchase costs.
- `role: 'manager'`: Operations lead; access to inventory, purchases, supplier ledgers, and reports.
- `role: 'cashier'`: Front-desk operator; restricted to creating sales, viewing product prices, and accepting payments. Purchase prices and store profits are masked.

---

## Cloud Firestore Data Model

The Firestore database adopts a **Multi-Tenant Hierarchical Architecture**, where all business records reside under a parent `businesses/{businessId}` document:

```
businesses/
  └── {businessId}/
        ├── settings/profile                    (BusinessSettings document)
        ├── users/{userId}                      (User profile & status)
        ├── products/{productId}                (Catalog, pricing & stock)
        ├── customers/{customerId}              (Customer balances & info)
        ├── customerLedger/{ledgerId}          (Double-entry customer ledger)
        ├── suppliers/{supplierId}              (Supplier balances & info)
        ├── supplierLedger/{ledgerId}          (Double-entry supplier ledger)
        ├── invoices/{invoiceId}                (Sales orders & line items)
        ├── purchases/{purchaseId}              (Supplier restock orders)
        ├── returns/{returnId}                  (Sale returns & restock flags)
        ├── expenses/{expenseId}                (Overhead operational expenses)
        ├── inventoryTransactions/{txId}        (Full stock ledger audit trail)
        ├── calculations/{calcId}               (Saved tape calculations)
        ├── paymentReminders/{reminderId}       (Pending Udhar reminders)
        └── activityLogs/{logId}                (Auditable action logs)
```

Each document maps directly to the TypeScript interfaces declared in `/src/types/index.ts`.

---

## Firebase Storage Structure

Files are organized in Firebase Storage using the following path structure:

```
gs://smartbiz-app.appspot.com/
  ├── businesses/
  │   └── {businessId}/
  │         ├── logo/
  │         │   └── store_logo.png
  │         ├── products/
  │         │   ├── {productId}_thumb.webp
  │         │   └── {productId}_full.webp
  │         └── backups/
  │             └── backup_{timestamp}.json
```

---

## Cloud Functions Specification

Server-side operations that require authoritative execution and data protection are handled by Cloud Functions:

### 1. `createInvoiceTransaction` (Callable HTTPS Function)
- **Trigger**: Called by the POS client when an order is submitted.
- **Actions**:
  1. Verifies the caller's JWT token and `businessId`.
  2. Executes a Firestore `runTransaction()`:
     - Fetches current invoice sequence and increments counter.
     - Resolves true `purchasePrice` for each product.
     - Computes true `totalCost` (COGS) and `grossProfit`.
     - Decrements `stockQuantity` for each item.
     - If the customer has an unpaid balance, increments `totalDue` and posts a `customerLedger` entry.
     - Appends an audit record to `activityLogs`.
  3. Returns the saved invoice document with cashier-sanitized profit figures if the caller is a cashier.

### 2. `processReturnTransaction` (Callable HTTPS Function)
- **Trigger**: Called when a customer returns goods.
- **Actions**:
  1. Verifies caller role is `admin` or `manager`.
  2. Atomically increments product inventory for items flagged with `restock: true`.
  3. Deducts refund amount from customer due balance if paid by credit adjustment.
  4. Updates the original invoice status to `partial_refund` or `refunded`.

### 3. `dailyUdharReminderCron` (Scheduled Pub/Sub Function)
- **Schedule**: `0 9 * * *` (Daily at 09:00 AM).
- **Actions**:
  1. Queries all `paymentReminders` where `status == 'pending'` and `dueAmount > 0`.
  2. Prepares batch notification digests for store owners.

---

## Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function belongsToBusiness(businessId) {
      return isAuthenticated() && request.auth.token.businessId == businessId;
    }
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }
    function isAdmin(businessId) {
      return belongsToBusiness(businessId) && hasRole('admin');
    }
    function isManager(businessId) {
      return belongsToBusiness(businessId) && (hasRole('admin') || hasRole('manager'));
    }

    match /businesses/{businessId} {
      allow read: if belongsToBusiness(businessId);
      allow write: if isAdmin(businessId);

      // Store settings & profile
      match /settings/{docId} {
        allow read: if belongsToBusiness(businessId);
        allow write: if isAdmin(businessId);
      }

      // Products Catalog: Cashiers can read, but only Admins & Managers can write
      match /products/{productId} {
        allow read: if belongsToBusiness(businessId);
        allow write: if isManager(businessId);
      }

      // Customers & Ledger
      match /customers/{customerId} {
        allow read, create, update: if belongsToBusiness(businessId);
        allow delete: if isAdmin(businessId);
      }
      match /customerLedger/{entryId} {
        allow read, create: if belongsToBusiness(businessId);
        allow update, delete: if isAdmin(businessId);
      }

      // Invoices: Read by business staff; writes restricted to verified roles
      match /invoices/{invoiceId} {
        allow read: if belongsToBusiness(businessId);
        allow create: if belongsToBusiness(businessId);
        allow update, delete: if isManager(businessId);
      }

      // Purchases & Suppliers: Admin and Manager only
      match /purchases/{purchaseId} {
        allow read, write: if isManager(businessId);
      }
      match /suppliers/{supplierId} {
        allow read, write: if isManager(businessId);
      }

      // Expenses: Read/Write by Manager and Admin
      match /expenses/{expenseId} {
        allow read, create: if isManager(businessId);
        allow update, delete: if isAdmin(businessId);
      }

      // Activity logs: Append-only
      match /activityLogs/{logId} {
        allow read: if isManager(businessId);
        allow create: if belongsToBusiness(businessId);
        allow update, delete: if false; // Immutable audit trail
      }
    }
  }
}
```

---

## Storage Security Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /businesses/{businessId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.token.businessId == businessId;
      allow write: if request.auth != null && 
                     request.auth.token.businessId == businessId &&
                     request.resource.size < 5 * 1024 * 1024 && // 5MB limit
                     request.resource.contentType.matches('image/.*|application/json');
    }
  }
}
```

---

## Local-First to Cloud Migration Guide

To connect the application to an active Firebase project:

1. **Install Firebase Client SDK**:
   ```bash
   npm install firebase
   ```

2. **Create Firebase Initialization Module** (`src/services/firebase.ts`):
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const firestore = getFirestore(app);
   export const storage = getStorage(app);

   // Enable offline caching
   enableIndexedDbPersistence(firestore).catch((err) => {
     console.warn('Persistence failed:', err);
   });
   ```

3. **Migrate `DatabaseEngine`**:
   Replace the internal `localStorage` getters and setters in `src/services/db.ts` with Firestore `onSnapshot` listeners and `doc`/`collection` references. Because `DbContext.tsx` is already built on an event-driven subscription pattern, the presentation layer remains completely unmodified.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — Architectural design.
- [DATABASE.md](DATABASE.md) — Database schema and models.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — RBAC and authorization.
- [SECURITY.md](SECURITY.md) — Security policies and data protection.

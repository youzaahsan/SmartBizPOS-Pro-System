# Authentication & Role-Based Access Control (RBAC)

This document details the authentication subsystem, session management, user roles, security permissions, and UI cost masking rules implemented in **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Overview & Security Objectives](#overview--security-objectives)
- [Staff User Model](#staff-user-model)
- [Role Hierarchy](#role-hierarchy)
- [Permission Matrix](#permission-matrix)
- [The Authorization Engine (`can()`)](#the-authorization-engine-can)
- [UI Cost & Profit Masking Patterns](#ui-cost--profit-masking-patterns)
- [Fast Role Switching & Shift Handover](#fast-role-switching--shift-handover)
- [Staff Account Management](#staff-account-management)
- [Cloud Security & Firebase Custom Claims](#cloud-security--firebase-custom-claims)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Overview & Security Objectives

In retail environments, store owners frequently employ cashiers and floor assistants who need to process transactions quickly without accessing sensitive business financial metrics. Specifically:
1. **Cashiers must not see wholesale purchase costs**, preventing price disclosure to customers or competitors.
2. **Cashiers must not view overall store profit or net margins**.
3. **Cashiers must not modify system backups, staff accounts, or tax settings**.
4. **Managers** require operational control over stock replenishment, catalog management, and daily reports, but should not modify core business credentials or staff roles.
5. **Owners (Admins)** retain complete administrative control over all records.

SMARTBIZ implements a granular **Role-Based Access Control (RBAC)** system enforcing these security boundaries across both the presentation layer and the database engine.

---

## Staff User Model

Defined in `/src/types/index.ts`:

```typescript
export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  businessId: string;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}
```

Pre-seeded staff accounts:
- **Admin**: `admin@smartbiz.com` — *Youza Manzoor (Owner)*
- **Manager**: `manager@smartbiz.com` — *Hamza Tariq (Manager)*
- **Cashier**: `cashier@smartbiz.com` — *Bilal Ahmed (Cashier)*

---

## Role Hierarchy

```
       ┌────────────────────────┐
       │     Admin (Owner)      │ ── Full administrative authority
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │        Manager         │ ── Inventory, suppliers & operational reports
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │        Cashier         │ ── Sales, customer payments & basic POS
       └────────────────────────┘
```

---

## Permission Matrix

The 13 system permissions and their role allocations:

| Permission Identifier | Description | Admin | Manager | Cashier |
|---|---|:---:|:---:|:---:|
| `create_sale` | Initiate & complete POS sales and quick bills | ✅ | ✅ | ✅ |
| `give_discount` | Apply line item or whole-bill discounts | ✅ | ✅ | ✅ |
| `manage_customers` | Create & edit customer profiles | ✅ | ✅ | ✅ |
| `record_payments` | Accept Udhar credit settlements | ✅ | ✅ | ✅ |
| `cancel_sale` | Void or cancel completed sales invoices | ✅ | ✅ | ❌ |
| `view_purchase_cost` | View wholesale product cost prices | ✅ | ✅ | ❌ *(Masked)* |
| `view_profit` | View gross profit on bills & net P&L reports | ✅ | ✅ | ❌ *(Hidden)* |
| `manage_products` | Add, edit, or delete catalog items | ✅ | ✅ | ❌ |
| `manage_suppliers` | Create suppliers & view accounts payable | ✅ | ✅ | ❌ |
| `manage_expenses` | Record & audit store operating expenses | ✅ | ✅ | ❌ |
| `view_reports` | Access financial statements and analytics | ✅ | ✅ | ❌ |
| `manage_staff` | Create staff accounts and alter roles | ✅ | ❌ | ❌ |
| `backup_restore` | Export or restore database JSON backups | ✅ | ❌ | ❌ |

---

## The Authorization Engine (`can()`)

The authorization engine is encapsulated in `/src/context/AuthContext.tsx`. It provides a clean, declarative helper function `can(permission: Permission): boolean`.

```typescript
// Definition in src/context/AuthContext.tsx
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create_sale',
    'cancel_sale',
    'give_discount',
    'view_profit',
    'view_purchase_cost',
    'manage_products',
    'manage_customers',
    'manage_suppliers',
    'record_payments',
    'manage_expenses',
    'view_reports',
    'manage_staff',
    'backup_restore',
  ],
  manager: [
    'create_sale',
    'cancel_sale',
    'give_discount',
    'view_profit',
    'view_purchase_cost',
    'manage_products',
    'manage_customers',
    'manage_suppliers',
    'record_payments',
    'manage_expenses',
    'view_reports',
  ],
  cashier: [
    'create_sale',
    'give_discount',
    'manage_customers',
    'record_payments',
  ],
};

const can = (permission: Permission): boolean => {
  if (!currentUser) return false;
  const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
  return allowed.includes(permission);
};
```

---

## UI Cost & Profit Masking Patterns

Components use `can()` to conditionally render sensitive data. If an unauthorized user inspects the interface, sensitive values are either omitted or masked with secure placeholders:

### Example: Masking Purchase Cost in Catalog (`ProductManagement.tsx`)
```tsx
const { can } = useAuth();

// Render table column header
{can('view_purchase_cost') && (
  <th className="px-4 py-3 text-left">Purchase Cost</th>
)}

// Render table row data
{can('view_purchase_cost') ? (
  <td className="px-4 py-3 text-slate-600 font-mono">
    Rs. {product.purchasePrice.toLocaleString()}
  </td>
) : (
  <td className="px-4 py-3 text-slate-400 italic">
    <span className="inline-flex items-center gap-1 text-xs">
      <Lock className="w-3 h-3" /> Confidential
    </span>
  </td>
)}
```

### Example: Masking Invoice Gross Profit in Reports (`BusinessReports.tsx`)
```tsx
const { can } = useAuth();

if (!can('view_profit')) {
  return (
    <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
      <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-slate-800">Access Restricted</h3>
      <p className="text-sm text-slate-500">
        You do not have administrative permission to view financial profit and loss reports.
      </p>
    </div>
  );
}
```

---

## Fast Role Switching & Shift Handover

In fast-paced counter environments, cashiers rotate shifts or owners step in to authorize special discounts. SMARTBIZ provides an intuitive **1-Click Staff Login & Role Switcher** modal (`/src/components/auth/AuthModal.tsx`).

### Features:
1. **Instant Demo Switching**: Buttons for `Admin (Owner)`, `Manager`, and `Cashier` allow rapid testing of permission boundaries and shift handovers with zero typing friction.
2. **Credential Login**: Supports standard email/password authentication.
3. **Session Indicator**: The persistent navigation bar (`AppNavbar.tsx`) always displays the active user's name, role badge (`ADMIN`, `MANAGER`, `CASHIER`), and avatar.

---

## Staff Account Management

Store administrators can manage the staff roster in **Settings** > **Staff Management**:
1. View all registered staff accounts, email addresses, and roles.
2. Add new cashiers and managers.
3. Inspect whether each staff member has cost visibility enabled.
4. Revoke access or toggle account active status.

---

## Cloud Security & Firebase Custom Claims

When migrating to a multi-tenant Firebase backend, permissions are mapped to **Firebase Authentication Custom Claims**:

```json
{
  "https://smartbiz.com/claims": {
    "businessId": "biz_main",
    "role": "cashier",
    "permissions": ["create_sale", "give_discount", "manage_customers", "record_payments"]
  }
}
```

This ensures that Firestore Security Rules evaluate access at the database level before any payload is returned over the network.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [DATABASE.md](DATABASE.md) — Database schema and user models.
- [SECURITY.md](SECURITY.md) — Comprehensive security policies and audit logging.
- [FIREBASE.md](FIREBASE.md) — Firebase Custom Claims implementation.

# Security Architecture & Data Protection

This document outlines the security architecture, threat model, data protection mechanisms, authorization rules, and confidentiality policies implemented in **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Security Philosophy & Threat Model](#security-philosophy--threat-model)
- [Wholesale Cost Confidentiality (Anti-Leak Policy)](#wholesale-cost-confidentiality-anti-leak-policy)
- [Role-Based Access Control (RBAC) Guarantees](#role-based-access-control-rbac-guarantees)
- [Immutable Audit Trail (`activityLogs`)](#immutable-audit-trail-activitylogs)
- [Input Validation & Financial Precision](#input-validation--financial-precision)
- [Local Storage Security & Boundary Isolation](#local-storage-security--boundary-isolation)
- [Cloud & Firebase Security Hardening](#cloud-firebase-security-hardening)
- [Secrets & Environment Management](#secrets--environment-management)
- [Vulnerability Disclosure Policy](#vulnerability-disclosure-policy)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Security Philosophy & Threat Model

POS software operates in high-risk physical environments where terminal screens are visible to customers and counter employees rotate regularly. The security model addresses the following core threats:

1. **Information Leakage to Customers/Competitors**: Preventing cashiers or onlookers from viewing wholesale acquisition costs or markup margins.
2. **Internal Loss & Stock Manipulation**: Preventing staff from quietly altering product prices, wiping out customer debt (*Udhar*), or falsifying inventory counts.
3. **Data Tampering & Corrupt State**: Preventing malicious input payloads from corrupting calculations or local storage state.
4. **Network Interceptions**: Ensuring cloud communication utilizes cryptographic tokens and TLS encryption.

---

## Wholesale Cost Confidentiality (Anti-Leak Policy)

Store profitability depends on preserving supplier purchase pricing confidentiality. SMARTBIZ enforces strict visibility restrictions:

- **Cashier Masking**: When an account with `role: 'cashier'` is active:
  - The `purchasePrice` column in the product table is removed or masked.
  - The `COGS` (Cost of Goods Sold) and `grossProfit` fields on invoices are omitted from display.
  - Profit and Loss reporting tabs are disabled.
- **Server/Transaction Authoritative Calculation**:
  - Even though a cashier rings up a sale, the true purchase cost used for store profit tracking is resolved authoritatively by the `DatabaseEngine` (`createInvoice()`). The cashier client never needs to submit or manipulate cost fields.

---

## Role-Based Access Control (RBAC) Guarantees

Access control is enforced via the `can(permission)` authorization engine (`AuthContext.tsx`):

```
                   ┌──────────────────────────────────────┐
                   │          AUTHORIZATION ENGINE        │
                   │         can(permission: string)      │
                   └──────────────────┬───────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   [ ADMIN (OWNER) ]            [ MANAGER ]                [ CASHIER ]
   • All 13 Permissions        • 11 Operational          • 4 Front-Desk
   • Full Cost & P&L           • Full Cost & P&L         • Zero Cost Visibility
   • Staff Management          • No Staff Changes        • Zero Profit Visibility
   • Backup & Restore          • No Backup/Restore       • Zero System Config
```

Administrative functions (such as modifying staff accounts, editing store tax IDs, and restoring backups) reject requests unless the active user holds the `admin` role.

---

## Immutable Audit Trail (`activityLogs`)

Every critical business action automatically generates an audit record in `activityLogs`:

```typescript
interface ActivityLog {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;      // e.g., 'Created Invoice', 'Adjusted Stock', 'Received Payment'
  entity: string;      // e.g., 'invoice', 'product', 'customer'
  entityId?: string;
  details: string;     // e.g., 'Invoice #SB-1002 total Rs. 1,500 for Ali Khan'
  timestamp: string;   // ISO 8601 UTC timestamp
}
```

The system log preserves an unalterable history of:
- All completed sales, discounts, and payments.
- Inventory write-offs and stock adjustments.
- New supplier purchases and returns.
- System initialization and backup imports.

---

## Input Validation & Financial Precision

1. **Arithmetic Clamping**: Stock adjustments prevent negative inventory unless explicitly overridden (`Math.max(0, currentStock - delta)`).
2. **Numeric Type Sanitization**: All calculations convert input strings to validated numbers (`Number(val) || 0`) to prevent `NaN` or `undefined` propagation.
3. **Double-Entry Balance Verification**: In `createInvoice()`, `paidAmount + dueAmount === grandTotal` is verified before updating customer debt.
4. **XSS Protection**: React automatically escapes strings rendered in JSX, preventing script injection through customer names or product descriptions.

---

## Local Storage Security & Boundary Isolation

1. **Key Isolation**: All persistent storage keys use a standardized prefix (`smartbiz_*`) to avoid collisions with other browser applications.
2. **Schema Validation on Import**: The `importBackup()` routine parses and validates incoming JSON files to ensure all 15 expected collections exist before writing them to disk.
3. **Single Origin Policy**: Data is isolated to the origin domain and port per browser security standards.

---

## Cloud & Firebase Security Hardening

When deployed with a Firebase cloud backend:

1. **Cryptographic Authentication**: Firebase Auth uses RS256-signed JSON Web Tokens (JWT) with automatic token rotation.
2. **Role Verification via Custom Claims**: Staff roles are embedded into cryptographic auth tokens, preventing client-side spoofing.
3. **Firestore Security Rules**: Database rules reject client writes to protected collections (`activityLogs`, `users`, `settings`) unless verified by `request.auth.token.role == 'admin'`.
4. **Transport Security**: All HTTP communication is enforced over HTTPS (TLS 1.3).

---

## Secrets & Environment Management

1. **Zero Client Secrets**: No database passwords, private keys, or API secrets are stored in client source code.
2. **Environment Variable Safeguards**: Client-accessible environment variables are restricted to the `VITE_` prefix and contain public identifiers only.
3. **No Hardcoded Credentials**: Demo user credentials use placeholder hashes and must be replaced with strong passwords upon production onboarding.

---

## Vulnerability Disclosure Policy

If you discover a security vulnerability in SMARTBIZ CALCULATOR:
1. Please do not open a public issue on GitHub.
2. Send a responsible disclosure report to the development team at `security@smartbiz.com` or contact the repository maintainers directly.
3. Include detailed steps to reproduce the issue, proof of concept, and affected versions.
4. The team will acknowledge receipt within 48 hours and coordinate a patch release.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — RBAC and permission matrix.
- [FIREBASE.md](FIREBASE.md) — Firebase Security Rules.
- [DATABASE.md](DATABASE.md) — Activity log and user entity schemas.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Secure production deployment.

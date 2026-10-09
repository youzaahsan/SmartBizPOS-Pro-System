# Product Vision & Strategic Roadmap

This document outlines the architectural roadmap, planned milestones, and feature evolution for **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Product Vision](#product-vision)
- [Roadmap Overview](#roadmap-overview)
- [Phase 1: Foundation & Core Counter POS (Completed — v1.0.0)](#phase-1-foundation--core-counter-pos-completed--v100)
- [Phase 2: Cloud Sync & Hardware Integration (Near-Term)](#phase-2-cloud-sync--hardware-integration-near-term)
- [Phase 3: Multi-Store & Customer Loyalty (Mid-Term)](#phase-3-multi-store--customer-loyalty-mid-term)
- [Phase 4: AI Demand Forecasting & Direct Banking (Long-Term)](#phase-4-ai-demand-forecasting--direct-banking-long-term)
- [Feature Request & Feedback Process](#feature-request--feedback-process)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Product Vision

The mission of **SMARTBIZ CALCULATOR** is to empower everyday shopkeepers and micro-retailers with the speed of a physical desktop calculator combined with the accounting rigor of an enterprise Point of Sale (POS) and inventory platform.

---

## Roadmap Overview

```
[ Phase 1: v1.0.0 ] ──▶ [ Phase 2 ] ──────────▶ [ Phase 3 ] ──────────▶ [ Phase 4 ]
• Smart Calculator       • Firebase Sync          • Multi-Store Sync       • AI Restock Advice
• Dual POS Terminals     • Camera Barcode Scan    • Loyalty Points         • Bank Webhooks
• Udhar Khata Ledger     • Bluetooth ESC/POS      • WhatsApp Cloud API     • Offline PWA
• Inventory & COGS       • Urdu & Multi-Lang      • Batch Expiry Audits    • Voice Input
• RBAC & Masking
```

---

## Phase 1: Foundation & Core Counter POS (Completed — v1.0.0)

- [x] **Smart Business Calculator**: Dual-line tape, percentage, markup (`MU`), grand total (`GT`), memory registers (`M+`, `M-`, `MRC`), and instant GST tax keys.
- [x] **Dual Checkout Modes**: High-throughput Quick Sale terminal and advanced multi-item POS Billing terminal.
- [x] **Thermal Receipt Generator**: Native ESC/POS layouts for 58mm and 80mm paper widths with click-to-WhatsApp balance sharing.
- [x] **Customer Khata & Udhar Ledger**: Searchable customer profiles, double-entry ledger, and payment settlement drawer.
- [x] **Catalog & Live Inventory**: Multi-tier pricing (retail, wholesale, special), low-stock thresholds, and damage adjustment logs.
- [x] **Supplier Purchases & Returns**: Restocking purchase orders (`PUR-XXXX`), accounts payable, and customer returns (`RET-XXXX`).
- [x] **Financial Intelligence**: P&L statement, COGS calculations, operating expense tracking, and 7-day revenue charts.
- [x] **Security & RBAC**: Admin, Manager, and Cashier roles with wholesale purchase cost masking and audit logging.
- [x] **Data Portability**: Full JSON database backup export and restore.

---

## Phase 2: Cloud Sync & Hardware Integration (Near-Term)

- [ ] **Multi-Terminal Cloud Sync**:
  - Live bi-directional synchronization across multiple counter tablets via **Google Cloud Firestore**.
  - Centralized owner dashboard accessible on mobile while cashiers operate counter terminals.
  - See [FIREBASE.md](FIREBASE.md) for the technical architecture.

- [ ] **Camera-Based Barcode Scanner**:
  - WebRTC camera scanner utilizing the native `BarcodeDetector` Web API for smartphones and tablets without dedicated USB laser scanners.

- [ ] **Direct Web Bluetooth ESC/POS Printing**:
  - Direct wireless pairing to portable thermal receipt printers via the Web Bluetooth API, bypassing browser print dialogs.

- [ ] **Localization & Multi-Language Support**:
  - Right-to-Left (RTL) interface support with complete **Urdu (اردو)** and **Arabic (العربية)** translations for local retail shopkeepers.

---

## Phase 3: Multi-Store & Customer Loyalty (Mid-Term)

- [ ] **Multi-Branch & Warehouse Management**:
  - Support multiple shop branches under a single owner account with stock transfers between branches.

- [ ] **Customer Loyalty Points & VIP Discounts**:
  - Automated point accumulation rules (e.g., 1 point per Rs. 100 spent) redeemable at POS checkout.

- [ ] **Automated WhatsApp Cloud API Integration**:
  - Automated dispatch of invoice receipts and weekly Udhar payment reminder statements via official WhatsApp Business API webhooks.

- [ ] **Batch & Expiry Date Tracking**:
  - Per-batch inventory tracking with automated alerts for expiring perishable goods (pharmaceuticals, dairy, packaged foods).

- [ ] **Progressive Web App (PWA) Offline Service Worker**:
  - Full PWA manifest and background service worker allowing offline desktop installation.

---

## Phase 4: AI Demand Forecasting & Direct Banking (Long-Term)

- [ ] **AI-Powered Inventory Restock Advice**:
  - Integration with the **Google Gemini API** (`@google/genai`) to analyze historical sales trends, seasonal patterns, and upcoming holidays to generate predictive supplier purchase orders.

- [ ] **Voice-Activated Calculation & Sale Entry**:
  - Voice recognition allowing shopkeepers to dictate fast counter sales hands-free (e.g., *"Add 2 kg Sugar and 1 liter Oil"*).

- [ ] **Real-Time Bank & Mobile Wallet Reconciliation**:
  - Direct webhook listeners for instant payment confirmation from Raast, Easypaisa, JazzCash, and UPI QR codes, automatically closing the POS tender screen upon fund transfer.

---

## Feature Request & Feedback Process

Have a feature suggestion or architectural proposal?
1. Check existing issues or milestones to see if the proposal is already planned.
2. Submit a feature request using the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md).
3. Discuss feature utility and implementation details with the maintainer team.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [CHANGELOG.md](CHANGELOG.md) — Release notes and version history.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [FIREBASE.md](FIREBASE.md) — Cloud migration plan.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines.

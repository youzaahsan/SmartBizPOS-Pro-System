# Business Intelligence, Analytics & Financial Reporting

This document details the analytics engine, executive dashboards, Profit & Loss (P&L) statements, Cost of Goods Sold (COGS) evaluations, and reporting features of **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Business Intelligence Overview](#business-intelligence-overview)
- [Executive KPI Dashboard (`DashboardOverview.tsx`)](#executive-kpi-dashboard-dashboardoverviewtsx)
  - [Real-Time Metric Cards](#real-time-metric-cards)
  - [Visual Analytics (Recharts Integration)](#visual-analytics-recharts-integration)
  - [Action Shortcuts](#action-shortcuts)
- [Financial Statements & Reports (`BusinessReports.tsx`)](#financial-statements--reports-businessreportstsx)
  - [1. Comprehensive Profit & Loss (P&L) Statement](#1-comprehensive-profit--loss-pl-statement)
  - [2. Cost of Goods Sold (COGS) Analysis](#2-cost-of-goods-sold-cogs-analysis)
  - [3. Store Operating Expenses Breakdown](#3-store-operating-expenses-breakdown)
  - [4. Customer Udhar & Credit Risk Aging](#4-customer-udhar--credit-risk-aging)
  - [5. Staff Cashier Sales & Audit Report](#5-staff-cashier-sales--audit-report)
- [Data Export & Accountant Interoperability](#data-export--accountant-interoperability)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Business Intelligence Overview

Most small retailers track only gross cash inflows without calculating their true Cost of Goods Sold (COGS) or net operating margins. SMARTBIZ CALCULATOR includes a **real-time Business Intelligence engine** that calculates financial health metrics on every completed transaction.

---

## Executive KPI Dashboard (`DashboardOverview.tsx`)

The dashboard serves as the central operational hub for store owners and managers upon application launch.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  TODAY'S SALES  │ │  GROSS PROFIT   │ │  UDHAR BALANCE  │ │ LOW STOCK ITEMS │
│  Rs. 48,500     │ │  Rs. 9,450      │ │  Rs. 18,500     │ │     3 Items     │
│  +12% vs y'day  │ │  Margin 19.5%   │ │  2 Overdue      │ │ Action required │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Real-Time Metric Cards
1. **Today's Gross Sales**: Sum of `grandTotal` for all invoices completed today.
2. **Today's Gross Profit**: Calculated as $\text{Grand Total} - \text{Total Cost (COGS)}$.
3. **Total Customer Udhar Outstanding**: Sum of all `totalDue` balances across the customer directory.
4. **Low Stock Alert Counter**: Number of products where `stockQuantity <= minStock`.

### Visual Analytics (Recharts Integration)
- **7-Day Revenue Trend Chart**: Interactive `AreaChart` rendering daily revenue curves.
- **Hourly Sales Volume**: Helps store owners identify peak rush hours and optimize staff coverage.

### Action Shortcuts
One-click shortcuts to frequent workflows:
- *Start New Quick Sale*
- *Open Smart Calculator*
- *Record Udhar Payment*
- *Create Restock Purchase*

---

## Financial Statements & Reports (`BusinessReports.tsx`)

The dedicated **Reports** module provides detailed financial statements for any selectable date range:

### 1. Comprehensive Profit & Loss (P&L) Statement

$$\begin{aligned}
\text{Gross Revenue} &= \sum \text{Invoice Grand Totals} \\
\text{Less: Cost of Goods Sold (COGS)} &= \sum (\text{Sold Item Quantity} \times \text{Purchase Price}) \\
\hline
\mathbf{\text{Gross Profit}} &= \mathbf{\text{Gross Revenue} - \text{COGS}} \\
\text{Gross Margin \%} &= \frac{\text{Gross Profit}}{\text{Gross Revenue}} \times 100 \\
\hline
\text{Less: Operating Expenses} &= \sum \text{Store Overhead Expenses} \\
\hline
\mathbf{\text{Net Profit}} &= \mathbf{\text{Gross Profit} - \text{Operating Expenses}} \\
\text{Net Margin \%} &= \frac{\text{Net Profit}}{\text{Gross Revenue}} \times 100
\end{aligned}$$

#### P&L Statement Representation:
```
============================================================
              PROFIT & LOSS STATEMENT (P&L)
 Period: 2026-10-01 to 2026-10-09 | Currency: PKR (Rs.)
============================================================
 Gross Sales Revenue:                       Rs. 252,500.00
 Cost of Goods Sold (COGS):                 Rs. 206,100.00
------------------------------------------------------------
 GROSS PROFIT:                               Rs. 46,400.00
 Gross Profit Margin:                               18.38%
------------------------------------------------------------
 OPERATING EXPENSES:
   - Electricity & Utilities:               Rs.  12,500.00
   - Staff Salaries & Wages:                Rs.  18,000.00
   - Shop Rent:                             Rs.  15,000.00
   - Tea & Refreshments:                    Rs.   1,850.00
   - Transport & Logistics:                 Rs.   2,400.00
 Total Operating Expenses:                   Rs.  49,750.00
------------------------------------------------------------
 NET PROFIT / (LOSS):                       (Rs.   3,350.00)
 Net Profit Margin:                                 -1.32%
============================================================
```

---

### 2. Cost of Goods Sold (COGS) Analysis
The system automatically tracks unit acquisition costs:
- When a product is sold, its authoritative `purchasePrice` is captured in the `InvoiceItem`.
- Even if a product's retail price is discounted at checkout, COGS remains accurate.
- Cashiers cannot view COGS figures on their screens, preserving business confidentiality.

---

### 3. Store Operating Expenses Breakdown
Operating expenses logged in `/src/components/expenses/ExpenseManagement.tsx` are categorized and summarized:
- **Rent**: Shop lease and premises rent.
- **Electricity & Utilities**: Commercial power, water, internet bills.
- **Salaries**: Staff wages and daily allowances.
- **Transport**: Delivery, fuel, and hauling costs.
- **Supplies**: Bags, thermal printer paper rolls, packaging materials.
- **Tea & Refreshments**: Hospitality and counter refreshments.
- **Maintenance**: Equipment repairs, shelving, lighting.

An interactive distribution chart visualizes which overhead category consumes the largest portion of gross revenue.

---

### 4. Customer Udhar & Credit Risk Aging
Analyzes outstanding credit across the customer base:
- **Active Credit Customers**: Total number of customers holding an unpaid balance.
- **Total Udhar Capital Tied Up**: Total money owed to the store by customers.
- **Aging Analysis**: Separates recent balances (< 15 days) from aging balances (> 30 days).
- **Direct WhatsApp Reminders**: Action button to dispatch WhatsApp balance payment notices.

---

### 5. Staff Cashier Sales & Audit Report
Audits cashier activity to monitor performance and drawer reconciliation:

| Staff Member | Role | Invoices Created | Total Revenue Collected | Average Basket Value |
|---|:---:|:---:|:---:|:---:|
| Bilal Ahmed | Cashier | 42 | Rs. 84,200 | Rs. 2,004 |
| Hamza Tariq | Manager | 18 | Rs. 54,300 | Rs. 3,016 |
| Youza Manzoor | Admin | 12 | Rs. 114,000 | Rs. 9,500 |

---

## Data Export & Accountant Interoperability

SMARTBIZ allows store owners to export their business records for accountants, tax filings, and external audits:
1. **CSV Export**: Financial statements, product catalogs, and customer statements can be downloaded as standard `.csv` spreadsheets.
2. **Thermal Summary Slip**: Generates an 80mm printable shift summary containing daily sales, cash tendered, and category totals.
3. **Full JSON Database Backup**: Contains the entire relational database state, ready for backup or restoration.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [DATABASE.md](DATABASE.md) — Expense and invoice data schemas.
- [INVENTORY_AND_PURCHASES.md](INVENTORY_AND_PURCHASES.md) — Inventory cost and asset valuation.
- [AUTHENTICATION_AND_PERMISSIONS.md](AUTHENTICATION_AND_PERMISSIONS.md) — Profit report security restrictions.

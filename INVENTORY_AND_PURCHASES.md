# Inventory, Catalog, Purchases & Returns Management

This document details the inventory lifecycle, product catalog, supplier purchase orders, accounts payable, stock adjustments, and sales returns within **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [Product Catalog & Margin Engineering](#product-catalog--margin-engineering)
  - [Measurement Units](#measurement-units)
  - [Multi-Tier Pricing Strategy](#multi-tier-pricing-strategy)
  - [Profit Margin Calculation](#profit-margin-calculation)
  - [Low-Stock Thresholds & Reorder Indicators](#low-stock-thresholds--reorder-indicators)
- [The Inventory Lifecycle](#the-inventory-lifecycle)
- [Stock Movement Ledger (`inventoryTransactions`)](#stock-movement-ledger-inventorytransactions)
- [Stock Adjustments & Damage Write-Offs](#stock-adjustments--damage-write-offs)
- [Inventory Valuation Audits](#inventory-valuation-audits)
- [Supplier Directory & Purchase Orders](#supplier-directory--purchase-orders)
  - [Creating a Supplier Purchase Order](#creating-a-supplier-purchase-order)
  - [Supplier Accounts Payable Ledger](#supplier-accounts-payable-ledger)
- [Sales Returns & Refund Processing](#sales-returns--refund-processing)
  - [Restockable vs. Damaged Goods Logic](#restockable-vs-damaged-goods-logic)
  - [Customer Ledger & Udhar Reconciliation](#customer-ledger--udhar-reconciliation)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Product Catalog & Margin Engineering

The Product Catalog (`/src/components/products/ProductManagement.tsx`) maintains all salable goods in the store.

### Measurement Units
Products support standard retail and wholesale units:
- `KG`: Kilograms (e.g., Rice, Sugar, Flour, Pulses)
- `L`: Litres (e.g., Edible Oils, Beverages)
- `PCS`: Individual units (e.g., Packaged items, Hardware, Toiletries)
- `PACK`: Bundled packs (e.g., Biscuit packs, Cigarette packs)
- `BOX`: Outer cases or cartons (e.g., Soap cases, Beverage crates)
- `GM`: Grams (e.g., Spices, Saffron)
- `MTR`: Metres (e.g., Fabric, Cables)

---

### Multi-Tier Pricing Strategy
Every product maintains three distinct customer selling rates alongside its purchase cost:

```
┌────────────────────────────────────────────────────────┐
│  PRODUCT: Premium Basmati Rice (1 KG)                  │
├────────────────────────────────────────────────────────┤
│  Purchase Cost (Wholesale):      Rs. 260.00            │
│  Retail Price (Walk-in):         Rs. 320.00 (Margin 18.7%)│
│  Wholesale Price (Bulk Buyer):   Rs. 300.00 (Margin 13.3%)│
│  Special Price (VIP Account):    Rs. 290.00 (Margin 10.3%)│
└────────────────────────────────────────────────────────┘
```

When ringing up items in the POS Billing Terminal, the cashier can toggle between these tiers with a single click.

---

### Profit Margin Calculation
The system calculates gross margin percentage based on retail selling price:

$$\text{Margin \%} = \frac{\text{Retail Price} - \text{Purchase Price}}{\text{Retail Price}} \times 100$$

*Example*:
- Purchase Cost: Rs. 140
- Retail Price: Rs. 180
- Margin: $\frac{180 - 140}{180} \times 100 = 22.2\%$

*(Note: Purchase cost and calculated margins are automatically hidden from Cashiers via RBAC rules).*

---

### Low-Stock Thresholds & Reorder Indicators
Each product specifies a `minStock` threshold. When `stockQuantity <= minStock`:
1. The product displays an amber/red **Low Stock Alert** badge in the catalog.
2. The item is flagged in the **Dashboard KPI Counter** (`DashboardOverview.tsx`).
3. An automatic restocking shortcut is populated for purchase order generation.

---

## The Inventory Lifecycle

Stock quantities move through automated events managed by the `DatabaseEngine`:

```
               ┌───────────────────────────────┐
               │      SUPPLIER PURCHASE        │
               │        (Stock In: +N)         │
               └──────────────┬────────────────┘
                              │
                              ▼
┌──────────────────────▶ [ INVENTORY ] ◀──────────────────────┐
│                       (Current Count)                        │
│                             │                                │
▼                             ▼                                ▼
┌────────────────┐   ┌────────────────┐               ┌────────────────┐
│  CUSTOMER SALE │   │  DAMAGE WRITE- │               │  SALES RETURN  │
│ (Stock Out: -N)│   │  OFF (-N)      │               │ (Restocked: +N)│
└────────────────┘   └────────────────┘               └────────────────┘
```

---

## Stock Movement Ledger (`inventoryTransactions`)

Every unit change is recorded as an immutable transaction in `inventoryTransactions` (`/src/components/inventory/InventoryManagement.tsx`):

| Date | Product | Type | Delta | Previous | New Stock | Reference | Operator |
|---|---|:---:|:---:|:---:|:---:|---|---|
| 2026-10-09 | Sugar (Cheeni) | `sale` | `-5` | `250` | `245` | `SB-1002` | Bilal Ahmed |
| 2026-10-08 | Olpers Milk | `purchase` | `+40` | `20` | `60` | `PUR-5002` | Hamza Tariq |
| 2026-10-07 | Dalda Oil 1L | `damaged` | `-2` | `97` | `95` | Leakage Write-off | Youza Manzoor |
| 2026-10-06 | Basmati Rice | `return` | `+1` | `179` | `180` | `RET-3001` | Hamza Tariq |

---

## Stock Adjustments & Damage Write-Offs

When goods expire, suffer packaging leakage, or discrepancy occurs during manual physical counts, managers can adjust stock using `adjustStock()`:

1. Select product from the Inventory screen.
2. Choose reason:
   - **`damaged`**: Writes off stock due to spoilage, breakage, or expiry.
   - **`adjustment`**: Re-aligns system count with physical shelf count.
3. Enter quantity delta (positive or negative) and explanatory notes.
4. The system updates `stockQuantity`, writes an `InventoryTransaction`, and records an audit log entry.

---

## Inventory Valuation Audits

The Inventory Management dashboard calculates live inventory valuation across the entire catalog:
- **Total Stock Units**: Sum of all on-hand product quantities.
- **Valuation at Cost (COGS Asset Value)**:
  $$\text{Asset Valuation} = \sum (\text{stockQuantity}_i \times \text{purchasePrice}_i)$$
- **Potential Retail Value**:
  $$\text{Retail Valuation} = \sum (\text{stockQuantity}_i \times \text{retailPrice}_i)$$
- **Expected Gross Profit Potential**:
  $$\text{Gross Potential} = \text{Retail Valuation} - \text{Asset Valuation}$$

---

## Supplier Directory & Purchase Orders

Supplier tracking is managed in `/src/components/purchases/PurchaseManagement.tsx`.

### Creating a Supplier Purchase Order
1. Select vendor from the pre-registered supplier directory (e.g., *Chaudhry Rauf Sugar Mills*).
2. Add restocked products, quantities received, and wholesale purchase cost per unit.
3. Enter amount paid immediately to the supplier; any unpaid balance is recorded as **Accounts Payable** (`dueAmount`).
4. **Automated Side Effects**:
   - Assigns sequential ID: `PUR-5001`.
   - Increments inventory for each product line item.
   - Updates product `purchasePrice` to reflect supplier price updates.
   - Updates supplier `totalPurchases` and `totalDue`.
   - Appends a `SupplierLedgerEntry`.

---

### Supplier Accounts Payable Ledger
Tracks transactions with wholesale vendors:
- **Debit**: Payments issued to the supplier (reduces balance owed).
- **Credit**: Goods received on credit (increases balance owed).
- **Balance**: Current net accounts payable balance.

---

## Sales Returns & Refund Processing

Managed via `/src/components/returns/ReturnManagement.tsx`.

### Restockable vs. Damaged Goods Logic
When a customer returns an item:
- **Restock (`restock: true`)**: Used for unopened, undamaged goods. The engine increments product `stockQuantity` and logs an `InventoryTransaction` of type `'return'`.
- **Damaged (`restock: false`)**: Used for spoiled or broken goods. Inventory counts remain untouched; the item is recorded as a dead loss.

---

### Customer Ledger & Udhar Reconciliation
1. **Refund Method**:
   - **`cash`**: Cash returned to customer immediately from the counter drawer.
   - **`credit_adjust`**: Deducted directly from customer's outstanding Udhar debt balance.
2. **Double-Entry Impact**:
   - Updates customer's `totalDue = Math.max(0, currentDue - refundAmount)`.
   - Posts a `CustomerLedgerEntry` recording the return credit adjustment.
   - Updates the parent invoice status to `'partial_refund'` or `'refunded'`.

---

## Cross-Document Navigation

- [README.md](README.md) — System overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [DATABASE.md](DATABASE.md) — Product, purchase, and return schemas.
- [CALCULATOR_AND_BILLING.md](CALCULATOR_AND_BILLING.md) — POS billing terminal.
- [BUSINESS_INTELLIGENCE.md](BUSINESS_INTELLIGENCE.md) — Cost of goods sold (COGS) reporting.

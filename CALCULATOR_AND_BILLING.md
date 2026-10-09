# Smart Calculator, POS & Billing Operations

This document provides a comprehensive operational guide to the **Smart Business Calculator**, **Quick Sale Terminal**, **Advanced POS Billing**, **Thermal Receipt Printing**, and **Customer Khata Conversion** workflows in **SMARTBIZ CALCULATOR**.

---

## 📌 Table of Contents

- [The Smart Business Calculator](#the-smart-business-calculator)
  - [Dual-Line Display Architecture](#dual-line-display-architecture)
  - [Arithmetic & Business Keypad Functions](#arithmetic--business-keypad-functions)
  - [Memory Registers (`M+`, `M-`, `MRC`)](#memory-registers-m-m--mrc)
  - [Markup (`MU`) & Grand Total (`GT`) Logic](#markup-mu--grand-total-gt-logic)
  - [Instant GST Add & Remove Keys](#instant-gst-add--remove-keys)
  - [Audit Calculation Tape & History](#audit-calculation-tape--history)
  - [Acoustic Keypad Feedback](#acoustic-keypad-feedback)
- [Workflow Bridges: Calculator to POS](#workflow-bridges-calculator-to-pos)
  - [1. Convert Calculation to POS Bill](#1-convert-calculation-to-pos-bill)
  - [2. Save Directly to Customer Udhar](#2-save-directly-to-customer-udhar)
- [Quick Sale Terminal (High-Speed Counter)](#quick-sale-terminal-high-speed-counter)
- [Advanced POS Billing Terminal](#advanced-pos-billing-terminal)
  - [Barcode Scanning & Product Search](#barcode-scanning--product-search)
  - [Multi-Tier Pricing (Retail, Wholesale, Special)](#multi-tier-pricing-retail-wholesale-special)
  - [Line-Item & Bill-Level Discounts](#line-item--bill-level-discounts)
  - [Credit & Udhar Assignment](#credit--udhar-assignment)
- [Thermal Receipt Printing & WhatsApp Sharing](#thermal-receipt-printing--whatsapp-sharing)
- [QR Code Payment Terminal](#qr-code-payment-terminal)
- [Cross-Document Navigation](#cross-document-navigation)

---

## The Smart Business Calculator

The Smart Calculator (`/src/components/calculator/SmartCalculator.tsx`) is designed specifically for shopkeepers who rely on fast tactile physical desktop calculators (Citizen/Casio style) but require modern digital logging and invoicing capabilities.

```
┌────────────────────────────────────────────────────────┐
│  EXPRESSION TAPE:  150 * 4 + 250 - 50                  │
│  CURRENT VALUE:   750                                  │
├────────────────────────────────────────────────────────┤
│  [ MC ] [ MR ] [ M- ] [ M+ ] [ GT ] [ MU ]             │
│  [ C  ] [ AC ] [ ⌫  ] [ %  ] [ +GST 17% ] [ -GST 17% ] │
│  [ 7  ] [ 8  ] [ 9  ] [ ÷  ] [ CONVERT TO BILL ]       │
│  [ 4  ] [ 5  ] [ 6  ] [ ×  ] [ SAVE TO CUSTOMER ]     │
│  [ 1  ] [ 2  ] [ 3  ] [ -  ]                           │
│  [ 0  ] [ 00 ] [ .  ] [ +  ] [       =        ]       │
└────────────────────────────────────────────────────────┘
```

### Dual-Line Display Architecture
- **Upper Line (Tape)**: Shows the current ongoing expression string with operands and operators (e.g., `500 + 1200 - 15%`).
- **Lower Line (Result)**: Formatted, bold numeric display showing the current accumulated total or entered figure with standard thousands grouping (e.g., `1,445`).

---

### Arithmetic & Business Keypad Functions

| Key | Operation | Technical Behavior |
|---|---|---|
| `0`–`9`, `00` | Digit Entry | Appends digit to the active numeric operand. |
| `.` | Decimal Point | Appends decimal separator; prevents duplicate points. |
| `+`, `-`, `×`, `÷` | Operators | Commits current operand and sets active operator. |
| `%` | Percentage | Computes percentage of previous operand (`1000 + 15%` = `1150`). |
| `C` | Clear | Clears current operand without erasing previous accumulation. |
| `AC` | All Clear | Resets current operand, expression tape, and active operator. |
| `⌫` | Backspace | Removes the last entered character from display. |
| `=` | Equals | Evaluates complete mathematical expression and commits to tape history. |

---

### Memory Registers (`M+`, `M-`, `MRC`)
- **`M+`**: Adds the current display value to the in-memory accumulator.
- **`M-`**: Subtracts the current display value from the accumulator.
- **`MRC` / `MR`**: Recalls the accumulated memory value on first press; clears memory register on second press.

---

### Markup (`MU`) & Grand Total (`GT`) Logic

#### Markup (`MU`):
Calculates retail selling price based on gross margin:
$$\text{Selling Price} = \frac{\text{Cost Price}}{1 - \frac{\text{Markup \%}}{100}}$$
*Example*: Entering `1000 MU 20` calculates `1,250` (ensuring a 20% margin on selling price, rather than a simple 20% cost markup).

#### Grand Total (`GT`):
Maintains an internal running accumulator of all expressions evaluated via the `=` key during the active session. Tapping `GT` recalls this accumulated grand sum.

---

### Instant GST Add & Remove Keys
Customizable tax shortcuts allow shopkeepers to calculate taxes instantly:
- **`+17% GST`**: Multiplies display value by `1.17`, displaying the gross tax-inclusive price.
- **`-17% GST`**: Multiplies display value by $\frac{1}{1.17}$, extracting the pre-tax net price.
- Rates adapt dynamically if configured differently in store settings.

---

### Audit Calculation Tape & History
Every completed calculation is automatically recorded in the database collection `calculations` with:
- Full expression text and final result.
- Timestamp and human-readable time (e.g., `10:45 AM`).
- Category classification (`General`, `Shopping`, `Customer`, `GST`, `Discount`, `Markup`, `Profit`).
- **Favorite Star Toggle**: Star calculations for persistent one-click reload.
- Search and category filters.

---

### Acoustic Keypad Feedback
The calculator uses the browser's Web Audio API (`DbContext.tsx`):
- Keypad presses trigger an 800Hz sine beep (50ms).
- Result calculation triggers a rising melodic harmonic chime.
- Invalid operations (e.g., divide by zero) trigger a low error buzz.

---

## Workflow Bridges: Calculator to POS

SMARTBIZ allows calculations to be converted into POS bills with a single click:

### 1. Convert Calculation to POS Bill
- Clicking **"Convert to Bill"** captures the active expression or tape lines.
- Automatically transfers the calculated amount and line items into the **POS Billing Terminal** (`BillingView.tsx`).
- Switches the active view directly to the checkout screen.

### 2. Save Directly to Customer Udhar
- Clicking **"Save to Customer"** opens `SaveToCustomerModal.tsx`.
- The shopkeeper selects an existing customer from the searchable directory.
- The system automatically loads the customer's profile, converts the calculated total into a bill, and marks the balance as credit (*Udhar*).

---

## Quick Sale Terminal (High-Speed Counter)

Located at `/src/components/pos/QuickSale.tsx`, this terminal is optimized for high-volume walk-in counters where items are sold without individual barcodes:

```
┌────────────────────────────────────────────────────────┐
│                   QUICK SALE COUNTER                   │
│                                                        │
│  SALE AMOUNT:   Rs. 1,450                              │
│  CASH TENDERED: Rs. 2,000                              │
│  CHANGE DUE:    Rs. 550                                │
│                                                        │
│  QUICK CASH BUTTONS:                                   │
│  [ Rs. 500 ]  [ Rs. 1,000 ]  [ Rs. 2,000 ]  [ Rs. 5,000 ]│
│                                                        │
│  [ CANCEL ]              [ COMPLETE SALE (ENTER) ]     │
└────────────────────────────────────────────────────────┘
```

- **Features**:
  - Full keyboard numpad support.
  - Instant change return computation.
  - Automatically records sale under `cust_walkin` with invoice sequence `SB-XXXX`.
  - Plays the synthesized `cash` acoustic register sound.

---

## Advanced POS Billing Terminal

Located at `/src/components/pos/BillingView.tsx`, the advanced terminal handles multi-item retail baskets:

### Barcode Scanning & Product Search
- Search bar accepts both keyboard typing (product name/SKU) and USB/Bluetooth hardware barcode scanners.
- Automatic exact match lookup adds scanned products directly to the basket.

### Multi-Tier Pricing (Retail, Wholesale, Special)
- Each line item includes a tier selector:
  - **Retail**: Standard consumer price.
  - **Wholesale**: Volume discount rate.
  - **Special**: Preferential pricing for VIP customers.
- Automatically recalculates line totals upon tier selection.

### Line-Item & Bill-Level Discounts
- **Line Item Discount**: Apply either a percentage discount (e.g., `5%`) or a fixed deduction (e.g., `Rs. 50`).
- **Bill Discount**: Apply an overall discount to the entire basket subtotal before tax computation.

### Credit & Udhar Assignment
- Searchable customer selector.
- If selected, customer's current outstanding balance is displayed.
- The cashier enters the cash amount paid; any remaining unpaid balance (`dueAmount`) is automatically posted to the customer's **Udhar Khata Ledger**.

---

## Thermal Receipt Printing & WhatsApp Sharing

Rendered via `/src/components/pos/ThermalReceipt.tsx`:

```
=========================================
      AL-MADINA SMART SUPERSTORE
   Shop # 14-B, Commercial Market
        Phone: 0300-1234567
       NTN/GST: NTN-8924018-7
=========================================
Invoice #: SB-1002       Date: 2026-10-09
Cashier: Bilal Ahmed     Customer: Ali Khan
-----------------------------------------
Item              Qty   Rate       Total
-----------------------------------------
Sugar (Cheeni)     5 kg  180.00   900.00
Basmati Rice       2 kg  320.00   640.00
-----------------------------------------
Subtotal:                       1,540.00
Discount:                          40.00
Grand Total:                    1,500.00
Amount Paid (Cash):             1,000.00
Balance Due (Udhar):              500.00
-----------------------------------------
Previous Customer Balance:     13,500.00
New Outstanding Balance:       14,000.00
=========================================
 Thank you for shopping! Goods once sold
 cannot be returned without receipt.
=========================================
```

### Features:
1. **ESC/POS Layout**: Formatted for 58mm and 80mm thermal paper widths.
2. **Native CSS Print Isolation**: Triggers browser print without third-party drivers.
3. **Click-to-WhatsApp Sharing**: Generates a pre-formatted WhatsApp message link:
   ```
   https://wa.me/{phone}?text=Dear {Customer}, thank you for your purchase of Rs. {Total} at Al-Madina Superstore. Invoice #{InvNum}. Current balance due: Rs. {Balance}.
   ```

---

## QR Code Payment Terminal

Rendered via `/src/components/pos/QrPaymentModal.tsx`:
- Generates dynamic QR codes linked to the business's configured payment identifier (Easypaisa, JazzCash, UPI, Raast, or Bank IBAN).
- Displays exact payable invoice amount for customer scanning.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [DATABASE.md](DATABASE.md) — Invoice and calculation entity schemas.
- [INVENTORY_AND_PURCHASES.md](INVENTORY_AND_PURCHASES.md) — Inventory decrement flows.
- [BUSINESS_INTELLIGENCE.md](BUSINESS_INTELLIGENCE.md) — Sales and revenue reporting.

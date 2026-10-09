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

export interface BusinessSettings {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  taxId?: string; // GST/VAT/NTN
  currency: string;
  currencySymbol: string;
  invoicePrefix: string;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  paymentIdentifier?: string; // UPI / IBAN / Easypaisa / Jazzcash / Bank ID
  receiptFooterNote: string;
  paperSize: '58mm' | '80mm' | 'A4';
  autoPrintReceipt: boolean;
  enableSound: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string; // KG, L, PCS, PACK, BOX, GM, MTR
  purchasePrice: number;
  retailPrice: number;
  wholesalePrice: number;
  specialPrice: number;
  stockQuantity: number;
  minStock: number;
  taxRate: number;
  expiryDate?: string;
  imageUrl?: string;
  description?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  customerType: 'walk-in' | 'regular' | 'wholesale' | 'vip';
  totalPurchases: number;
  totalPaid: number;
  totalDue: number; // Udhar / credit balance
  createdAt: string;
  lastPurchaseDate?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  businessId: string;
  customerId: string;
  date: string;
  type: 'sale' | 'payment' | 'return' | 'opening_balance' | 'adjustment';
  referenceId?: string; // Invoice ID or Payment ID
  description: string;
  debit: number; // Increases due balance
  credit: number; // Decreases due balance
  balance: number; // Balance after this transaction
  createdBy: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number; // Payable to supplier
  createdAt: string;
}

export interface SupplierLedgerEntry {
  id: string;
  businessId: string;
  supplierId: string;
  date: string;
  type: 'purchase' | 'payment' | 'return' | 'opening_balance';
  referenceId?: string;
  description: string;
  debit: number; // Paid to supplier (reduces balance)
  credit: number; // Goods bought (increases balance owed)
  balance: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  purchaseCost: number; // for profit tracking (hidden from cashier)
  unitPrice: number;
  priceType: 'retail' | 'wholesale' | 'special';
  discount: number; // discount amount on this line
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'upi_qr' | 'bank_transfer' | 'credit';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  itemDiscountsTotal: number;
  billDiscount: number;
  billDiscountType: 'percentage' | 'fixed';
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  totalCost: number; // Cost of goods sold
  grossProfit: number; // grandTotal - totalCost
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  status: 'completed' | 'cancelled' | 'refunded' | 'partial_refund';
  cashierId: string;
  cashierName: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  businessId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: 'received' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  restock: boolean;
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  businessId: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: ReturnItem[];
  totalRefund: number;
  refundMethod: 'cash' | 'credit_adjust' | 'bank';
  reason: string;
  processedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  title: string;
  category: 'Rent' | 'Electricity' | 'Salaries' | 'Transport' | 'Supplies' | 'Maintenance' | 'Tea & Refreshments' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  type: 'sale' | 'purchase' | 'return' | 'adjustment' | 'damaged';
  quantityDelta: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceId?: string; // invoiceId, purchaseId, etc.
  notes?: string;
  date: string;
  createdBy: string;
}

export interface CalculationRecord {
  id: string;
  businessId: string;
  userId: string;
  expression: string;
  result: string;
  calculationType: string;
  category: 'General' | 'Shopping' | 'Customer' | 'GST' | 'Discount' | 'Markup' | 'Profit' | 'Other';
  isFavorite: boolean;
  notes?: string;
  date: string;
  time: string;
  timestamp: number;
}

export interface PaymentReminder {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dueAmount: number;
  dueDate?: string;
  lastReminderSent?: string;
  reminderCount: number;
  status: 'pending' | 'sent' | 'resolved';
  notes?: string;
}

export interface ActivityLog {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string; // 'invoice', 'product', 'customer', etc.
  entityId?: string;
  details: string;
  timestamp: string;
}

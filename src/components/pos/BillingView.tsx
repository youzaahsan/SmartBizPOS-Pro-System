import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  CreditCard,
  QrCode,
  CheckCircle,
  FileText,
  Printer,
  Share2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Percent,
  X,
  UserPlus
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Customer, Invoice, InvoiceItem, PaymentMethod } from '../../types';
import { ThermalReceipt } from './ThermalReceipt';
import { QrPaymentModal } from './QrPaymentModal';

interface BillingViewProps {
  initialItems?: { name: string; quantity: number; price: number }[];
  initialCustomer?: Customer;
  onClearInitial?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  initialItems,
  initialCustomer,
  onClearInitial,
}) => {
  const { products, customers, invoices, saveCustomer, playSound } = useDb();
  const { currentUser, currentBusiness } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'invoices'>('create');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(() => {
    return initialCustomer || customers.find((c) => c.id === 'cust_walkin') || customers[0];
  });
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);

  // Cart
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(currentBusiness.defaultTaxRate || 0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');

  // Modals
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Invoices list filters
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<string>('all');

  // Load initial items from SmartCalculator if provided
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      const converted: InvoiceItem[] = initialItems.map((item) => {
        const match = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: match?.id || 'prod_custom',
          productName: item.name,
          unit: match?.unit || 'PCS',
          quantity: item.quantity || 1,
          purchaseCost: match?.purchasePrice || item.price * 0.75,
          unitPrice: item.price,
          priceType: 'retail',
          discount: 0,
          discountType: 'fixed',
          taxRate: match?.taxRate || 0,
          taxAmount: 0,
          total: item.quantity * item.price,
        };
      });
      setCart(converted);
      if (onClearInitial) onClearInitial();
    }
  }, [initialItems]);

  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
    }
  }, [initialCustomer]);

  // Sync paid amount with grand total unless manually edited
  const subtotal = cart.reduce((acc, i) => acc + i.total, 0);
  const taxTotal = (subtotal * taxRate) / 100;
  const grandTotal = Math.max(0, subtotal - billDiscount + taxTotal);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Auto-set paid amount to grandTotal when cart changes if previously matched
  useEffect(() => {
    setPaidAmount(grandTotal);
  }, [grandTotal]);

  const addProductToBill = (product: any, priceType: 'retail' | 'wholesale' | 'special' = 'retail') => {
    playSound('beep');
    const price =
      priceType === 'wholesale'
        ? product.wholesalePrice
        : priceType === 'special'
        ? product.specialPrice
        : product.retailPrice;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id && item.priceType === priceType);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          productId: product.id,
          productName: product.name,
          unit: product.unit || 'PCS',
          quantity: 1,
          purchaseCost: product.purchasePrice || 0,
          unitPrice: price,
          priceType,
          discount: 0,
          discountType: 'fixed',
          taxRate: product.taxRate || 0,
          taxAmount: 0,
          total: price,
        },
      ];
    });
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = { ...item, ...updates };
          const qty = Math.max(0.1, Number(next.quantity));
          const price = Number(next.unitPrice);
          const disc = Number(next.discount) || 0;
          next.total = Math.max(0, qty * price - disc);
          return next;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    playSound('beep');
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCompleteBill = () => {
    if (cart.length === 0) return;
    playSound('cash');

    const paymentStatus =
      paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const newInvoice = db.createInvoice(
      {
        businessId: currentBusiness.id,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        date: new Date().toISOString().split('T')[0],
        items: cart,
        subtotal,
        itemDiscountsTotal: 0,
        billDiscount,
        billDiscountType: 'fixed',
        taxTotal,
        grandTotal,
        paidAmount,
        dueAmount,
        totalCost: 0,
        grossProfit: 0,
        paymentStatus,
        paymentMethod: dueAmount > 0 && paidAmount === 0 ? 'credit' : paymentMethod,
        notes,
        status: 'completed',
        cashierId: currentUser?.id || 'cashier',
        cashierName: currentUser?.name || 'Staff',
      },
      {
        id: currentUser?.id || 'user',
        name: currentUser?.name || 'Staff',
        role: currentUser?.role || 'cashier',
      }
    );

    setCompletedInvoice(newInvoice);
    setCart([]);
    setBillDiscount(0);
    setNotes('');
  };

  // Customers filtered for quick search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(invoiceSearch));
    const matchStatus =
      invoiceFilterStatus === 'all' || inv.paymentStatus === invoiceFilterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Billing & Invoice Terminal</h1>
            <p className="text-xs text-gray-500">
              Complete POS with Udhar / Credit management & itemized receipts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'create'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            + New Bill / Sale
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Invoices Archive ({invoices.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer & Product Pickers */}
          <div className="lg:col-span-7 space-y-4">
            {/* Customer Box */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  Billed To Customer:
                </span>
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Register Customer
                </button>
              </div>

              {/* Active Selected Customer Bar */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs">
                <div>
                  <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    {selectedCustomer.name}
                    <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                      {selectedCustomer.customerType}
                    </span>
                  </div>
                  <div className="text-emerald-700 flex items-center gap-1 mt-0.5 text-[11px]">
                    <Phone className="w-3 h-3" />
                    {selectedCustomer.phone}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-gray-500">Current Due (Udhar):</div>
                  <div
                    className={`font-mono font-black text-sm ${
                      selectedCustomer.totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {currentBusiness.currencySymbol}{selectedCustomer.totalDue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Customer quick dropdown / search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Change customer: search name or phone number..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden"
                />
                {customerSearch.trim().length > 0 && (
                  <div className="absolute top-10 left-0 right-0 z-20 bg-white border border-gray-200 shadow-xl rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1">
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch('');
                        }}
                        className="p-2 hover:bg-emerald-50 rounded-xl cursor-pointer flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-gray-900">{c.name} ({c.phone})</span>
                        <span className="font-mono text-rose-600 font-bold">
                          Due: {currentBusiness.currencySymbol}{c.totalDue}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Catalog Picker */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  Add Products to Bill
                </span>
                <span className="text-[11px] text-gray-500">
                  Tip: Multi-tier pricing enabled
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Type product name, SKU, or scan barcode..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Products list with price buttons */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.barcode.includes(productSearch) ||
                      p.sku.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((p) => {
                    const lowStock = p.stockQuantity <= p.minStock;
                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-gray-50/70 hover:bg-emerald-50/40 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            {p.name}
                            {lowStock && (
                              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                Low: {p.stockQuantity} {p.unit}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            SKU: {p.sku} • Stock: {p.stockQuantity} {p.unit}
                          </div>
                        </div>

                        {/* Price selector buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => addProductToBill(p, 'retail')}
                            className="px-2.5 py-1.5 bg-white hover:bg-emerald-600 hover:text-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition"
                            title="Add Retail Price"
                          >
                            Retail {currentBusiness.currencySymbol}{p.retailPrice}
                          </button>
                          <button
                            onClick={() => addProductToBill(p, 'wholesale')}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold text-blue-800 transition"
                            title="Add Wholesale Price"
                          >
                            Wholesale {currentBusiness.currencySymbol}{p.wholesalePrice}
                          </button>
                          <button
                            onClick={() => addProductToBill(p, 'special')}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white border border-purple-200 rounded-xl text-xs font-bold text-purple-800 transition"
                            title="Add Special Customer Price"
                          >
                            Special {currentBusiness.currencySymbol}{p.specialPrice}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column: Active Bill Terminal */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <h2 className="font-bold text-sm text-gray-900">Current Bill Items</h2>
                    <p className="text-[11px] text-gray-500">
                      Invoice for {selectedCustomer.name}
                    </p>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Clear Items
                    </button>
                  )}
                </div>

                {/* Bill Items List */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                  {cart.length === 0 ? (
                    <div className="py-14 text-center text-gray-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                      <p className="text-xs">No items on this bill</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Select products on left or convert from Smart Calculator
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-gray-900">{item.productName}</div>
                            <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-semibold uppercase">
                              {item.priceType}
                            </span>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Editable Qty & Unit Price */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div>
                            <label className="text-[10px] text-gray-500 block">Qty ({item.unit})</label>
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, { quantity: parseFloat(e.target.value) || 1 })
                              }
                              className="w-full bg-white border border-gray-200 rounded-lg p-1 text-xs font-bold font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block">Price ({currentBusiness.currencySymbol})</label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full bg-white border border-gray-200 rounded-lg p-1 text-xs font-bold font-mono"
                            />
                          </div>

                          <div className="text-right">
                            <label className="text-[10px] text-gray-500 block">Total</label>
                            <div className="font-mono font-bold text-emerald-800 text-sm mt-1">
                              {currentBusiness.currencySymbol}{item.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Financial Summary & Payment */}
              <div className="border-t border-dashed border-gray-200 pt-3 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">
                      {currentBusiness.currencySymbol}{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Bill Discount:</span>
                    <input
                      type="number"
                      min="0"
                      value={billDiscount || ''}
                      placeholder="0"
                      onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Tax / GST (%):</span>
                    <input
                      type="number"
                      min="0"
                      value={taxRate || ''}
                      placeholder="0"
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="flex justify-between text-base font-black text-gray-900 pt-1 border-t border-gray-100">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700 text-lg">
                      {currentBusiness.currencySymbol}{grandTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Partial Payment / Udhar Calculation */}
                  <div className="p-2.5 bg-blue-50/80 rounded-xl space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>Customer Paid ({currentBusiness.currencySymbol}):</span>
                      <input
                        type="number"
                        min="0"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="w-24 text-right bg-white border border-blue-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-blue-900"
                      />
                    </div>

                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-700">Remaining Due (Udhar):</span>
                      <span
                        className={`font-mono text-sm ${
                          dueAmount > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {currentBusiness.currencySymbol}{dueAmount.toFixed(2)}
                      </span>
                    </div>

                    {dueAmount > 0 && (
                      <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        This balance will be added to {selectedCustomer.name}'s Udhar Ledger.
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(['cash', 'card', 'upi_qr', 'credit'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setPaymentMethod(m);
                        if (m === 'upi_qr') setShowQrModal(true);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                        paymentMethod === m
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m === 'upi_qr' ? 'QR Code' : m}
                    </button>
                  ))}
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={handleCompleteBill}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Save & Print Invoice ({currentBusiness.currencySymbol}{grandTotal.toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Invoices Archive & History Tab */
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search invoice #, customer name..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={invoiceFilterStatus}
                onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid in Full</option>
                <option value="partial">Partial Payment</option>
                <option value="unpaid">Unpaid (Udhar)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Due (Udhar)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400 text-xs">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3 text-gray-600">{inv.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{inv.customerName}</div>
                        {inv.customerPhone && (
                          <div className="text-[11px] text-gray-400">{inv.customerPhone}</div>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        {inv.items.length} items
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {currentBusiness.currencySymbol}{inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {currentBusiness.currencySymbol}{inv.paidAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        {inv.dueAmount > 0 ? `${currentBusiness.currencySymbol}${inv.dueAmount.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-xs transition"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Invoice / View Invoice Receipt Modal */}
      {(completedInvoice || viewInvoice) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                {completedInvoice ? 'Sale Recorded Successfully!' : 'Invoice Details'}
              </div>
              <button
                onClick={() => {
                  setCompletedInvoice(null);
                  setViewInvoice(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ThermalReceipt
              invoice={(completedInvoice || viewInvoice)!}
              business={currentBusiness}
              onClose={() => {
                setCompletedInvoice(null);
                setViewInvoice(null);
              }}
            />
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <QrPaymentModal
          amount={dueAmount > 0 ? dueAmount : grandTotal}
          business={currentBusiness}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          onPaymentReceived={() => {
            setPaymentMethod('upi_qr');
            setShowQrModal(false);
          }}
        />
      )}
    </div>
  );
};

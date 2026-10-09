import React, { useState } from 'react';
import {
  Zap,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  QrCode,
  Sparkles,
  CheckCircle,
  X,
  Share2
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Invoice, InvoiceItem, PaymentMethod } from '../../types';
import { ThermalReceipt } from './ThermalReceipt';
import { QrPaymentModal } from './QrPaymentModal';

interface QuickSaleProps {
  onSaleComplete?: () => void;
}

export const QuickSale: React.FC<QuickSaleProps> = ({ onSaleComplete }) => {
  const { products, playSound } = useDb();
  const { currentUser, currentBusiness } = useAuth();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Filter products for quick selection
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any) => {
    playSound('beep');
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
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
          unitPrice: product.retailPrice,
          priceType: 'retail',
          discount: 0,
          discountType: 'fixed',
          taxRate: product.taxRate || 0,
          taxAmount: 0,
          total: product.retailPrice,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    playSound('beep');
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: nextQty,
              total: nextQty * item.unitPrice,
            };
          }
          return item;
        })
    );
  };

  const removeFromCart = (itemId: string) => {
    playSound('beep');
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = Math.max(0, subtotal - billDiscount);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    playSound('cash');

    const newInvoice = db.createInvoice(
      {
        businessId: currentBusiness.id,
        customerId: 'cust_walkin',
        customerName: 'Walk-in Customer',
        customerPhone: '',
        date: new Date().toISOString().split('T')[0],
        items: cart,
        subtotal,
        itemDiscountsTotal: 0,
        billDiscount,
        billDiscountType: 'fixed',
        taxTotal: 0,
        grandTotal,
        paidAmount: grandTotal,
        dueAmount: 0,
        totalCost: 0,
        grossProfit: 0,
        paymentStatus: 'paid',
        paymentMethod,
        status: 'completed',
        cashierId: currentUser?.id || 'cashier',
        cashierName: currentUser?.name || 'Cashier',
      },
      {
        id: currentUser?.id || 'cashier',
        name: currentUser?.name || 'Cashier',
        role: currentUser?.role || 'cashier',
      }
    );

    setCompletedInvoice(newInvoice);
    setCart([]);
    setBillDiscount(0);
    if (onSaleComplete) onSaleComplete();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white p-4 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Quick Sale POS Mode</h1>
            <p className="text-xs text-amber-100">
              Ultra-fast checkout for walk-in customers • Auto inventory reduction
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <span>Customer:</span>
          <span className="bg-white text-gray-900 px-2 py-0.5 rounded-md font-bold">
            Walk-in Customer
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search or scan barcode (e.g. Sugar, Rice, 8964...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-xs transition"
              autoFocus
            />
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredProducts.map((p) => {
              const inStock = p.stockQuantity > 0;
              return (
                <button
                  key={p.id}
                  disabled={!inStock}
                  onClick={() => addToCart(p)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition group active:scale-95 shadow-2xs ${
                    inStock
                      ? 'bg-white hover:border-amber-400 hover:shadow-xs border-gray-100'
                      : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                        {p.unit}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          p.stockQuantity <= p.minStock ? 'text-rose-600' : 'text-gray-400'
                        }`}
                      >
                        {p.stockQuantity} left
                      </span>
                    </div>
                    <div className="font-bold text-gray-900 text-xs line-clamp-2 leading-snug">
                      {p.name}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="font-bold font-mono text-amber-700 text-sm">
                      {currentBusiness.currencySymbol}{p.retailPrice}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs group-hover:bg-amber-500 group-hover:text-white transition">
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                Quick Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-500" />
                  <p className="text-xs">Cart is empty</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tap any item on the left to instantly add to bill
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-gray-900 leading-tight">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {currentBusiness.currencySymbol}{item.unitPrice} × {item.quantity} {item.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-gray-900 w-16 text-right">
                        {currentBusiness.currencySymbol}{item.total}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Payment Selection */}
            <div className="border-t border-dashed border-gray-200 pt-3 mt-3 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">
                    {currentBusiness.currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Bill Discount ({currentBusiness.currencySymbol}):</span>
                  <input
                    type="number"
                    min="0"
                    value={billDiscount || ''}
                    placeholder="0"
                    onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-between text-base font-black text-gray-900 pt-1 border-t border-gray-100">
                  <span>Payable Total:</span>
                  <span className="font-mono text-amber-700">
                    {currentBusiness.currencySymbol}{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-gray-500 uppercase">Payment Mode</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('upi_qr');
                      setShowQrModal(true);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      paymentMethod === 'upi_qr'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Pay
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Card
                  </button>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleCompleteSale}
                className="w-full bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-orange-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Quick Sale ({currentBusiness.currencySymbol}{grandTotal.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <QrPaymentModal
          amount={grandTotal}
          business={currentBusiness}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          onPaymentReceived={() => {
            setPaymentMethod('upi_qr');
            setShowQrModal(false);
          }}
        />
      )}

      {/* Invoice Complete Receipt Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                Sale Recorded Successfully!
              </div>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ThermalReceipt
              invoice={completedInvoice}
              business={currentBusiness}
              onClose={() => setCompletedInvoice(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

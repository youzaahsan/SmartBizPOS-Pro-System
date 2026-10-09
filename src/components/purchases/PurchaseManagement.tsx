import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Building,
  Phone,
  DollarSign,
  Receipt,
  CheckCircle,
  FileText,
  X,
  Trash2,
  Layers
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Purchase, PurchaseItem, Supplier, PaymentMethod } from '../../types';

export const PurchaseManagement: React.FC = () => {
  const { suppliers, products, purchases, saveSupplier, playSound } = useDb();
  const { currentUser, currentBusiness } = useAuth();

  const [activeTab, setActiveTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // New Purchase Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');

  // New Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const totalPurchaseAmount = purchaseItems.reduce((acc, item) => acc + item.total, 0);
  const duePurchaseAmount = Math.max(0, totalPurchaseAmount - paidAmount);

  const addItemToPurchase = (prod: any) => {
    playSound('beep');
    setPurchaseItems((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === prod.id
            ? {
                ...item,
                quantity: item.quantity + 10,
                total: (item.quantity + 10) * item.purchasePrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit || 'PCS',
          quantity: 10,
          purchasePrice: prod.purchasePrice || 100,
          total: 10 * (prod.purchasePrice || 100),
        },
      ];
    });
  };

  const updatePurchaseItem = (idx: number, updates: Partial<PurchaseItem>) => {
    setPurchaseItems((prev) =>
      prev.map((it, i) => {
        if (i === idx) {
          const next = { ...it, ...updates };
          next.total = next.quantity * next.purchasePrice;
          return next;
        }
        return it;
      })
    );
  };

  const removePurchaseItem = (idx: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0 || !selectedSupplierId) return;
    playSound('success');

    const sup = suppliers.find((s) => s.id === selectedSupplierId);

    db.createPurchase(
      {
        businessId: currentBusiness.id,
        supplierId: selectedSupplierId,
        supplierName: sup ? sup.name : 'Wholesale Supplier',
        date: new Date().toISOString().split('T')[0],
        items: purchaseItems,
        totalAmount: totalPurchaseAmount,
        paidAmount,
        dueAmount: duePurchaseAmount,
        paymentMethod,
        notes: purchaseNotes,
        status: 'received',
      },
      {
        id: currentUser?.id || 'sys',
        name: currentUser?.name || 'Staff',
        role: currentUser?.role || 'admin',
      }
    );

    setShowNewPurchaseModal(false);
    setPurchaseItems([]);
    setPaidAmount(0);
    setPurchaseNotes('');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) return;
    playSound('success');

    saveSupplier(supplierForm);
    setShowSupplierModal(false);
    setSupplierForm({ name: '', company: '', phone: '', email: '', address: '', notes: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Purchases & Supplier Management</h1>
            <p className="text-xs text-gray-500">
              Restock stock • Supplier invoices • Accounts payable ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'purchases' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600'
              }`}
            >
              Purchases ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'suppliers' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => {
              setPaidAmount(0);
              setShowNewPurchaseModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            + New Stock Purchase
          </button>
        </div>
      </div>

      {activeTab === 'purchases' ? (
        /* Purchases List */
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-gray-900">Purchase Invoices / Stock In History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Purchase #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Items Received</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Payable Due</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                      No purchases recorded yet. Tap "+ New Stock Purchase" to receive goods.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-800">{p.purchaseNumber}</td>
                      <td className="p-3 text-gray-600">{p.date}</td>
                      <td className="p-3 font-bold text-gray-900">{p.supplierName}</td>
                      <td className="p-3 text-gray-600">
                        {p.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {currentBusiness.currencySymbol}{p.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {currentBusiness.currencySymbol}{p.paidAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        {p.dueAmount > 0 ? `${currentBusiness.currencySymbol}${p.dueAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers List */
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-sm text-gray-900">Suppliers & Distributors</h2>
            <button
              onClick={() => setShowSupplierModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{s.name}</h3>
                    <div className="text-[11px] text-gray-500 font-medium">{s.company}</div>
                  </div>
                  {s.totalDue > 0 ? (
                    <div className="text-right">
                      <span className="text-[10px] text-rose-600 font-bold block uppercase">
                        Payable Owed
                      </span>
                      <span className="font-mono font-black text-rose-700 text-sm">
                        {currentBusiness.currencySymbol}{s.totalDue.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Settled
                    </span>
                  )}
                </div>

                <div className="text-gray-500 flex items-center gap-1 text-[11px] font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {s.phone}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-[11px]">
                  <div>
                    Total Supplies: <b className="font-mono">{currentBusiness.currencySymbol}{s.totalPurchases.toLocaleString()}</b>
                  </div>
                  <div className="text-right">
                    Paid: <b className="font-mono text-emerald-700">{currentBusiness.currencySymbol}{s.totalPaid.toLocaleString()}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Purchase Modal */}
      {showNewPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Receive New Stock (Purchase)</h3>
                <p className="text-xs text-gray-500">Automatically adds stock to inventory upon saving</p>
              </div>
              <button
                onClick={() => setShowNewPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Select Supplier *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company}) - Due: {currentBusiness.currencySymbol}{s.totalDue}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Products tap to add into purchase */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600">
                  Tap Product to Restock:
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addItemToPurchase(p)}
                      className="shrink-0 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-800 transition"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchase items list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {purchaseItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-xs bg-gray-50 rounded-xl">
                    No products added yet. Tap products above to add to purchase order.
                  </div>
                ) : (
                  purchaseItems.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="col-span-5 font-bold text-gray-900">{it.productName}</div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-gray-400 block">Qty ({it.unit})</label>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) =>
                            updatePurchaseItem(idx, { quantity: parseFloat(e.target.value) || 1 })
                          }
                          className="w-full bg-white border border-gray-200 rounded p-1 font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-gray-400 block">Cost / Unit</label>
                        <input
                          type="number"
                          min="0"
                          value={it.purchasePrice}
                          onChange={(e) =>
                            updatePurchaseItem(idx, { purchasePrice: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full bg-white border border-gray-200 rounded p-1 font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removePurchaseItem(idx)}
                          className="text-gray-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary & Payment */}
              <div className="p-4 bg-indigo-50/70 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Purchase Value:</span>
                  <span className="font-mono text-indigo-900">
                    {currentBusiness.currencySymbol}{totalPurchaseAmount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Amount Paid to Supplier Now
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-indigo-200 rounded-xl p-2 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Payable Due (Owed)
                    </label>
                    <div className="font-mono font-black text-rose-600 text-sm mt-2">
                      {currentBusiness.currencySymbol}{duePurchaseAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewPurchaseModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
                >
                  Receive Stock & Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Register Supplier / Distributor</h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Company / Mill Name
                </label>
                <input
                  type="text"
                  value={supplierForm.company}
                  onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })}
                  placeholder="e.g. Al-Madina Wholesale Grain Market"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="e.g. 0312-3456789"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Office / Warehouse Address
                </label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="e.g. Grain Market Sector 12"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

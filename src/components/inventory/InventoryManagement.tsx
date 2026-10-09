import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Sliders,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';

export const InventoryManagement: React.FC = () => {
  const { products, inventoryTransactions, playSound } = useDb();
  const { currentUser, currentBusiness } = useAuth();

  const [search, setSearch] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<'adjustment' | 'damaged'>('adjustment');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStock);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

  const handleOpenAdjust = (p: any) => {
    setSelectedProduct(p);
    setAdjustDelta(0);
    setAdjustReason('adjustment');
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustDelta === 0) return;
    playSound('beep');

    db.adjustStock(
      selectedProduct.id,
      adjustDelta,
      adjustReason,
      adjustNotes,
      {
        id: currentUser?.id || 'sys',
        name: currentUser?.name || 'Staff',
        role: currentUser?.role || 'admin',
      }
    );

    setShowAdjustModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inventory & Stock Tracking</h1>
            <p className="text-xs text-gray-500">
              Live stock levels • Low stock alerts • Stock audits & damage adjustments
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner (Requirement 23) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              ⚠️ Low Stock Warning ({lowStockProducts.length} items need reordering)
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-2xl border border-rose-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900">{p.name}</div>
                  <div className="text-[11px] text-rose-600 font-mono font-bold mt-0.5">
                    Stock: {p.stockQuantity} {p.unit} (Min: {p.minStock})
                  </div>
                </div>
                <button
                  onClick={() => handleOpenAdjust(p)}
                  className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-bold text-[11px] transition"
                >
                  Adjust
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Live Stock Table & Recent Stock Movement Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Stock Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-900">Current Stock Inventory</h2>
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter stock..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-hidden focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5 text-center">In Stock</th>
                  <th className="p-2.5 text-center">Min Level</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="p-2.5">
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.category}</div>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-gray-900">
                        {p.stockQuantity} {p.unit}
                      </td>
                      <td className="p-2.5 text-center font-mono text-gray-500">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLow
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Stock Transactions / Ledger History */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              Recent Stock Movement Log
            </h2>
            <span className="text-[11px] text-gray-400">Auto-recorded</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {inventoryTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No stock movements logged yet.
              </div>
            ) : (
              inventoryTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-gray-900">{tx.productName}</div>
                    <span
                      className={`font-mono font-bold text-xs ${
                        tx.quantityDelta > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {tx.quantityDelta > 0 ? `+${tx.quantityDelta}` : tx.quantityDelta}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span className="capitalize bg-gray-200/70 px-1.5 py-0.2 rounded font-medium">
                      {tx.type} {tx.referenceId ? `(${tx.referenceId})` : ''}
                    </span>
                    <span>
                      Stock: {tx.previousStock} → <b>{tx.newStock}</b>
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 pt-0.5">
                    {tx.date} • by {tx.createdBy}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                Adjust Stock for {selectedProduct.name}
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between">
                <span>Current Quantity:</span>
                <b className="font-mono text-gray-900 text-sm">
                  {selectedProduct.stockQuantity} {selectedProduct.unit}
                </b>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                >
                  <option value="adjustment">Stock Count Audit / Correction</option>
                  <option value="damaged">Damaged / Expired / Waste Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Quantity Change (+ to increase, - to decrease) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta || ''}
                  placeholder="e.g. 10 or -5"
                  onChange={(e) => setAdjustDelta(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Notes / Audit Remarks
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Physical inventory verification"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  Plus,
  Receipt,
  CheckCircle,
  AlertTriangle,
  X,
  Package
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Invoice, ReturnItem } from '../../types';

export const ReturnManagement: React.FC = () => {
  const { invoices, returns, playSound } = useDb();
  const { currentUser, currentBusiness } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState('');
  const [returnReason, setReturnReason] = useState('Customer Returned Product');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'credit_adjust'>('cash');
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  const selectedInvoice = invoices.find((i) => i.invoiceNumber === selectedInvoiceNumber);

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoiceNumber(inv.invoiceNumber);
    setReturnItems(
      inv.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: 0,
        unitPrice: it.unitPrice,
        refundAmount: 0,
        restock: true,
      }))
    );
  };

  const handleUpdateReturnQty = (idx: number, qty: number, maxQty: number) => {
    const validQty = Math.max(0, Math.min(qty, maxQty));
    setReturnItems((prev) =>
      prev.map((it, i) => {
        if (i === idx) {
          return {
            ...it,
            quantity: validQty,
            refundAmount: validQty * it.unitPrice,
          };
        }
        return it;
      })
    );
  };

  const totalRefundAmount = returnItems.reduce((acc, it) => acc + it.refundAmount, 0);

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || totalRefundAmount <= 0) return;
    playSound('cash');

    const activeItems = returnItems.filter((i) => i.quantity > 0);

    db.processReturn(
      {
        businessId: currentBusiness.id,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerId: selectedInvoice.customerId,
        customerName: selectedInvoice.customerName,
        date: new Date().toISOString().split('T')[0],
        items: activeItems,
        totalRefund: totalRefundAmount,
        refundMethod,
        reason: returnReason,
        processedBy: currentUser?.name || 'Staff',
      },
      {
        id: currentUser?.id || 'sys',
        name: currentUser?.name || 'Staff',
        role: currentUser?.role || 'admin',
      }
    );

    setShowModal(false);
    setSelectedInvoiceNumber('');
    setReturnItems([]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sale Returns & Refunds</h1>
            <p className="text-xs text-gray-500">
              Restore inventory • Adjust customer ledger balance • Audit trail
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          + Process Customer Return
        </button>
      </div>

      {/* Returns List */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
        <h2 className="font-bold text-sm text-gray-900">Processed Returns History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Return #</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items Returned</th>
                <th className="p-3 text-right">Refund Amount</th>
                <th className="p-3 text-center">Restocked</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                    No returns processed yet.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-mono font-bold text-rose-700">{r.returnNumber}</td>
                    <td className="p-3 font-mono font-semibold text-gray-700">{r.invoiceNumber}</td>
                    <td className="p-3 text-gray-600">{r.date}</td>
                    <td className="p-3 font-bold text-gray-900">{r.customerName}</td>
                    <td className="p-3 text-gray-600">
                      {r.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {currentBusiness.currencySymbol}{r.totalRefund.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        YES (Restocked)
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{r.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Return Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Process Customer Return & Refund</h3>
                <p className="text-xs text-gray-500">Restores inventory and adjusts ledger/cash</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Select Original Sale Invoice *
                </label>
                <select
                  value={selectedInvoiceNumber}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i.invoiceNumber === e.target.value);
                    if (inv) handleSelectInvoice(inv);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                >
                  <option value="">-- Choose Invoice to Return --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} • {inv.customerName} • Total: {currentBusiness.currencySymbol}
                      {inv.grandTotal} ({inv.date})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-gray-800">
                    Select Items & Quantities to Return:
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedInvoice.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{it.productName}</div>
                          <div className="text-[11px] text-gray-500">
                            Purchased: {it.quantity} {it.unit} @ {currentBusiness.currencySymbol}
                            {it.unitPrice}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 block">Return Qty</label>
                            <input
                              type="number"
                              min="0"
                              max={it.quantity}
                              value={returnItems[idx]?.quantity || 0}
                              onChange={(e) =>
                                handleUpdateReturnQty(
                                  idx,
                                  parseFloat(e.target.value) || 0,
                                  it.quantity
                                )
                              }
                              className="w-20 bg-white border border-gray-200 rounded p-1 font-mono font-bold text-xs"
                            />
                          </div>

                          <div className="text-right w-24">
                            <label className="text-[10px] text-gray-400 block">Refund</label>
                            <div className="font-mono font-bold text-rose-700">
                              {currentBusiness.currencySymbol}
                              {(returnItems[idx]?.refundAmount || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Refund Method
                      </label>
                      <select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                      >
                        <option value="cash">💵 Cash Refund to Customer</option>
                        <option value="credit_adjust">
                          📉 Deduct from Customer Udhar Due Balance
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Return Reason
                      </label>
                      <input
                        type="text"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="e.g. Expired / Damaged / Extra goods"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center text-xs">
                    <span className="font-bold text-rose-900">Total Refund Payable:</span>
                    <span className="font-mono font-black text-rose-700 text-base">
                      {currentBusiness.currencySymbol}{totalRefundAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedInvoice || totalRefundAmount <= 0}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Return & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

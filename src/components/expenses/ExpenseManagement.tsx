import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  X
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { Expense } from '../../types';

export const ExpenseManagement: React.FC = () => {
  const { expenses, saveExpense, deleteExpense, playSound } = useDb();
  const { currentBusiness, can } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [form, setForm] = useState({
    title: '',
    category: 'Rent' as Expense['category'],
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as Expense['paymentMethod'],
    receiptNumber: '',
    notes: '',
  });

  const categories: Expense['category'][] = [
    'Rent',
    'Electricity',
    'Salaries',
    'Transport',
    'Supplies',
    'Maintenance',
    'Tea & Refreshments',
    'Marketing',
    'Other',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase())) ||
      (e.receiptNumber && e.receiptNumber.includes(search));
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.amount <= 0) return;
    playSound('cash');
    saveExpense(form);
    setShowAddModal(false);
    setForm({
      title: '',
      category: 'Rent',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      receiptNumber: '',
      notes: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shop Expense Management</h1>
            <p className="text-xs text-gray-500">
              Rent, bills, staff tea, maintenance & operational overheads
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          + Record Expense
        </button>
      </div>

      {/* Filter and Metrics Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 outline-hidden"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-gray-700"
          >
            <option value="all">All Expense Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 flex justify-between items-center text-xs">
          <span className="font-semibold text-rose-900">Filtered Expenses Total:</span>
          <span className="font-mono font-black text-rose-700 text-sm sm:text-base">
            {currentBusiness.currencySymbol}{totalExpenseAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Expense Title / Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-mono text-gray-600">{exp.date}</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-gray-400">{exp.notes}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 uppercase font-mono text-[11px] text-gray-600">
                      {exp.paymentMethod}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {currentBusiness.currencySymbol}{exp.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-500">{exp.createdBy}</td>
                    <td className="p-3 text-center">
                      {can('manage_expenses') && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete expense "${exp.title}"?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Record Business Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Electric bill / Staff tea / Packaging plastic bags"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Amount ({currentBusiness.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="upi_qr">📱 QR / Mobile Wallet</option>
                    <option value="card">💳 Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Receipt / Voucher Ref (Optional)
                </label>
                <input
                  type="text"
                  value={form.receiptNumber}
                  onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                  placeholder="e.g. REC-1029"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

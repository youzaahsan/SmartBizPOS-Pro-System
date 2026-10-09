import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  AlertCircle,
  Share2,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  History,
  Trash2,
  Edit2
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Customer, CustomerLedgerEntry } from '../../types';

export const CustomerManagement: React.FC = () => {
  const { customers, invoices, customerLedger, saveCustomer, deleteCustomer, playSound } = useDb();
  const { currentUser, currentBusiness } = useAuth();

  const [searchPhone, setSearchPhone] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    customerType: 'regular' as Customer['customerType'],
  });

  // Record Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('Udhar balance settlement');

  // Filter list
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchPhone.toLowerCase()) ||
      c.phone.includes(searchPhone) ||
      (c.address && c.address.toLowerCase().includes(searchPhone.toLowerCase()));
    const matchType =
      filterType === 'all'
        ? true
        : filterType === 'due'
        ? c.totalDue > 0
        : c.customerType === filterType;
    return matchSearch && matchType;
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      customerType: 'regular',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
      customerType: c.customerType,
    });
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    playSound('success');

    const saved = saveCustomer(formData, editingCustomer?.id);
    setShowAddModal(false);
    if (selectedCustomer?.id === saved.id) {
      setSelectedCustomer(saved);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;
    playSound('cash');

    db.recordCustomerPayment(
      selectedCustomer.id,
      paymentAmount,
      paymentMethod,
      paymentNotes,
      {
        id: currentUser?.id || 'sys',
        name: currentUser?.name || 'Staff',
        role: currentUser?.role || 'cashier',
      }
    );

    // Refresh selected customer state
    const updated = db.get<Customer[]>('customers')?.find((c) => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);

    setShowPaymentModal(false);
    setPaymentAmount(0);
  };

  const handleSendReminder = (customer: Customer) => {
    playSound('beep');
    const message = `Salam ${customer.name},\nThis is a friendly reminder from *${currentBusiness.name}*.\nYour outstanding balance (Udhar) is *${currentBusiness.currencySymbol}${customer.totalDue.toLocaleString()}*.\nKindly settle at your earliest convenience.\nThank you!`;
    const encoded = encodeURIComponent(message);
    const phone = customer.phone.replace(/[^\d]/g, '');
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Customer Invoices & Ledger
  const customerInvoices = selectedCustomer
    ? invoices.filter((i) => i.customerId === selectedCustomer.id)
    : [];

  const customerEntries = selectedCustomer
    ? customerLedger.filter((l) => l.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Customer & Udhar Ledger Management</h1>
            <p className="text-xs text-gray-500">
              Fast phone search • Itemized purchase history • Udhar credit & payment reminders
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          + Add New Customer
        </button>
      </div>

      {/* Quick Fast Phone Search Bar (Requirement 13) */}
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-3xl space-y-2">
        <div className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
          <Search className="w-4 h-4 text-blue-600" />
          Fast Customer Phone Search (e.g. 03001234567):
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Type phone number (e.g. 03001234567 or customer name)..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full bg-white border border-blue-200 rounded-2xl pl-4 pr-10 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
          />
          {searchPhone && (
            <button
              onClick={() => setSearchPhone('')}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Customer List & Customer Detail / Ledger Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customers List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filters bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'due', label: 'With Due (Udhar)' },
              { id: 'regular', label: 'Regular' },
              { id: 'wholesale', label: 'Wholesale' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs bg-white rounded-3xl border p-6">
                No customers match your search.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`p-4 rounded-3xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {c.name}
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold uppercase">
                            {c.customerType}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {c.phone}
                        </div>
                      </div>

                      {c.totalDue > 0 ? (
                        <div className="text-right">
                          <span className="text-[10px] text-rose-600 font-bold block uppercase">
                            Due (Udhar)
                          </span>
                          <span className="font-mono font-black text-rose-700 text-sm">
                            {currentBusiness.currencySymbol}{c.totalDue.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          All Clear
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
                      <div>
                        <span>Purchases: </span>
                        <b className="font-mono text-gray-900">
                          {currentBusiness.currencySymbol}{c.totalPurchases.toLocaleString()}
                        </b>
                      </div>
                      <div className="text-right">
                        <span>Paid: </span>
                        <b className="font-mono text-emerald-700">
                          {currentBusiness.currencySymbol}{c.totalPaid.toLocaleString()}
                        </b>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Customer Profile, Saman & Ledger */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
              {/* Profile Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold uppercase">
                      {selectedCustomer.customerType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {selectedCustomer.phone}
                    </span>
                    {selectedCustomer.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {selectedCustomer.address}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedCustomer)}
                    className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {selectedCustomer.id !== 'cust_walkin' && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete customer ${selectedCustomer.name}?`)) {
                          deleteCustomer(selectedCustomer.id);
                          setSelectedCustomer(null);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl transition"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[11px] text-gray-500 font-semibold uppercase">Total Purchased</div>
                  <div className="font-mono font-bold text-gray-900 text-base sm:text-lg mt-1">
                    {currentBusiness.currencySymbol}{selectedCustomer.totalPurchases.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-[11px] text-emerald-700 font-semibold uppercase">Total Paid</div>
                  <div className="font-mono font-bold text-emerald-800 text-base sm:text-lg mt-1">
                    {currentBusiness.currencySymbol}{selectedCustomer.totalPaid.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="text-[11px] text-rose-700 font-semibold uppercase">Total Due (Udhar)</div>
                  <div className="font-mono font-black text-rose-700 text-base sm:text-lg mt-1">
                    {currentBusiness.currencySymbol}{selectedCustomer.totalDue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Quick Actions (Settle Due & WhatsApp Reminder) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPaymentAmount(selectedCustomer.totalDue);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment (Settle Udhar)
                </button>

                {selectedCustomer.totalDue > 0 && (
                  <button
                    onClick={() => handleSendReminder(selectedCustomer)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Share2 className="w-4 h-4" />
                    Send WhatsApp Reminder
                  </button>
                )}
              </div>

              {/* Tabs: Customer Saman (Purchase details) vs Customer Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-600" />
                    Customer Saman / Itemized Purchases ({customerInvoices.length})
                  </h3>
                  <button
                    onClick={() => setShowLedgerModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                  >
                    View Full Account Ledger →
                  </button>
                </div>

                {/* Itemized Invoices List (Requirement 14: Customer Saman) */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                  {customerInvoices.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 rounded-2xl">
                      No purchases on record for this customer.
                    </div>
                  ) : (
                    customerInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[11px] text-gray-500">{inv.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 font-mono">
                              Total: {currentBusiness.currencySymbol}{inv.grandTotal.toLocaleString()}
                            </span>
                            {inv.dueAmount > 0 && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                                Due: {currentBusiness.currencySymbol}{inv.dueAmount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Items detail list */}
                        <div className="space-y-1">
                          {inv.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-gray-700 text-[11px]">
                              <span>
                                • <b>{it.productName}</b> ({it.quantity} {it.unit}) @ {currentBusiness.currencySymbol}{it.unitPrice}
                              </span>
                              <span className="font-mono font-semibold">
                                {currentBusiness.currencySymbol}{it.total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-400">
              <Users className="w-12 h-12 mb-2 opacity-30 text-blue-500" />
              <h3 className="font-bold text-gray-700 text-sm">Select a Customer</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Choose a customer from the left list or search by phone to view profile, udhar balance, saman history, and ledger.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Full Account Ledger Modal (Requirement 18) */}
      {showLedgerModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Account Statement Ledger: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Phone: {selectedCustomer.phone} • Current Due: <b className="text-rose-600">{currentBusiness.currencySymbol}{selectedCustomer.totalDue.toLocaleString()}</b>
                </p>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Transaction / Description</th>
                    <th className="p-3 text-right">Debit (+)</th>
                    <th className="p-3 text-right">Credit (-)</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">
                        No ledger entries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    customerEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-mono text-gray-600">{e.date}</td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-900 block">{e.description}</span>
                          <span className="text-[10px] text-gray-400 uppercase">{e.type}</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900">
                          {e.debit > 0 ? `${currentBusiness.currencySymbol}${e.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          {e.credit > 0 ? `${currentBusiness.currencySymbol}${e.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-rose-700">
                          {currentBusiness.currencySymbol}{e.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
              >
                Print Statement
              </button>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment (Settle Udhar) Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                Record Payment for {selectedCustomer.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Payment Amount ({currentBusiness.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-base font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                >
                  <option value="cash">💵 Cash at Shop</option>
                  <option value="upi_qr">📱 QR / Raast / EasyPaisa / JazzCash</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="card">💳 Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Notes / Receipt Ref
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Settle partial udhar"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingCustomer ? 'Edit Customer' : 'Register New Customer'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ali Khan"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Phone Number (Mobile) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={formData.customerType}
                    onChange={(e) =>
                      setFormData({ ...formData, customerType: e.target.value as any })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  >
                    <option value="regular">Regular</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="vip">VIP</option>
                    <option value="walk-in">Walk-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Address / Shop Location
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Sector / Market"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Credit limit or remarks..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-900"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

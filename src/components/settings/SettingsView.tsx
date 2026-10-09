import React, { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  QrCode,
  Shield,
  Volume2,
  Download,
  Upload,
  UserPlus,
  Trash2,
  CheckCircle,
  Save,
  Key,
  Users
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessSettings, UserRole, User } from '../../types';

export const SettingsView: React.FC = () => {
  const { currentBusiness, updateBusinessSettings, currentUser, users, can } = useAuth();
  const { soundEnabled, setSoundEnabled, playSound, exportBackup, importBackup } = useDb();

  const [activeTab, setActiveTab] = useState<'profile' | 'invoice' | 'staff' | 'backup'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Business Form State
  const [form, setForm] = useState<BusinessSettings>({ ...currentBusiness });

  // Staff creation form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('success');
    updateBusinessSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const ok = importBackup(text);
        if (ok) {
          alert('Database restored successfully from backup!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Settings className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Store Settings & Business Config</h1>
            <p className="text-xs text-gray-500">
              Company profile, receipts, QR payment identifier, staff roles & data backups
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'profile', label: 'Shop Profile & Details' },
          { id: 'invoice', label: 'Invoices, Receipts & QR Pay' },
          { id: 'staff', label: 'Staff & Role-Based Access' },
          { id: 'backup', label: 'Backup & Restore Data' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-2xl font-bold transition whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Owner / Proprietor Name
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
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
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Shop Physical Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tax / GST Registration Number
                </label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder="e.g. STRN-987654"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Currency Symbol & Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.currencySymbol}
                    onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                    placeholder="Rs."
                    className="w-20 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-center"
                  />
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    placeholder="PKR"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Sound toggle */}
            <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                Calculator & POS Audio Feedback (Clicks & Cash Chimes)
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                Save Business Profile
              </button>
            </div>
          </form>
        )}

        {activeTab === 'invoice' && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={form.invoicePrefix}
                  onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Default Tax / GST Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.defaultTaxRate}
                  onChange={(e) =>
                    setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Receipt Paper Standard
                </label>
                <select
                  value={form.paperSize}
                  onChange={(e) => setForm({ ...form, paperSize: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                >
                  <option value="58mm">58mm Thermal Printer Roll (Small POS)</option>
                  <option value="80mm">80mm Thermal Printer Roll (Standard POS)</option>
                  <option value="A4">A4 Full Sheet Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  UPI / Raast / EasyPaisa QR Payment ID
                </label>
                <input
                  type="text"
                  value={form.paymentIdentifier}
                  onChange={(e) => setForm({ ...form, paymentIdentifier: e.target.value })}
                  placeholder="e.g. 03001234567@raast or smartbiz@bank"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono text-gray-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Thermal Receipt Footer Note
                </label>
                <textarea
                  rows={2}
                  value={form.receiptFooterNote}
                  onChange={(e) => setForm({ ...form, receiptFooterNote: e.target.value })}
                  placeholder="e.g. Goods once sold will not be returned without original receipt."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                Update Invoice Config
              </button>
            </div>
          </form>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Active Staff & Role Permissions</h2>
              <p className="text-xs text-gray-500">
                Admin has full access. Manager controls stock & prices. Cashier only has POS & Billing.
              </p>
            </div>

            {/* Existing Users Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Email / Username</th>
                    <th className="p-3 text-center">Assigned Role</th>
                    <th className="p-3">Purchase Cost Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u: User) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            You
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-gray-500">{u.email}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-xs">
                        {u.role === 'cashier' ? (
                          <span className="text-rose-600 font-semibold">🔒 Hidden (Restricted)</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">✅ Visible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Database Backup & Recovery</h2>
              <p className="text-xs text-gray-500">
                Download full local snapshots of customers, inventory, sales, and ledgers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs">Export Backup</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Save all your store's data into a portable JSON backup file.
                  </p>
                </div>
                <button
                  onClick={exportBackup}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Download Backup File
                </button>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs">Restore Backup</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Upload a previously exported backup file to restore records.
                  </p>
                </div>
                <label className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center cursor-pointer transition">
                  Choose Backup File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

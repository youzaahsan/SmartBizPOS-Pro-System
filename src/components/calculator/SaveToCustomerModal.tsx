import React, { useState } from 'react';
import { UserCheck, Search, UserPlus, Phone, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Customer } from '../../types';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';

interface SaveToCustomerModalProps {
  amount: number;
  note: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomerAction: (customer: Customer, actionType: 'bill' | 'quick_sale' | 'ledger_credit') => void;
}

export const SaveToCustomerModal: React.FC<SaveToCustomerModalProps> = ({
  amount,
  note,
  isOpen,
  onClose,
  onSelectCustomerAction,
}) => {
  const { customers, saveCustomer, playSound } = useDb();
  const { currentBusiness } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    playSound('success');
    const created = saveCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      customerType: 'regular',
    });
    setSelectedCust(created);
    setShowAddForm(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  const handleConfirmAction = (action: 'bill' | 'quick_sale' | 'ledger_credit') => {
    if (!selectedCust) return;
    playSound('beep');
    onSelectCustomerAction(selectedCust, action);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Save Calculation to Customer</h3>
              <p className="text-xs text-gray-500">
                Amount: <b className="text-blue-700 font-mono">{currentBusiness.currencySymbol}{amount.toLocaleString()}</b>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!showAddForm ? (
            <>
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search customer by name or phone (e.g. 0300...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                  autoFocus
                />
              </div>

              {/* Add New Customer Button */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500">
                  Select Existing or Register New:
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Add New Customer
                </button>
              </div>

              {/* Customer List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {filteredCustomers.map((c) => {
                  const isSelected = selectedCust?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCust(c)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70'
                          : 'border-gray-100 hover:border-blue-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {c.name}
                          {c.totalDue > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Due: {currentBusiness.currencySymbol}{c.totalDue.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1 mt-0.5 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {c.phone}
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons if customer selected */}
              {selectedCust && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="text-xs font-bold text-gray-700 mb-1">
                    Proceed with {selectedCust.name}:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleConfirmAction('bill')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    >
                      Convert to Bill
                    </button>
                    <button
                      onClick={() => handleConfirmAction('quick_sale')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    >
                      Save as Quick Sale
                    </button>
                    <button
                      onClick={() => handleConfirmAction('ledger_credit')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    >
                      Add to Udhar Ledger
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleAddNew} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-800">New Customer Registration</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Back to search
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
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
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Shop / House Address (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Street / Sector / Market"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save & Select Customer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

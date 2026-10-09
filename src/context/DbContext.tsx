import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Customer,
  Supplier,
  Invoice,
  Purchase,
  SaleReturn,
  Expense,
  CalculationRecord,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  InventoryTransaction,
  ActivityLog,
  PaymentReminder,
  User,
} from '../types';
import { db } from '../services/db';
import { useAuth } from './AuthContext';

interface DbContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: Purchase[];
  returns: SaleReturn[];
  expenses: Expense[];
  calculations: CalculationRecord[];
  customerLedger: CustomerLedgerEntry[];
  supplierLedger: SupplierLedgerEntry[];
  inventoryTransactions: InventoryTransaction[];
  activityLogs: ActivityLog[];
  paymentReminders: PaymentReminder[];
  users: User[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  
  // Quick Actions & Mutators
  refresh: () => void;
  saveProduct: (product: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  deleteProduct: (id: string) => void;
  toggleFavoriteProduct: (id: string) => void;
  saveCustomer: (customer: Omit<Customer, 'id' | 'businessId' | 'totalPurchases' | 'totalPaid' | 'totalDue' | 'createdAt'>, id?: string) => Customer;
  deleteCustomer: (id: string) => void;
  saveSupplier: (supplier: Omit<Supplier, 'id' | 'businessId' | 'totalPurchases' | 'totalPaid' | 'totalDue' | 'createdAt'>, id?: string) => Supplier;
  saveExpense: (expense: Omit<Expense, 'id' | 'businessId' | 'createdAt' | 'createdBy'>) => void;
  deleteExpense: (id: string) => void;
  saveCalculation: (record: Omit<CalculationRecord, 'id' | 'businessId' | 'userId' | 'timestamp'>) => void;
  deleteCalculation: (id: string) => void;
  clearCalculations: () => void;
  toggleFavoriteCalculation: (id: string) => void;
  
  // Play beep sound for POS barcode scanner or button clicks
  playSound: (type: 'beep' | 'success' | 'cash' | 'error') => void;
}

const DbContext = createContext<DbContextType | null>(null);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentBusiness } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => db.get<Product[]>('products') || []);
  const [customers, setCustomers] = useState<Customer[]>(() => db.get<Customer[]>('customers') || []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.get<Supplier[]>('suppliers') || []);
  const [invoices, setInvoices] = useState<Invoice[]>(() => db.get<Invoice[]>('invoices') || []);
  const [purchases, setPurchases] = useState<Purchase[]>(() => db.get<Purchase[]>('purchases') || []);
  const [returns, setReturns] = useState<SaleReturn[]>(() => db.get<SaleReturn[]>('returns') || []);
  const [expenses, setExpenses] = useState<Expense[]>(() => db.get<Expense[]>('expenses') || []);
  const [calculations, setCalculations] = useState<CalculationRecord[]>(() => db.get<CalculationRecord[]>('calculations') || []);
  const [customerLedger, setCustomerLedger] = useState<CustomerLedgerEntry[]>(() => db.get<CustomerLedgerEntry[]>('customerLedger') || []);
  const [supplierLedger, setSupplierLedger] = useState<SupplierLedgerEntry[]>(() => db.get<SupplierLedgerEntry[]>('supplierLedger') || []);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => db.get<InventoryTransaction[]>('inventoryTransactions') || []);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => db.get<ActivityLog[]>('activityLogs') || []);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>(() => db.get<PaymentReminder[]>('paymentReminders') || []);
  const [users, setUsers] = useState<User[]>(() => db.get<User[]>('users') || []);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem('smartbiz_sound');
    return stored !== null ? stored === 'true' : true;
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('smartbiz_sound', enabled ? 'true' : 'false');
  };

  const refresh = useCallback(() => {
    setProducts(db.get<Product[]>('products') || []);
    setCustomers(db.get<Customer[]>('customers') || []);
    setSuppliers(db.get<Supplier[]>('suppliers') || []);
    setInvoices(db.get<Invoice[]>('invoices') || []);
    setPurchases(db.get<Purchase[]>('purchases') || []);
    setReturns(db.get<SaleReturn[]>('returns') || []);
    setExpenses(db.get<Expense[]>('expenses') || []);
    setCalculations(db.get<CalculationRecord[]>('calculations') || []);
    setCustomerLedger(db.get<CustomerLedgerEntry[]>('customerLedger') || []);
    setSupplierLedger(db.get<SupplierLedgerEntry[]>('supplierLedger') || []);
    setInventoryTransactions(db.get<InventoryTransaction[]>('inventoryTransactions') || []);
    setActivityLogs(db.get<ActivityLog[]>('activityLogs') || []);
    setPaymentReminders(db.get<PaymentReminder[]>('paymentReminders') || []);
    setUsers(db.get<User[]>('users') || []);
  }, []);

  useEffect(() => {
    const unsub1 = db.subscribe('products', () => setProducts(db.get<Product[]>('products') || []));
    const unsub2 = db.subscribe('customers', () => setCustomers(db.get<Customer[]>('customers') || []));
    const unsub3 = db.subscribe('suppliers', () => setSuppliers(db.get<Supplier[]>('suppliers') || []));
    const unsub4 = db.subscribe('invoices', () => setInvoices(db.get<Invoice[]>('invoices') || []));
    const unsub5 = db.subscribe('purchases', () => setPurchases(db.get<Purchase[]>('purchases') || []));
    const unsub6 = db.subscribe('returns', () => setReturns(db.get<SaleReturn[]>('returns') || []));
    const unsub7 = db.subscribe('expenses', () => setExpenses(db.get<Expense[]>('expenses') || []));
    const unsub8 = db.subscribe('calculations', () => setCalculations(db.get<CalculationRecord[]>('calculations') || []));
    const unsub9 = db.subscribe('customerLedger', () => setCustomerLedger(db.get<CustomerLedgerEntry[]>('customerLedger') || []));
    const unsub10 = db.subscribe('supplierLedger', () => setSupplierLedger(db.get<SupplierLedgerEntry[]>('supplierLedger') || []));
    const unsub11 = db.subscribe('inventoryTransactions', () => setInventoryTransactions(db.get<InventoryTransaction[]>('inventoryTransactions') || []));
    const unsub12 = db.subscribe('activityLogs', () => setActivityLogs(db.get<ActivityLog[]>('activityLogs') || []));
    const unsub13 = db.subscribe('paymentReminders', () => setPaymentReminders(db.get<PaymentReminder[]>('paymentReminders') || []));
    const unsub14 = db.subscribe('users', () => setUsers(db.get<User[]>('users') || []));

    return () => {
      unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7(); unsub8(); unsub9(); unsub10(); unsub11(); unsub12(); unsub13(); unsub14();
    };
  }, []);

  // Web Audio synth for crisp responsive audio cues (no external assets required)
  const playSound = (type: 'beep' | 'success' | 'cash' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'beep') {
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success' || type === 'cash') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // ignore audio context restrictions
    }
  };

  const saveProduct = (prodData: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const list = [...products];
    const now = new Date().toISOString();
    if (id) {
      const idx = list.findIndex((p) => p.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...prodData, updatedAt: now };
        db.set('products', list);
        db.logActivity(
          currentUser?.id || 'sys',
          currentUser?.name || 'Staff',
          currentUser?.role || 'admin',
          'Updated Product',
          'product',
          `Updated product ${prodData.name}`,
          id
        );
      }
    } else {
      const newProd: Product = {
        ...prodData,
        id: `prod_${Date.now()}`,
        businessId: currentBusiness.id,
        createdAt: now,
        updatedAt: now,
      };
      list.unshift(newProd);
      db.set('products', list);
      db.logActivity(
        currentUser?.id || 'sys',
        currentUser?.name || 'Staff',
        currentUser?.role || 'admin',
        'Created Product',
        'product',
        `Added new product ${prodData.name} (Stock: ${prodData.stockQuantity} ${prodData.unit})`,
        newProd.id
      );
    }
  };

  const deleteProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    const updated = products.filter((item) => item.id !== id);
    db.set('products', updated);
    if (p) {
      db.logActivity(
        currentUser?.id || 'sys',
        currentUser?.name || 'Staff',
        currentUser?.role || 'admin',
        'Deleted Product',
        'product',
        `Deleted product ${p.name}`,
        id
      );
    }
  };

  const toggleFavoriteProduct = (id: string) => {
    const list = products.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    db.set('products', list);
  };

  const saveCustomer = (
    custData: Omit<Customer, 'id' | 'businessId' | 'totalPurchases' | 'totalPaid' | 'totalDue' | 'createdAt'>,
    id?: string
  ): Customer => {
    const list = [...customers];
    if (id) {
      const idx = list.findIndex((c) => c.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...custData };
        db.set('customers', list);
        db.logActivity(
          currentUser?.id || 'sys',
          currentUser?.name || 'Staff',
          currentUser?.role || 'admin',
          'Updated Customer',
          'customer',
          `Updated info for ${custData.name}`,
          id
        );
        return list[idx];
      }
    }
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      businessId: currentBusiness.id,
      totalPurchases: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };
    list.push(newCust);
    db.set('customers', list);
    db.logActivity(
      currentUser?.id || 'sys',
      currentUser?.name || 'Staff',
      currentUser?.role || 'admin',
      'Created Customer',
      'customer',
      `Registered new customer ${newCust.name} (${newCust.phone})`,
      newCust.id
    );
    return newCust;
  };

  const deleteCustomer = (id: string) => {
    const c = customers.find((x) => x.id === id);
    db.set('customers', customers.filter((item) => item.id !== id));
    if (c) {
      db.logActivity(
        currentUser?.id || 'sys',
        currentUser?.name || 'Staff',
        currentUser?.role || 'admin',
        'Deleted Customer',
        'customer',
        `Deleted customer profile for ${c.name}`,
        id
      );
    }
  };

  const saveSupplier = (
    supData: Omit<Supplier, 'id' | 'businessId' | 'totalPurchases' | 'totalPaid' | 'totalDue' | 'createdAt'>,
    id?: string
  ): Supplier => {
    const list = [...suppliers];
    if (id) {
      const idx = list.findIndex((s) => s.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...supData };
        db.set('suppliers', list);
        return list[idx];
      }
    }
    const newSup: Supplier = {
      ...supData,
      id: `sup_${Date.now()}`,
      businessId: currentBusiness.id,
      totalPurchases: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };
    list.push(newSup);
    db.set('suppliers', list);
    return newSup;
  };

  const saveExpense = (expData: Omit<Expense, 'id' | 'businessId' | 'createdAt' | 'createdBy'>) => {
    const list = [...expenses];
    const newExp: Expense = {
      ...expData,
      id: `exp_${Date.now()}`,
      businessId: currentBusiness.id,
      createdBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newExp);
    db.set('expenses', list);
    db.logActivity(
      currentUser?.id || 'sys',
      currentUser?.name || 'Staff',
      currentUser?.role || 'admin',
      'Recorded Expense',
      'expense',
      `Recorded expense: ${newExp.title} - ${currentBusiness.currencySymbol}${newExp.amount} (${newExp.category})`,
      newExp.id
    );
  };

  const deleteExpense = (id: string) => {
    db.set('expenses', expenses.filter((e) => e.id !== id));
  };

  const saveCalculation = (record: Omit<CalculationRecord, 'id' | 'businessId' | 'userId' | 'timestamp'>) => {
    const list = [...calculations];
    const newRecord: CalculationRecord = {
      ...record,
      id: `calc_${Date.now()}`,
      businessId: currentBusiness.id,
      userId: currentUser?.id || 'user_admin',
      timestamp: Date.now(),
    };
    list.unshift(newRecord);
    db.set('calculations', list.slice(0, 300)); // keep last 300 calculations
  };

  const deleteCalculation = (id: string) => {
    db.set('calculations', calculations.filter((c) => c.id !== id));
  };

  const clearCalculations = () => {
    db.set('calculations', []);
  };

  const toggleFavoriteCalculation = (id: string) => {
    const list = calculations.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    db.set('calculations', list);
  };

  const exportBackup = () => {
    const data = db.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartbiz_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importBackup = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      db.importAll(parsed);
      refresh();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <DbContext.Provider
      value={{
        products,
        customers,
        suppliers,
        invoices,
        purchases,
        returns,
        expenses,
        calculations,
        customerLedger,
        supplierLedger,
        inventoryTransactions,
        activityLogs,
        paymentReminders,
        users,
        soundEnabled,
        setSoundEnabled,
        exportBackup,
        importBackup,
        refresh,
        saveProduct,
        deleteProduct,
        toggleFavoriteProduct,
        saveCustomer,
        deleteCustomer,
        saveSupplier,
        saveExpense,
        deleteExpense,
        saveCalculation,
        deleteCalculation,
        clearCalculations,
        toggleFavoriteCalculation,
        playSound,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) throw new Error('useDb must be used within DbProvider');
  return context;
};

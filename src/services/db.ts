import {
  ActivityLog,
  BusinessSettings,
  CalculationRecord,
  Customer,
  CustomerLedgerEntry,
  Expense,
  InventoryTransaction,
  Invoice,
  PaymentReminder,
  Product,
  Purchase,
  SaleReturn,
  Supplier,
  SupplierLedgerEntry,
  User
} from '../types';

const STORAGE_PREFIX = 'smartbiz_';

// Initial Demo Seed Data
const DEFAULT_BUSINESS: BusinessSettings = {
  id: 'biz_main',
  name: 'Al-Madina Smart Superstore',
  ownerName: 'Youza Manzoor',
  phone: '0300-1234567',
  email: 'store@smartbiz.com',
  address: 'Shop # 14-B, Commercial Market, Main Boulevard',
  taxId: 'NTN-8924018-7',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  invoicePrefix: 'SB-',
  defaultTaxRate: 0,
  defaultDiscountRate: 0,
  paymentIdentifier: '03001234567@easypaisa / Bank Alfalah 012891823901',
  receiptFooterNote: 'Thank you for shopping with us! Goods once sold cannot be returned without receipt.',
  paperSize: '80mm',
  autoPrintReceipt: true,
  enableSound: true,
};

const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Youza Manzoor (Owner)',
    email: 'admin@smartbiz.com',
    role: 'admin',
    phone: '0300-1234567',
    businessId: 'biz_main',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_manager',
    name: 'Hamza Tariq (Manager)',
    email: 'manager@smartbiz.com',
    role: 'manager',
    phone: '0321-7654321',
    businessId: 'biz_main',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_cashier',
    name: 'Bilal Ahmed (Cashier)',
    email: 'cashier@smartbiz.com',
    role: 'cashier',
    phone: '0333-9876543',
    businessId: 'biz_main',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    businessId: 'biz_main',
    name: 'Premium White Sugar (Cheeni)',
    sku: 'SUG-01',
    barcode: '89640001',
    category: 'Groceries',
    unit: 'KG',
    purchasePrice: 140,
    retailPrice: 180,
    wholesalePrice: 165,
    specialPrice: 160,
    stockQuantity: 250,
    minStock: 50,
    taxRate: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    businessId: 'biz_main',
    name: 'Super Basmati Rice (Karnal)',
    sku: 'RIC-01',
    barcode: '89640002',
    category: 'Groceries',
    unit: 'KG',
    purchasePrice: 260,
    retailPrice: 320,
    wholesalePrice: 300,
    specialPrice: 290,
    stockQuantity: 180,
    minStock: 40,
    taxRate: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    businessId: 'biz_main',
    name: 'Dalda Cooking Oil 1-Litre Pouch',
    sku: 'OIL-01',
    barcode: '89640003',
    category: 'Cooking & Oils',
    unit: 'PACK',
    purchasePrice: 480,
    retailPrice: 550,
    wholesalePrice: 525,
    specialPrice: 520,
    stockQuantity: 95,
    minStock: 25,
    taxRate: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_4',
    businessId: 'biz_main',
    name: 'Olpers Milk 1 Litre Full Cream',
    sku: 'MLK-01',
    barcode: '89640004',
    category: 'Dairy',
    unit: 'PACK',
    purchasePrice: 250,
    retailPrice: 290,
    wholesalePrice: 275,
    specialPrice: 270,
    stockQuantity: 60,
    minStock: 20,
    taxRate: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_5',
    businessId: 'biz_main',
    name: 'Fine Chakki Atta (Flour)',
    sku: 'FLR-01',
    barcode: '89640005',
    category: 'Groceries',
    unit: 'KG',
    purchasePrice: 115,
    retailPrice: 140,
    wholesalePrice: 130,
    specialPrice: 125,
    stockQuantity: 12, // LOW STOCK ALERT
    minStock: 50,
    taxRate: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_6',
    businessId: 'biz_main',
    name: 'Aquafina Mineral Water 1.5L',
    sku: 'WTR-01',
    barcode: '89640006',
    category: 'Beverages',
    unit: 'BTL',
    purchasePrice: 85,
    retailPrice: 120,
    wholesalePrice: 105,
    specialPrice: 100,
    stockQuantity: 140,
    minStock: 30,
    taxRate: 0,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_7',
    businessId: 'biz_main',
    name: 'Tapal Danedar Tea 475g',
    sku: 'TEA-01',
    barcode: '89640007',
    category: 'Beverages',
    unit: 'BOX',
    purchasePrice: 620,
    retailPrice: 730,
    wholesalePrice: 690,
    specialPrice: 680,
    stockQuantity: 8, // LOW STOCK
    minStock: 20,
    taxRate: 0,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_8',
    businessId: 'biz_main',
    name: 'National Iodized Salt 800g',
    sku: 'SLT-01',
    barcode: '89640008',
    category: 'Spices & Salt',
    unit: 'PACK',
    purchasePrice: 50,
    retailPrice: 70,
    wholesalePrice: 62,
    specialPrice: 60,
    stockQuantity: 80,
    minStock: 20,
    taxRate: 0,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_walkin',
    businessId: 'biz_main',
    name: 'Walk-in Customer',
    phone: '0000000000',
    customerType: 'walk-in',
    totalPurchases: 0,
    totalPaid: 0,
    totalDue: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust_1',
    businessId: 'biz_main',
    name: 'Ali Khan',
    phone: '03001234567',
    email: 'ali.khan@gmail.com',
    address: 'House 42, Street 8, G-9/2',
    notes: 'Trusted monthly credit customer (udhar). Settles every 1st of month.',
    customerType: 'regular',
    totalPurchases: 85500,
    totalPaid: 72000,
    totalDue: 13500, // Exact example from prompt
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastPurchaseDate: new Date().toISOString(),
  },
  {
    id: 'cust_2',
    businessId: 'biz_main',
    name: 'Muhammad Tariq',
    phone: '03219876543',
    address: 'Near Jamia Mosque, Block C',
    notes: 'Bakery owner, buys bulk sugar and flour',
    customerType: 'wholesale',
    totalPurchases: 145000,
    totalPaid: 140000,
    totalDue: 5000,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastPurchaseDate: new Date().toISOString(),
  },
  {
    id: 'cust_3',
    businessId: 'biz_main',
    name: 'Zahid Mehmood',
    phone: '03335554433',
    customerType: 'regular',
    totalPurchases: 22000,
    totalPaid: 22000,
    totalDue: 0,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    businessId: 'biz_main',
    name: 'Chaudhry Rauf Sugar Mills & Wholesale',
    company: 'Al-Rauf Distributors',
    phone: '0312-4455667',
    address: 'Grain Market (Ghalla Mandi), Sargodha Road',
    notes: 'Primary sugar and pulses supplier',
    totalPurchases: 280000,
    totalPaid: 240000,
    totalDue: 40000,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'sup_2',
    businessId: 'biz_main',
    name: 'Engro Foods Supply Hub',
    company: 'Engro & Olpers Distribution',
    phone: '0300-8899776',
    address: 'Industrial Area Sector I-9',
    totalPurchases: 195000,
    totalPaid: 195000,
    totalDue: 0,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
];

// Initial Customer Ledger for Ali Khan
const DEFAULT_LEDGER: CustomerLedgerEntry[] = [
  {
    id: 'ledg_1',
    businessId: 'biz_main',
    customerId: 'cust_1',
    date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    type: 'opening_balance',
    description: 'Opening Balance brought forward',
    debit: 10000,
    credit: 0,
    balance: 10000,
    createdBy: 'Youza Manzoor',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'ledg_2',
    businessId: 'biz_main',
    customerId: 'cust_1',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    type: 'sale',
    referenceId: 'SB-1001',
    description: 'Monthly groceries invoice #SB-1001',
    debit: 15500,
    credit: 0,
    balance: 25500,
    createdBy: 'Bilal Ahmed',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'ledg_3',
    businessId: 'biz_main',
    customerId: 'cust_1',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    type: 'payment',
    referenceId: 'PAY-771',
    description: 'Cash payment received via Shop Counter',
    debit: 0,
    credit: 12000,
    balance: 13500,
    createdBy: 'Youza Manzoor',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Initial Expenses
const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    businessId: 'biz_main',
    title: 'Shop Monthly Rent (Commercial Market)',
    category: 'Rent',
    amount: 35000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    receiptNumber: 'RENT-SEP-26',
    notes: 'Paid to landlord Tariq sb',
    createdBy: 'Youza Manzoor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_2',
    businessId: 'biz_main',
    title: 'IESCO Electricity Bill',
    category: 'Electricity',
    amount: 14200,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    receiptNumber: 'ELEC-9981',
    notes: 'Paid at Post Office',
    createdBy: 'Hamza Tariq',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_3',
    businessId: 'biz_main',
    title: 'Staff Daily Tea & Refreshments',
    category: 'Tea & Refreshments',
    amount: 650,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: 'Evening tea and biscuits for staff',
    createdBy: 'Bilal Ahmed',
    createdAt: new Date().toISOString(),
  },
];

class DatabaseEngine {
  private businessId = 'biz_main';
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.initDefaults();
  }

  private getKey(collection: string): string {
    return `${STORAGE_PREFIX}${this.businessId}_${collection}`;
  }

  private initDefaults() {
    if (!localStorage.getItem(`${STORAGE_PREFIX}initialized`)) {
      this.set('settings', DEFAULT_BUSINESS);
      this.set('users', DEFAULT_USERS);
      this.set('products', DEFAULT_PRODUCTS);
      this.set('customers', DEFAULT_CUSTOMERS);
      this.set('suppliers', DEFAULT_SUPPLIERS);
      this.set('customerLedger', DEFAULT_LEDGER);
      this.set('expenses', DEFAULT_EXPENSES);
      this.set('invoices', []);
      this.set('purchases', []);
      this.set('returns', []);
      this.set('calculations', [
        {
          id: 'calc_1',
          businessId: 'biz_main',
          userId: 'user_admin',
          expression: '250 * 4',
          result: '1,000',
          calculationType: 'Multiplication',
          category: 'Shopping',
          isFavorite: true,
          date: new Date().toISOString().split('T')[0],
          time: '09:15 AM',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'calc_2',
          businessId: 'biz_main',
          userId: 'user_admin',
          expression: '1500 + 2500',
          result: '4,000',
          calculationType: 'Addition',
          category: 'Customer',
          isFavorite: false,
          date: new Date().toISOString().split('T')[0],
          time: '09:30 AM',
          timestamp: Date.now() - 1800000,
        },
        {
          id: 'calc_3',
          businessId: 'biz_main',
          userId: 'user_admin',
          expression: '10000 * 15%',
          result: '1,500',
          calculationType: 'Percentage',
          category: 'Discount',
          isFavorite: true,
          date: new Date().toISOString().split('T')[0],
          time: '09:40 AM',
          timestamp: Date.now() - 900000,
        },
      ]);
      this.set('inventoryTransactions', []);
      this.set('activityLogs', [
        {
          id: 'act_1',
          businessId: 'biz_main',
          userId: 'user_admin',
          userName: 'Youza Manzoor',
          userRole: 'admin',
          action: 'Initialized Store Database',
          entity: 'system',
          details: 'SmartBiz inventory & POS initialized with standard catalog',
          timestamp: new Date().toISOString(),
        },
      ]);
      this.set('paymentReminders', [
        {
          id: 'rem_1',
          businessId: 'biz_main',
          customerId: 'cust_1',
          customerName: 'Ali Khan',
          customerPhone: '03001234567',
          dueAmount: 13500,
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          reminderCount: 1,
          status: 'pending',
          notes: 'Friendly monthly reminder',
        },
      ]);
      localStorage.setItem(`${STORAGE_PREFIX}initialized`, 'true');
    }
  }

  public subscribe(collection: string, callback: () => void): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set());
    }
    this.listeners.get(collection)!.add(callback);
    return () => {
      this.listeners.get(collection)?.delete(callback);
    };
  }

  private notify(collection: string) {
    if (this.listeners.has(collection)) {
      this.listeners.get(collection)!.forEach((cb) => cb());
    }
  }

  public get<T>(collection: string): T {
    try {
      const data = localStorage.getItem(this.getKey(collection));
      if (!data) return [] as unknown as T;
      return JSON.parse(data) as T;
    } catch {
      return [] as unknown as T;
    }
  }

  public set<T>(collection: string, data: T): void {
    try {
      localStorage.setItem(this.getKey(collection), JSON.stringify(data));
      this.notify(collection);
    } catch (e) {
      console.error(`Error saving to collection ${collection}`, e);
    }
  }

  public exportAll(): Record<string, any> {
    const keys = [
      'settings',
      'users',
      'products',
      'customers',
      'suppliers',
      'invoices',
      'purchases',
      'returns',
      'expenses',
      'calculations',
      'customerLedger',
      'supplierLedger',
      'inventoryTransactions',
      'activityLogs',
      'paymentReminders',
    ];
    const exportData: Record<string, any> = {};
    for (const key of keys) {
      exportData[key] = this.get(key);
    }
    return exportData;
  }

  public importAll(data: Record<string, any>): void {
    for (const [key, value] of Object.entries(data)) {
      this.set(key, value);
    }
  }

  public logActivity(userId: string, userName: string, userRole: any, action: string, entity: string, details: string, entityId?: string) {
    const logs = this.get<ActivityLog[]>('activityLogs') || [];
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: this.businessId,
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // keep max 500 logs
    this.set('activityLogs', logs.slice(0, 500));
  }

  // Record a complete Invoice / Sale transaction with atomic inventory reduction, customer balance update, profit calculation and ledger entry!
  public createInvoice(
    invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>,
    actor: { id: string; name: string; role: any }
  ): Invoice {
    const invoices = this.get<Invoice[]>('invoices') || [];
    const settings = this.get<BusinessSettings>('settings') || DEFAULT_BUSINESS;
    
    // Auto-generate invoice number: SB-1001, SB-1002, etc.
    const seq = invoices.length + 1001;
    const invoiceNumber = `${settings.invoicePrefix || 'SB-'}${seq}`;

    // Calculate COGS and Profit server-side/transactionally
    const products = this.get<Product[]>('products') || [];
    let totalCost = 0;
    
    // Check & reduce inventory, record inventory transactions
    const invTransactions = this.get<InventoryTransaction[]>('inventoryTransactions') || [];
    const updatedProducts = [...products];

    const enrichedItems = invoiceData.items.map((item) => {
      const pIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      const purchaseCost = pIndex >= 0 ? updatedProducts[pIndex].purchasePrice : item.purchaseCost || 0;
      totalCost += purchaseCost * item.quantity;

      if (pIndex >= 0) {
        const prevStock = updatedProducts[pIndex].stockQuantity;
        const newStock = Math.max(0, prevStock - item.quantity);
        updatedProducts[pIndex] = {
          ...updatedProducts[pIndex],
          stockQuantity: newStock,
          updatedAt: new Date().toISOString(),
        };

        invTransactions.unshift({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          businessId: this.businessId,
          productId: item.productId,
          productName: item.productName,
          type: 'sale',
          quantityDelta: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          referenceId: invoiceNumber,
          notes: `Sold via Invoice ${invoiceNumber}`,
          date: new Date().toISOString().split('T')[0],
          createdBy: actor.name,
        });
      }

      return {
        ...item,
        purchaseCost,
      };
    });

    const grossProfit = invoiceData.grandTotal - totalCost;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      invoiceNumber,
      items: enrichedItems,
      totalCost,
      grossProfit,
      createdAt: new Date().toISOString(),
    };

    invoices.unshift(newInvoice);
    this.set('invoices', invoices);
    this.set('products', updatedProducts);
    this.set('inventoryTransactions', invTransactions);

    // Update Customer purchases and due balance if not walk-in
    if (invoiceData.customerId && invoiceData.customerId !== 'cust_walkin') {
      const customers = this.get<Customer[]>('customers') || [];
      const cIndex = customers.findIndex((c) => c.id === invoiceData.customerId);
      if (cIndex >= 0) {
        const cust = customers[cIndex];
        const newPurchases = cust.totalPurchases + invoiceData.grandTotal;
        const newPaid = cust.totalPaid + invoiceData.paidAmount;
        const newDue = cust.totalDue + invoiceData.dueAmount;

        customers[cIndex] = {
          ...cust,
          totalPurchases: newPurchases,
          totalPaid: newPaid,
          totalDue: Math.max(0, newDue),
          lastPurchaseDate: newInvoice.date,
        };
        this.set('customers', customers);

        // Record customer ledger entry
        const ledger = this.get<CustomerLedgerEntry[]>('customerLedger') || [];
        const ledgerEntry: CustomerLedgerEntry = {
          id: `ledg_${Date.now()}`,
          businessId: this.businessId,
          customerId: cust.id,
          date: invoiceData.date,
          type: 'sale',
          referenceId: invoiceNumber,
          description: `Sale Invoice #${invoiceNumber} (Total: ${invoiceData.grandTotal}, Paid: ${invoiceData.paidAmount}, Due: ${invoiceData.dueAmount})`,
          debit: invoiceData.grandTotal,
          credit: invoiceData.paidAmount,
          balance: newDue,
          createdBy: actor.name,
          createdAt: new Date().toISOString(),
        };
        ledger.push(ledgerEntry);
        this.set('customerLedger', ledger);

        // If there's due balance, ensure reminder exists
        if (invoiceData.dueAmount > 0) {
          const reminders = this.get<PaymentReminder[]>('paymentReminders') || [];
          const rIndex = reminders.findIndex((r) => r.customerId === cust.id);
          if (rIndex >= 0) {
            reminders[rIndex].dueAmount = newDue;
            reminders[rIndex].status = 'pending';
          } else {
            reminders.push({
              id: `rem_${Date.now()}`,
              businessId: this.businessId,
              customerId: cust.id,
              customerName: cust.name,
              customerPhone: cust.phone,
              dueAmount: newDue,
              reminderCount: 0,
              status: 'pending',
            });
          }
          this.set('paymentReminders', reminders);
        }
      }
    }

    this.logActivity(
      actor.id,
      actor.name,
      actor.role,
      'Created Invoice',
      'invoice',
      `Invoice #${invoiceNumber} total ${settings.currencySymbol}${invoiceData.grandTotal} (${invoiceData.items.length} items) for ${invoiceData.customerName}`,
      newInvoice.id
    );

    return newInvoice;
  }

  // Record a Customer Payment (Settle Udhar)
  public recordCustomerPayment(
    customerId: string,
    amount: number,
    paymentMethod: any,
    notes: string,
    actor: { id: string; name: string; role: any }
  ) {
    const customers = this.get<Customer[]>('customers') || [];
    const cIndex = customers.findIndex((c) => c.id === customerId);
    if (cIndex === -1) return;

    const cust = customers[cIndex];
    const newPaid = cust.totalPaid + amount;
    const newDue = Math.max(0, cust.totalDue - amount);

    customers[cIndex] = {
      ...cust,
      totalPaid: newPaid,
      totalDue: newDue,
    };
    this.set('customers', customers);

    // Add to ledger
    const ledger = this.get<CustomerLedgerEntry[]>('customerLedger') || [];
    const ledgerEntry: CustomerLedgerEntry = {
      id: `ledg_${Date.now()}`,
      businessId: this.businessId,
      customerId: cust.id,
      date: new Date().toISOString().split('T')[0],
      type: 'payment',
      description: `Payment received (${paymentMethod}): ${notes || 'Udhar balance settlement'}`,
      debit: 0,
      credit: amount,
      balance: newDue,
      createdBy: actor.name,
      createdAt: new Date().toISOString(),
    };
    ledger.push(ledgerEntry);
    this.set('customerLedger', ledger);

    // Update payment reminder
    const reminders = this.get<PaymentReminder[]>('paymentReminders') || [];
    const rIndex = reminders.findIndex((r) => r.customerId === cust.id);
    if (rIndex >= 0) {
      reminders[rIndex].dueAmount = newDue;
      if (newDue <= 0) reminders[rIndex].status = 'resolved';
      this.set('paymentReminders', reminders);
    }

    this.logActivity(
      actor.id,
      actor.name,
      actor.role,
      'Received Payment',
      'payment',
      `Received payment of ${cust.totalDue >= 0 ? amount : 0} from ${cust.name}`,
      cust.id
    );
  }

  // Create Supplier Purchase (Restock inventory + update supplier ledger)
  public createPurchase(
    purchaseData: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>,
    actor: { id: string; name: string; role: any }
  ): Purchase {
    const purchases = this.get<Purchase[]>('purchases') || [];
    const seq = purchases.length + 5001;
    const purchaseNumber = `PUR-${seq}`;

    const newPurchase: Purchase = {
      ...purchaseData,
      id: `pur_${Date.now()}`,
      purchaseNumber,
      createdAt: new Date().toISOString(),
    };

    purchases.unshift(newPurchase);
    this.set('purchases', purchases);

    // Increase product stock & update purchase price
    const products = this.get<Product[]>('products') || [];
    const invTransactions = this.get<InventoryTransaction[]>('inventoryTransactions') || [];

    purchaseData.items.forEach((pItem) => {
      const pIndex = products.findIndex((p) => p.id === pItem.productId);
      if (pIndex >= 0) {
        const prevStock = products[pIndex].stockQuantity;
        const newStock = prevStock + pItem.quantity;
        products[pIndex] = {
          ...products[pIndex],
          stockQuantity: newStock,
          purchasePrice: pItem.purchasePrice > 0 ? pItem.purchasePrice : products[pIndex].purchasePrice,
          updatedAt: new Date().toISOString(),
        };

        invTransactions.unshift({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          businessId: this.businessId,
          productId: pItem.productId,
          productName: pItem.productName,
          type: 'purchase',
          quantityDelta: pItem.quantity,
          previousStock: prevStock,
          newStock: newStock,
          referenceId: purchaseNumber,
          notes: `Stock in via Supplier Purchase ${purchaseNumber}`,
          date: purchaseData.date,
          createdBy: actor.name,
        });
      }
    });

    this.set('products', products);
    this.set('inventoryTransactions', invTransactions);

    // Update Supplier total & due
    const suppliers = this.get<Supplier[]>('suppliers') || [];
    const sIndex = suppliers.findIndex((s) => s.id === purchaseData.supplierId);
    if (sIndex >= 0) {
      const s = suppliers[sIndex];
      suppliers[sIndex] = {
        ...s,
        totalPurchases: s.totalPurchases + purchaseData.totalAmount,
        totalPaid: s.totalPaid + purchaseData.paidAmount,
        totalDue: s.totalDue + purchaseData.dueAmount,
      };
      this.set('suppliers', suppliers);

      // Supplier ledger
      const sLedger = this.get<SupplierLedgerEntry[]>('supplierLedger') || [];
      sLedger.push({
        id: `sledg_${Date.now()}`,
        businessId: this.businessId,
        supplierId: s.id,
        date: purchaseData.date,
        type: 'purchase',
        referenceId: purchaseNumber,
        description: `Goods purchased under #${purchaseNumber}`,
        debit: purchaseData.paidAmount,
        credit: purchaseData.totalAmount,
        balance: suppliers[sIndex].totalDue,
        createdAt: new Date().toISOString(),
      });
      this.set('supplierLedger', sLedger);
    }

    this.logActivity(
      actor.id,
      actor.name,
      actor.role,
      'Recorded Purchase',
      'purchase',
      `Purchased ${purchaseData.items.length} items from ${purchaseData.supplierName} total ${purchaseData.totalAmount}`,
      newPurchase.id
    );

    return newPurchase;
  }

  // Process a Sale Return / Refund (Restore inventory, adjust invoice, customer balance & profit)
  public processReturn(
    returnData: Omit<SaleReturn, 'id' | 'returnNumber' | 'createdAt'>,
    actor: { id: string; name: string; role: any }
  ): SaleReturn {
    const returns = this.get<SaleReturn[]>('returns') || [];
    const returnNumber = `RET-${returns.length + 3001}`;

    const newReturn: SaleReturn = {
      ...returnData,
      id: `ret_${Date.now()}`,
      returnNumber,
      createdAt: new Date().toISOString(),
    };

    returns.unshift(newReturn);
    this.set('returns', returns);

    // Restore inventory if restock is true
    const products = this.get<Product[]>('products') || [];
    const invTransactions = this.get<InventoryTransaction[]>('inventoryTransactions') || [];

    returnData.items.forEach((item) => {
      if (item.restock) {
        const pIndex = products.findIndex((p) => p.id === item.productId);
        if (pIndex >= 0) {
          const prevStock = products[pIndex].stockQuantity;
          const newStock = prevStock + item.quantity;
          products[pIndex] = {
            ...products[pIndex],
            stockQuantity: newStock,
            updatedAt: new Date().toISOString(),
          };

          invTransactions.unshift({
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            businessId: this.businessId,
            productId: item.productId,
            productName: item.productName,
            type: 'return',
            quantityDelta: item.quantity,
            previousStock: prevStock,
            newStock: newStock,
            referenceId: returnNumber,
            notes: `Restocked from Return ${returnNumber}: ${returnData.reason}`,
            date: returnData.date,
            createdBy: actor.name,
          });
        }
      }
    });

    this.set('products', products);
    this.set('inventoryTransactions', invTransactions);

    // Adjust Customer Ledger & balance if refundMethod is credit_adjust
    if (returnData.customerId && returnData.customerId !== 'cust_walkin') {
      const customers = this.get<Customer[]>('customers') || [];
      const cIndex = customers.findIndex((c) => c.id === returnData.customerId);
      if (cIndex >= 0) {
        const cust = customers[cIndex];
        const newDue = Math.max(0, cust.totalDue - returnData.totalRefund);
        customers[cIndex] = {
          ...cust,
          totalDue: newDue,
        };
        this.set('customers', customers);

        const ledger = this.get<CustomerLedgerEntry[]>('customerLedger') || [];
        ledger.push({
          id: `ledg_${Date.now()}`,
          businessId: this.businessId,
          customerId: cust.id,
          date: returnData.date,
          type: 'return',
          referenceId: returnNumber,
          description: `Product Return #${returnNumber} (${returnData.reason})`,
          debit: 0,
          credit: returnData.totalRefund,
          balance: newDue,
          createdBy: actor.name,
          createdAt: new Date().toISOString(),
        });
        this.set('customerLedger', ledger);
      }
    }

    // Update invoice status
    const invoices = this.get<Invoice[]>('invoices') || [];
    const invIndex = invoices.findIndex((i) => i.id === returnData.invoiceId);
    if (invIndex >= 0) {
      invoices[invIndex].status = 'partial_refund';
      this.set('invoices', invoices);
    }

    this.logActivity(
      actor.id,
      actor.name,
      actor.role,
      'Processed Return',
      'return',
      `Processed return ${returnNumber} for invoice ${returnData.invoiceNumber} amount ${returnData.totalRefund}`,
      newReturn.id
    );

    return newReturn;
  }

  // Stock Adjustment (Damaged / Missing / Manual Count correction)
  public adjustStock(
    productId: string,
    quantityDelta: number,
    reason: 'damaged' | 'adjustment',
    notes: string,
    actor: { id: string; name: string; role: any }
  ) {
    const products = this.get<Product[]>('products') || [];
    const pIndex = products.findIndex((p) => p.id === productId);
    if (pIndex === -1) return;

    const prod = products[pIndex];
    const prevStock = prod.stockQuantity;
    const newStock = Math.max(0, prevStock + quantityDelta);

    products[pIndex] = {
      ...prod,
      stockQuantity: newStock,
      updatedAt: new Date().toISOString(),
    };
    this.set('products', products);

    const invTransactions = this.get<InventoryTransaction[]>('inventoryTransactions') || [];
    invTransactions.unshift({
      id: `tx_${Date.now()}`,
      businessId: this.businessId,
      productId: prod.id,
      productName: prod.name,
      type: reason,
      quantityDelta,
      previousStock: prevStock,
      newStock,
      notes: notes || `Manual stock adjustment (${reason})`,
      date: new Date().toISOString().split('T')[0],
      createdBy: actor.name,
    });
    this.set('inventoryTransactions', invTransactions);

    this.logActivity(
      actor.id,
      actor.name,
      actor.role,
      'Adjusted Stock',
      'inventory',
      `${reason.toUpperCase()}: ${prod.name} changed by ${quantityDelta} (New: ${newStock})`,
      prod.id
    );
  }

  // Export full business database backup as JSON
  public exportBackup(): string {
    const collections = [
      'settings',
      'users',
      'products',
      'customers',
      'suppliers',
      'customerLedger',
      'supplierLedger',
      'invoices',
      'purchases',
      'returns',
      'expenses',
      'calculations',
      'inventoryTransactions',
      'activityLogs',
      'paymentReminders',
    ];
    const exportData: Record<string, any> = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      businessId: this.businessId,
      data: {},
    };
    collections.forEach((col) => {
      exportData.data[col] = this.get(col);
    });
    return JSON.stringify(exportData, null, 2);
  }

  // Restore database from JSON backup
  public importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;
      Object.keys(parsed.data).forEach((col) => {
        this.set(col, parsed.data[col]);
      });
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  // Reset database back to default factory demo state
  public resetToDefaults() {
    localStorage.removeItem(`${STORAGE_PREFIX}initialized`);
    this.initDefaults();
    window.location.reload();
  }
}

export const db = new DatabaseEngine();

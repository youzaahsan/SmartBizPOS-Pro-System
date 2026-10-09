import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DbProvider } from './context/DbContext';
import { AppNavbar, ActiveTab } from './components/layout/AppNavbar';
import { SmartCalculator } from './components/calculator/SmartCalculator';
import { QuickSale } from './components/pos/QuickSale';
import { BillingView } from './components/pos/BillingView';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { ProductManagement } from './components/products/ProductManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { PurchaseManagement } from './components/purchases/PurchaseManagement';
import { ReturnManagement } from './components/returns/ReturnManagement';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { BusinessReports } from './components/reports/BusinessReports';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { Customer } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // States passed from Smart Calculator to Billing View
  const [billingInitialItems, setBillingInitialItems] = useState<
    { name: string; quantity: number; price: number }[] | undefined
  >(undefined);
  const [billingInitialCustomer, setBillingInitialCustomer] = useState<Customer | undefined>(
    undefined
  );

  const handleConvertToBill = (items: { name: string; quantity: number; price: number }[]) => {
    setBillingInitialItems(items);
    setActiveTab('billing');
  };

  const handleSaveToCustomer = (amount: number, note: string) => {
    setBillingInitialItems([
      {
        name: note || 'Calculated Bill Items',
        quantity: 1,
        price: amount,
      },
    ]);
    setActiveTab('billing');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <AppNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardOverview onNavigate={setActiveTab} />}

        {activeTab === 'calculator' && (
          <SmartCalculator
            onConvertToBill={handleConvertToBill}
            onSaveToCustomer={handleSaveToCustomer}
          />
        )}

        {activeTab === 'quick_sale' && (
          <QuickSale onSaleComplete={() => {}} />
        )}

        {activeTab === 'billing' && (
          <BillingView
            initialItems={billingInitialItems}
            initialCustomer={billingInitialCustomer}
            onClearInitial={() => {
              setBillingInitialItems(undefined);
              setBillingInitialCustomer(undefined);
            }}
          />
        )}

        {activeTab === 'customers' && <CustomerManagement />}

        {activeTab === 'products' && <ProductManagement />}

        {activeTab === 'inventory' && <InventoryManagement />}

        {activeTab === 'purchases' && <PurchaseManagement />}

        {activeTab === 'returns' && <ReturnManagement />}

        {activeTab === 'expenses' && <ExpenseManagement />}

        {activeTab === 'reports' && <BusinessReports />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Auth & Role Switcher Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DbProvider>
        <MainApp />
      </DbProvider>
    </AuthProvider>
  );
}

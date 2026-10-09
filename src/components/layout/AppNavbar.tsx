import React, { useState } from 'react';
import {
  Calculator,
  Zap,
  Receipt,
  Users,
  Package,
  Boxes,
  Truck,
  RotateCcw,
  Wallet,
  FileSpreadsheet,
  Settings,
  LayoutDashboard,
  Shield,
  Volume2,
  VolumeX,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDb } from '../../context/DbContext';

export type ActiveTab =
  | 'dashboard'
  | 'calculator'
  | 'quick_sale'
  | 'billing'
  | 'customers'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'returns'
  | 'expenses'
  | 'reports'
  | 'settings';

interface AppNavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ activeTab, onSelectTab, onOpenAuth }) => {
  const { currentBusiness, currentUser, can } = useAuth();
  const { soundEnabled, setSoundEnabled } = useDb();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; permission?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'quick_sale', label: 'Quick Sale', icon: <Zap className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing / POS', icon: <Receipt className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers & Udhar', icon: <Users className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-4 h-4" /> },
    { id: 'purchases', label: 'Purchases', icon: <Truck className="w-4 h-4" /> },
    { id: 'returns', label: 'Returns', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expenses', icon: <Wallet className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" />, permission: 'view_reports' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const visibleNav = navItems.filter((i) => !i.permission || can(i.permission as any));

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition">
              <Calculator className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-base sm:text-lg">SmartBiz</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  POS PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-xs">
                {currentBusiness.name}
              </p>
            </div>
          </div>

          {/* Right Actions: Sound, Role Badge, Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title={soundEnabled ? 'Mute Sounds' : 'Enable Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Role Badge & Auth Switcher Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {currentUser?.role}
                </div>
              </div>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Horizontal Navigation Bar */}
      <div className="hidden lg:block bg-slate-950/60 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {visibleNav.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-1">
          {visibleNav.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

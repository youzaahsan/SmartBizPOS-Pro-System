import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Calculator,
  Receipt,
  Truck,
  Wallet,
  Calendar,
  CheckCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';

interface DashboardOverviewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { invoices, customers, products, expenses, suppliers, inventoryTransactions } = useDb();
  const { currentBusiness, can } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  // Daily Calculations
  const todayInvoices = invoices.filter((i) => i.date === today);
  const todaySales = todayInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const todayProfit = todayInvoices.reduce((acc, i) => acc + i.grossProfit, 0);
  const todayExpenses = expenses
    .filter((e) => e.date === today)
    .reduce((acc, e) => acc + e.amount, 0);
  const todayNetProfit = todayProfit - todayExpenses;

  // Receivables & Payables
  const totalUdharDue = customers.reduce((acc, c) => acc + c.totalDue, 0);
  const totalSupplierDue = suppliers.reduce((acc, s) => acc + s.totalDue, 0);

  // Stock Valuation
  const totalStockRetailVal = products.reduce((acc, p) => acc + p.stockQuantity * p.retailPrice, 0);
  const totalStockCostVal = products.reduce((acc, p) => acc + p.stockQuantity * p.purchasePrice, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStock).length;

  // Chart 1: Last 7 Days Sales Trend
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayInvoices = invoices.filter((inv) => inv.date === dateStr);
    const daySales = dayInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const dayProfit = dayInvoices.reduce((acc, inv) => acc + inv.grossProfit, 0);

    return {
      day: dayName,
      date: dateStr,
      sales: daySales,
      profit: dayProfit,
    };
  });

  // Chart 2: Category Breakdown
  const categorySalesMap: Record<string, number> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'General';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.total;
    });
  });

  const categoryData = Object.entries(categorySalesMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 rounded-3xl shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Live Store Terminal • {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
          </div>
          <h1 className="text-2xl font-black mt-1">{currentBusiness.name}</h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            {currentBusiness.address} • Phone: {currentBusiness.phone}
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('quick_sale')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Zap className="w-4 h-4" />
            Quick Sale
          </button>
          <button
            onClick={() => onNavigate('calculator')}
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs active:scale-95 transition"
          >
            <Calculator className="w-4 h-4" />
            Calculator
          </button>
          <button
            onClick={() => onNavigate('billing')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Receipt className="w-4 h-4" />
            + New Bill
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today's Sales */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Today's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-gray-900">
            {currentBusiness.currencySymbol}{todaySales.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <span className="font-bold text-emerald-700">{todayInvoices.length} invoices</span>
            <span>billed today</span>
          </div>
        </div>

        {/* Metric 2: Today's Net Profit (Admin/Manager) */}
        {can('view_reports') ? (
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Today's Net Profit</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-2xl text-teal-700">
              {currentBusiness.currencySymbol}{todayNetProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-500">
              Gross: {currentBusiness.currencySymbol}{todayProfit.toLocaleString()} • Exp:{' '}
              {currentBusiness.currencySymbol}{todayExpenses.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
              <span>Customer Invoices</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono font-black text-2xl text-gray-900">
              {invoices.length}
            </div>
            <div className="text-[11px] text-gray-500">Lifetime transactions</div>
          </div>
        )}

        {/* Metric 3: Total Outstanding Udhar */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2 cursor-pointer hover:border-rose-300 transition"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Outstanding Udhar (Due)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-rose-700">
            {currentBusiness.currencySymbol}{totalUdharDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <span>Tap to open Udhar Ledger →</span>
          </div>
        </div>

        {/* Metric 4: Stock Valuation & Low Stock Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2 cursor-pointer hover:border-amber-300 transition"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Inventory Value</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-2xl text-gray-900">
            {currentBusiness.currencySymbol}{totalStockRetailVal.toLocaleString()}
          </div>
          <div className="text-[11px] flex items-center gap-1 font-semibold">
            {lowStockCount > 0 ? (
              <span className="text-rose-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                {lowStockCount} items low in stock
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" />
                All stock healthy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">7-Day Sales & Revenue Trend</h2>
              <p className="text-xs text-gray-500">Live transaction history over the last week</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <span>Gross Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`${currentBusiness.currencySymbol}${Number(val).toLocaleString()}`]}
                  contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Gross Profit"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Revenue by Category</h2>
            <p className="text-xs text-gray-500">Distribution of retail product sales</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-center text-gray-400 text-xs">No sales recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [
                      `${currentBusiness.currencySymbol}${Number(val).toLocaleString()}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100 max-h-28 overflow-y-auto">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-700 truncate max-w-[120px]">{cat.name}</span>
                </span>
                <span className="font-mono font-bold text-gray-900">
                  {currentBusiness.currencySymbol}{cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Invoices Feed & Low Stock Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices Feed */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-sm text-gray-900">Recent Customer Sales</h2>
            <button
              onClick={() => onNavigate('billing')}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold"
            >
              View All Invoices →
            </button>
          </div>

          <div className="space-y-2">
            {invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-100 flex items-center justify-between text-xs transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-900">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-gray-900 font-bold">{inv.customerName}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {inv.date} • {inv.items.length} items • Paid via {inv.paymentMethod}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-gray-900 text-sm">
                    {currentBusiness.currencySymbol}{inv.grandTotal.toLocaleString()}
                  </div>
                  {inv.dueAmount > 0 ? (
                    <span className="text-[10px] text-rose-600 font-bold">
                      Due: {currentBusiness.currencySymbol}{inv.dueAmount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold">PAID</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Attention List */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Low Stock Reorder List
            </h2>
            <button
              onClick={() => onNavigate('purchases')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Order from Supplier →
            </button>
          </div>

          <div className="space-y-2">
            {products
              .filter((p) => p.stockQuantity <= p.minStock)
              .slice(0, 5)
              .map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-[11px] text-gray-500">
                      Wholesale Cost: {currentBusiness.currencySymbol}{p.purchasePrice}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-rose-100 text-rose-800 font-mono font-bold px-2 py-0.5 rounded-full text-xs">
                      {p.stockQuantity} {p.unit} left
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

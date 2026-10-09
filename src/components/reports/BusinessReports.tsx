import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Truck,
  Package,
  Award
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';

export const BusinessReports: React.FC = () => {
  const { invoices, expenses, customers, suppliers, products, users } = useDb();
  const { currentBusiness } = useAuth();

  const [activeReport, setActiveReport] = useState<
    'pnl' | 'daily' | 'customer_due' | 'supplier_due' | 'bestsellers' | 'cashiers'
  >('pnl');

  // Profit & Loss Data
  const totalSales = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCostOfGoods = invoices.reduce((acc, i) => acc + i.totalCost, 0);
  const grossProfit = totalSales - totalCostOfGoods;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Best Sellers Calculation
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((it) => {
      if (!productSalesMap[it.productName]) {
        productSalesMap[it.productName] = { name: it.productName, quantity: 0, revenue: 0 };
      }
      productSalesMap[it.productName].quantity += it.quantity;
      productSalesMap[it.productName].revenue += it.total;
    });
  });

  const bestSellers = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

  // Cashier Performance
  const cashierMap: Record<string, { name: string; invoiceCount: number; salesTotal: number }> = {};
  invoices.forEach((inv) => {
    const cName = inv.cashierName || 'Staff';
    if (!cashierMap[cName]) {
      cashierMap[cName] = { name: cName, invoiceCount: 0, salesTotal: 0 };
    }
    cashierMap[cName].invoiceCount += 1;
    cashierMap[cName].salesTotal += inv.grandTotal;
  });

  const cashierStats = Object.values(cashierMap);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReport === 'customer_due') {
      csvContent += 'Customer Name,Phone,Total Purchases,Total Paid,Outstanding Due (Udhar)\n';
      customers
        .filter((c) => c.totalDue > 0)
        .forEach((c) => {
          csvContent += `"${c.name}","${c.phone}",${c.totalPurchases},${c.totalPaid},${c.totalDue}\n`;
        });
    } else {
      csvContent += 'Metric,Value\n';
      csvContent += `Total Sales,${totalSales}\n`;
      csvContent += `Cost of Goods Sold,${totalCostOfGoods}\n`;
      csvContent += `Gross Profit,${grossProfit}\n`;
      csvContent += `Total Expenses,${totalExpenses}\n`;
      csvContent += `Net Profit,${netProfit}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Financial Reports & Business Intelligence</h1>
            <p className="text-xs text-gray-500">
              Profit & loss, customer due balances, inventory margins & cashier audits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'pnl', label: 'Profit & Loss Statement' },
          { id: 'customer_due', label: 'Customer Udhar (Due) Report' },
          { id: 'supplier_due', label: 'Supplier Payables Report' },
          { id: 'bestsellers', label: 'Best Selling Items' },
          { id: 'cashiers', label: 'Cashier Performance' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveReport(t.id as any)}
            className={`px-4 py-2 rounded-2xl font-bold transition whitespace-nowrap ${
              activeReport === t.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Report Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
        {activeReport === 'pnl' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center pb-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Profit and Loss Statement</h2>
              <p className="text-xs text-gray-500">
                {currentBusiness.name} • Generated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="font-sans font-semibold text-gray-700">Gross Sales Revenue:</span>
                <span className="font-bold text-gray-900">
                  {currentBusiness.currencySymbol}{totalSales.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="font-sans font-semibold text-gray-700">
                  Cost of Goods Sold (COGS):
                </span>
                <span className="font-bold text-gray-600">
                  -{currentBusiness.currencySymbol}{totalCostOfGoods.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100 font-bold text-emerald-900">
                <span className="font-sans">Gross Profit:</span>
                <span>{currentBusiness.currencySymbol}{grossProfit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="font-sans font-semibold text-gray-700">
                  Operating Expenses (Rent, Bills, Salaries, Refreshments):
                </span>
                <span className="font-bold text-rose-600">
                  -{currentBusiness.currencySymbol}{totalExpenses.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-2xl text-base font-black">
                <span className="font-sans">NET PROFIT:</span>
                <span className="text-emerald-400">
                  {currentBusiness.currencySymbol}{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'customer_due' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base text-gray-900">
                  Customer Outstanding Udhar (Receivables)
                </h2>
                <p className="text-xs text-gray-500">List of all customers with unpaid credit balances</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Total Udhar Due:</span>
                <div className="font-mono font-black text-rose-600 text-lg">
                  {currentBusiness.currencySymbol}
                  {customers.reduce((a, b) => a + b.totalDue, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Customer Type</th>
                    <th className="p-3 text-right">Total Purchases</th>
                    <th className="p-3 text-right">Total Paid</th>
                    <th className="p-3 text-right">Current Due (Udhar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers
                    .filter((c) => c.totalDue > 0)
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{c.name}</td>
                        <td className="p-3 font-mono text-gray-600">{c.phone}</td>
                        <td className="p-3 uppercase text-[10px]">{c.customerType}</td>
                        <td className="p-3 text-right font-mono">
                          {currentBusiness.currencySymbol}{c.totalPurchases.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-700">
                          {currentBusiness.currencySymbol}{c.totalPaid.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-rose-600">
                          {currentBusiness.currencySymbol}{c.totalDue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'supplier_due' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base text-gray-900">
                  Supplier Accounts Payable Report
                </h2>
                <p className="text-xs text-gray-500">Outstanding liabilities owed to distributors</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Total Payable:</span>
                <div className="font-mono font-black text-rose-600 text-lg">
                  {currentBusiness.currencySymbol}
                  {suppliers.reduce((a, b) => a + b.totalDue, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-right">Total Goods Received</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-right">Payable Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{s.name}</td>
                      <td className="p-3 text-gray-600">{s.company}</td>
                      <td className="p-3 font-mono text-gray-600">{s.phone}</td>
                      <td className="p-3 text-right font-mono">
                        {currentBusiness.currencySymbol}{s.totalPurchases.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700">
                        {currentBusiness.currencySymbol}{s.totalPaid.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-rose-600">
                        {currentBusiness.currencySymbol}{s.totalDue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'bestsellers' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-gray-900">Best Selling Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-right">Quantity Sold</th>
                    <th className="p-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bestSellers.map((item, idx) => (
                    <tr key={item.name} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-emerald-700">#{idx + 1}</td>
                      <td className="p-3 font-bold text-gray-900">{item.name}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-800">
                        {currentBusiness.currencySymbol}{item.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'cashiers' && (
          <div className="space-y-4">
            <h2 className="font-bold text-base text-gray-900">Cashier & Staff Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Staff / Cashier</th>
                    <th className="p-3 text-center">Invoices Handled</th>
                    <th className="p-3 text-right">Total Revenue Billed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cashierStats.map((c) => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{c.name}</td>
                      <td className="p-3 text-center font-mono font-bold">{c.invoiceCount}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-800">
                        {currentBusiness.currencySymbol}{c.salesTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

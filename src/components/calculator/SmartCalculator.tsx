import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  Receipt,
  UserCheck,
  History,
  Star,
  Trash2,
  Tag,
  Percent,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { CalculationRecord } from '../../types';

interface SmartCalculatorProps {
  onConvertToBill: (items: { name: string; quantity: number; price: number }[]) => void;
  onSaveToCustomer: (amount: number, note: string) => void;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({
  onConvertToBill,
  onSaveToCustomer,
}) => {
  const { currentBusiness } = useAuth();
  const {
    products,
    calculations,
    saveCalculation,
    deleteCalculation,
    toggleFavoriteCalculation,
    clearCalculations,
    playSound,
  } = useDb();

  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [prevCalc, setPrevCalc] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [gtCount, setGtCount] = useState<number>(0);
  const [category, setCategory] = useState<CalculationRecord['category']>('General');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilterCategory, setHistoryFilterCategory] = useState<string>('all');
  const [showGstMenu, setShowGstMenu] = useState<boolean>(false);
  const [gstRate, setGstRate] = useState<number>(18);
  const [calcTape, setCalcTape] = useState<{ text: string; val: number }[]>([]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        handleDigit(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        const op = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        handleOperator(op);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleAllClear();
      } else if (e.key === '%') {
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, result, category]);

  const evaluateExpression = (expr: string): number => {
    try {
      // sanitize and replace symbols
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');
      // safe arithmetic evaluation
      if (!/^[\d\s\+\-\*\/\.\(\)]+$/.test(sanitized)) return 0;
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${sanitized})`)();
      return isFinite(res) ? Number(res) : 0;
    } catch {
      return 0;
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num);
  };

  const handleDigit = (d: string) => {
    playSound('beep');
    if (expression === '' && d === '.') {
      setExpression('0.');
      return;
    }
    setExpression((prev) => {
      if (prev === '0' && d !== '.') return d;
      return prev + d;
    });
  };

  const handleOperator = (op: string) => {
    playSound('beep');
    if (!expression) {
      if (result !== '0') {
        setExpression(result.replace(/,/g, '') + ' ' + op + ' ');
      }
      return;
    }
    const trimmed = expression.trim();
    const lastChar = trimmed.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(trimmed.slice(0, -1) + op + ' ');
    } else {
      setExpression(trimmed + ' ' + op + ' ');
    }
  };

  const handleCalculate = () => {
    if (!expression) return;
    playSound('success');
    const val = evaluateExpression(expression);
    const formatted = formatNumber(val);
    setResult(formatted);
    setPrevCalc(`${expression} = ${formatted}`);

    // Update tape
    setCalcTape((prev) => [...prev, { text: expression, val }]);

    // Update Grand Total accumulator
    setGrandTotal((prev) => prev + val);
    setGtCount((prev) => prev + 1);

    // Save calculation history
    saveCalculation({
      expression,
      result: formatted,
      calculationType: 'General Math',
      category,
      isFavorite: false,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setExpression('');
  };

  const handleAllClear = () => {
    playSound('beep');
    setExpression('');
    setResult('0');
  };

  const handleClear = () => {
    playSound('beep');
    setExpression('');
  };

  const handleBackspace = () => {
    playSound('beep');
    setExpression((prev) => {
      if (prev.endsWith(' ')) return prev.slice(0, -3);
      return prev.slice(0, -1);
    });
  };

  const handlePercentage = () => {
    playSound('beep');
    if (!expression) return;
    const val = evaluateExpression(expression);
    const pVal = val / 100;
    setExpression(String(pVal));
    setResult(formatNumber(pVal));
  };

  // Markup Function: Selling Price = Cost / (1 - Markup%)
  const handleMarkup = () => {
    playSound('beep');
    const val = evaluateExpression(expression || result.replace(/,/g, ''));
    if (!val) return;
    // Prompt or default 20% markup
    const markupRate = 20;
    const finalPrice = val * (1 + markupRate / 100);
    setPrevCalc(`${val} + MU (${markupRate}%) = ${formatNumber(finalPrice)}`);
    setResult(formatNumber(finalPrice));
    setExpression('');
    saveCalculation({
      expression: `${val} + ${markupRate}% MU`,
      result: formatNumber(finalPrice),
      calculationType: 'Markup',
      category: 'Markup',
      isFavorite: false,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Grand Total recall
  const handleRecallGT = () => {
    playSound('beep');
    setResult(formatNumber(grandTotal));
    setPrevCalc(`GT Total (${gtCount} items) = ${formatNumber(grandTotal)}`);
  };

  // Memory M+, M-, MRC
  const handleMemoryAdd = () => {
    playSound('beep');
    const val = evaluateExpression(expression || result.replace(/,/g, ''));
    setMemory((prev) => prev + val);
    setPrevCalc(`M+ ${val}`);
  };

  const handleMemorySubtract = () => {
    playSound('beep');
    const val = evaluateExpression(expression || result.replace(/,/g, ''));
    setMemory((prev) => prev - val);
    setPrevCalc(`M- ${val}`);
  };

  const handleMemoryRecallClear = () => {
    playSound('beep');
    setResult(formatNumber(memory));
    setPrevCalc(`Memory MRC: ${formatNumber(memory)}`);
  };

  // GST Add: Amount + (Amount * GST%)
  const handleAddGst = (rate: number) => {
    playSound('beep');
    const base = evaluateExpression(expression || result.replace(/,/g, ''));
    if (!base) return;
    const tax = (base * rate) / 100;
    const totalWithTax = base + tax;
    setPrevCalc(`${base} + ${rate}% GST (${formatNumber(tax)})`);
    setResult(formatNumber(totalWithTax));
    setExpression('');
    setShowGstMenu(false);
    saveCalculation({
      expression: `${base} + ${rate}% GST`,
      result: formatNumber(totalWithTax),
      calculationType: 'GST Addition',
      category: 'GST',
      isFavorite: false,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // GST Remove: Reverse calculate base price: Total / (1 + GST%)
  const handleRemoveGst = (rate: number) => {
    playSound('beep');
    const gross = evaluateExpression(expression || result.replace(/,/g, ''));
    if (!gross) return;
    const base = gross / (1 + rate / 100);
    const taxRemoved = gross - base;
    setPrevCalc(`${gross} - ${rate}% Reverse GST (${formatNumber(taxRemoved)})`);
    setResult(formatNumber(base));
    setExpression('');
    setShowGstMenu(false);
    saveCalculation({
      expression: `${gross} - ${rate}% Reverse GST`,
      result: formatNumber(base),
      calculationType: 'GST Removal',
      category: 'GST',
      isFavorite: false,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Convert calculation or tape to Bill items
  const handleConvertToBillClick = () => {
    playSound('cash');
    const num = parseFloat(result.replace(/,/g, '')) || evaluateExpression(expression);
    if (num <= 0 && calcTape.length === 0) return;

    if (calcTape.length > 0) {
      const items = calcTape.map((t, idx) => ({
        name: `Item #${idx + 1} (${t.text})`,
        quantity: 1,
        price: t.val,
      }));
      onConvertToBill(items);
    } else {
      onConvertToBill([
        {
          name: 'Calculation Item',
          quantity: 1,
          price: num,
        },
      ]);
    }
  };

  const handleSaveToCustomerClick = () => {
    playSound('beep');
    const num = parseFloat(result.replace(/,/g, '')) || evaluateExpression(expression);
    if (num <= 0) return;
    onSaveToCustomer(num, `Smart Calculator: ${prevCalc || expression || num}`);
  };

  const handleQuickAddProduct = (prod: any) => {
    playSound('beep');
    // If expression is just a number, treat as quantity multiplier, e.g. "2 * Sugar"
    const currentNum = parseFloat(expression);
    if (!isNaN(currentNum) && currentNum > 0 && !expression.includes(' ')) {
      const lineTotal = currentNum * prod.retailPrice;
      setCalcTape((prev) => [
        ...prev,
        { text: `${currentNum} × ${prod.name}`, val: lineTotal },
      ]);
      setGrandTotal((prev) => prev + lineTotal);
      setResult(formatNumber(lineTotal));
      setPrevCalc(`${currentNum} × ${prod.name} = ${formatNumber(lineTotal)}`);
      setExpression('');
    } else {
      setCalcTape((prev) => [
        ...prev,
        { text: `1 × ${prod.name}`, val: prod.retailPrice },
      ]);
      setGrandTotal((prev) => prev + prod.retailPrice);
      setResult(formatNumber(prod.retailPrice));
      setPrevCalc(`1 × ${prod.name} = ${formatNumber(prod.retailPrice)}`);
    }
  };

  const favoriteProducts = products.filter((p) => p.isFavorite).slice(0, 8);

  const filteredHistory = calculations.filter((item) => {
    const matchCat = historyFilterCategory === 'all' || item.category === historyFilterCategory;
    const matchSearch =
      item.expression.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.result.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(historySearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Business Calculator</h1>
            <p className="text-xs text-gray-500">
              Touch, mouse & keyboard enabled • Multi-function tape & one-click billing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Tag Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-gray-500">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              aria-label="Calculation Category"
              className="text-xs font-bold text-gray-800 bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              <option value="General">General</option>
              <option value="Shopping">Shopping</option>
              <option value="Customer">Customer</option>
              <option value="GST">GST</option>
              <option value="Discount">Discount</option>
              <option value="Markup">Markup</option>
              <option value="Profit">Profit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
          >
            <History className="w-4 h-4" />
            History ({calculations.length})
          </button>
        </div>
      </div>

      {/* Quick Add Product Favorites Bar */}
      {favoriteProducts.length > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Product Tap (Tip: Type quantity first like 2 or 5, then tap product)
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {currentBusiness.currencySymbol}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {favoriteProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickAddProduct(p)}
                className="shrink-0 flex items-center gap-2 bg-white hover:bg-emerald-600 hover:text-white text-gray-800 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs border border-emerald-200/60 transition group active:scale-95"
              >
                <span>{p.name}</span>
                <span className="bg-emerald-100 group-hover:bg-white group-hover:text-emerald-700 text-emerald-800 text-[11px] px-1.5 py-0.5 rounded-md font-bold">
                  {currentBusiness.currencySymbol}{p.retailPrice}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Calculator Body + Active Tape / Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator Frame */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
          {/* LCD Screen Display */}
          <div className="bg-slate-900 rounded-2xl p-5 mb-5 text-right shadow-inner border border-slate-800 relative overflow-hidden">
            {/* Status indicators */}
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
              <div className="flex items-center gap-2">
                {memory !== 0 && (
                  <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    M: {formatNumber(memory)}
                  </span>
                )}
                {grandTotal !== 0 && (
                  <span className="bg-amber-950 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    GT: {formatNumber(grandTotal)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-sans tracking-wide">
                [{category}] {prevCalc && <span>• Last: {prevCalc}</span>}
              </div>
            </div>

            {/* Expression line */}
            <div className="text-slate-400 font-mono text-sm sm:text-base min-h-[1.5rem] overflow-x-auto whitespace-nowrap">
              {expression || ' '}
            </div>

            {/* Main Result display */}
            <div className="text-white font-mono text-3xl sm:text-5xl font-bold tracking-tight mt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
              {result}
            </div>
          </div>

          {/* Action Convert Buttons (High priority bar) */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={handleConvertToBillClick}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-bold shadow-md shadow-emerald-600/20 text-sm transition"
            >
              <Receipt className="w-5 h-5" />
              Convert to Bill
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={handleSaveToCustomerClick}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-bold shadow-md shadow-blue-600/20 text-sm transition"
            >
              <UserCheck className="w-5 h-5" />
              Save to Customer
            </button>
          </div>

          {/* Keypad Grid */}
          <div className="space-y-3">
            {/* Row 1: Business Functions */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              <button
                onClick={handleRecallGT}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition"
                title="Grand Total"
              >
                GT
              </button>
              <button
                onClick={handleMarkup}
                className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition"
                title="Markup 20%"
              >
                MU
              </button>
              <button
                onClick={handleMemoryRecallClear}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition"
                title="Memory Recall"
              >
                MRC
              </button>
              <button
                onClick={handleMemorySubtract}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition"
                title="Memory Minus"
              >
                M-
              </button>
              <button
                onClick={handleMemoryAdd}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition"
                title="Memory Plus"
              >
                M+
              </button>
            </div>

            {/* Row 2: GST & Clear ops */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              <div className="relative col-span-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowGstMenu(!showGstMenu)}
                  className="bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <Percent className="w-3.5 h-3.5" />
                  +GST
                </button>
                <button
                  onClick={() => handleRemoveGst(gstRate)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold py-3 rounded-xl text-xs sm:text-sm active:scale-95 transition"
                >
                  -GST
                </button>

                {/* GST Quick Flyout */}
                {showGstMenu && (
                  <div className="absolute top-12 left-0 z-20 bg-white border border-gray-200 shadow-xl rounded-2xl p-3 w-56 space-y-2">
                    <div className="text-xs font-bold text-gray-700">Select Tax Rate</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5, 12, 18, 28].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            setGstRate(rate);
                            handleAddGst(rate);
                          }}
                          className="bg-gray-100 hover:bg-emerald-600 hover:text-white py-1.5 rounded-lg text-xs font-bold text-gray-800 transition"
                        >
                          +{rate}%
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                      <input
                        type="number"
                        placeholder="Custom %"
                        value={gstRate}
                        onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-1.5 border border-gray-200 rounded-lg"
                      />
                      <button
                        onClick={() => handleAddGst(gstRate)}
                        className="bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePercentage}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-sm sm:text-base active:scale-95 transition"
              >
                %
              </button>
              <button
                onClick={handleBackspace}
                className="bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold py-3 rounded-xl text-sm sm:text-base active:scale-95 transition"
                title="Backspace"
              >
                ⌫
              </button>
              <button
                onClick={handleAllClear}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl text-sm sm:text-base active:scale-95 transition shadow-xs"
              >
                AC
              </button>
            </div>

            {/* Row 3: 7, 8, 9, ÷, C */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              <button
                onClick={() => handleDigit('7')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                7
              </button>
              <button
                onClick={() => handleDigit('8')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                8
              </button>
              <button
                onClick={() => handleDigit('9')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                9
              </button>
              <button
                onClick={() => handleOperator('÷')}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                ÷
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3.5 rounded-2xl active:scale-95 transition"
              >
                C
              </button>
            </div>

            {/* Row 4: 4, 5, 6, ×, ± */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              <button
                onClick={() => handleDigit('4')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                4
              </button>
              <button
                onClick={() => handleDigit('5')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                5
              </button>
              <button
                onClick={() => handleDigit('6')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                6
              </button>
              <button
                onClick={() => handleOperator('×')}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                ×
              </button>
              <button
                onClick={() => {
                  playSound('beep');
                  if (expression.startsWith('-')) setExpression(expression.slice(1));
                  else setExpression('-' + expression);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3.5 rounded-2xl active:scale-95 transition"
              >
                ±
              </button>
            </div>

            {/* Row 5: 1, 2, 3, -, 00 */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              <button
                onClick={() => handleDigit('1')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                1
              </button>
              <button
                onClick={() => handleDigit('2')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                2
              </button>
              <button
                onClick={() => handleDigit('3')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                3
              </button>
              <button
                onClick={() => handleOperator('-')}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                -
              </button>
              <button
                onClick={() => handleDigit('00')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-2xl active:scale-95 transition"
              >
                00
              </button>
            </div>

            {/* Row 6: 0, ., +, = (Double width) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              <button
                onClick={() => handleDigit('0')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                0
              </button>
              <button
                onClick={() => handleDigit('.')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                .
              </button>
              <button
                onClick={() => handleOperator('+')}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-lg sm:text-xl py-3.5 rounded-2xl active:scale-95 transition"
              >
                +
              </button>
              <button
                onClick={handleCalculate}
                className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xl py-3.5 rounded-2xl active:scale-95 transition shadow-md shadow-emerald-600/30"
              >
                =
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Virtual Paper Tape & Live Slip */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-gray-800">Calculator Tape</span>
              </div>
              {calcTape.length > 0 && (
                <button
                  onClick={() => setCalcTape([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Tape
                </button>
              )}
            </div>

            {/* Tape Items list */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1 scrollbar-thin">
              {calcTape.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 p-4">
                  <Calculator className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">Tape is empty</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Calculate or tap quick products to build your bill tape
                  </p>
                </div>
              ) : (
                calcTape.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">{item.text}</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      {currentBusiness.currencySymbol}{formatNumber(item.val)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Tape Summary & Quick Bill Action */}
            <div className="border-t border-dashed border-gray-200 pt-3 mt-3 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Items in Tape:</span>
                <span className="font-bold text-gray-800">{calcTape.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Tape Total:</span>
                <span className="font-mono text-emerald-700 text-base">
                  {currentBusiness.currencySymbol}
                  {formatNumber(calcTape.reduce((acc, curr) => acc + curr.val, 0))}
                </span>
              </div>

              <button
                disabled={calcTape.length === 0}
                onClick={handleConvertToBillClick}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                Bill All Tape Items ({calcTape.length})
              </button>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Pro Shopkeeper Shortcuts
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              Press <b>Enter</b> for equals, <b>Esc</b> to clear, <b>F2</b> for Quick Sale, or click <b>Convert to Bill</b> to immediately add customer, print invoice, and deduct stock.
            </p>
          </div>
        </div>
      </div>

      {/* Calculation History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base">Calculation History</h3>
              </div>
              <div className="flex items-center gap-2">
                {calculations.length > 0 && (
                  <button
                    onClick={clearCalculations}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search history by expression, result..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={historyFilterCategory}
                onChange={(e) => setHistoryFilterCategory(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="Shopping">Shopping</option>
                <option value="Customer">Customer</option>
                <option value="GST">GST</option>
                <option value="Discount">Discount</option>
                <option value="Markup">Markup</option>
                <option value="Profit">Profit</option>
              </select>
            </div>

            {/* Records List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No calculations found in history.
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 hover:border-emerald-300 rounded-2xl shadow-2xs transition group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-600">{item.expression}</span>
                        <span className="text-xs text-gray-400">=</span>
                        <span className="text-sm font-bold font-mono text-emerald-700">
                          {item.result}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                          {item.category}
                        </span>
                        <span>{item.date}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setExpression(item.expression);
                          setResult(item.result);
                          setShowHistoryModal(false);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition"
                      >
                        Reuse
                      </button>
                      <button
                        onClick={() => toggleFavoriteCalculation(item.id)}
                        className={`p-1.5 rounded-lg transition ${
                          item.isFavorite
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-gray-400 hover:text-amber-500'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => deleteCalculation(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useRef } from 'react';
import { Invoice, BusinessSettings } from '../../types';
import { Printer, Share2, Download, Check, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';

interface ThermalReceiptProps {
  invoice: Invoice;
  business: BusinessSettings;
  onClose?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, business, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const phone = invoice.customerPhone ? invoice.customerPhone.replace(/[^\d]/g, '') : '';
    const itemsText = invoice.items
      .map(
        (i) =>
          `• ${i.productName} (${i.quantity} ${i.unit}) @ ${business.currencySymbol}${i.unitPrice} = ${business.currencySymbol}${i.total}`
      )
      .join('\n');

    const message = `🧾 *${business.name.toUpperCase()}*\n` +
      `Invoice #: *${invoice.invoiceNumber}*\n` +
      `Date: ${invoice.date}\n` +
      `Customer: *${invoice.customerName}*\n\n` +
      `*PURCHASE DETAILS:*\n${itemsText}\n\n` +
      `Subtotal: ${business.currencySymbol}${invoice.subtotal}\n` +
      (invoice.billDiscount > 0 ? `Discount: -${business.currencySymbol}${invoice.billDiscount}\n` : '') +
      (invoice.taxTotal > 0 ? `Tax/GST: +${business.currencySymbol}${invoice.taxTotal}\n` : '') +
      `*GRAND TOTAL: ${business.currencySymbol}${invoice.grandTotal}*\n` +
      `*PAID: ${business.currencySymbol}${invoice.paidAmount}*\n` +
      (invoice.dueAmount > 0 ? `⚠️ *REMAINING DUE (Udhar): ${business.currencySymbol}${invoice.dueAmount}*\n` : 'Payment Status: PAID IN FULL ✅\n') +
      `\n_${business.receiptFooterNote || 'Thank you for your business!'}_`;

    const encoded = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="no-print flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp Bill
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-800 font-semibold px-3 py-1.5 rounded-lg border border-gray-200"
          >
            Close
          </button>
        )}
      </div>

      {/* Printable Thermal Receipt Box */}
      <div
        ref={receiptRef}
        className="printable-thermal bg-white p-6 rounded-2xl border border-gray-300 shadow-sm max-w-sm mx-auto font-mono text-xs text-gray-900 leading-tight"
        style={{ width: business.paperSize === '58mm' ? '240px' : '320px' }}
      >
        {/* Header */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
          <h2 className="text-base font-black tracking-tight">{business.name}</h2>
          <div className="text-[11px] text-gray-600 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{business.address}</span>
          </div>
          <div className="text-[11px] text-gray-600 flex items-center justify-center gap-1">
            <Phone className="w-3 h-3 shrink-0" />
            <span>{business.phone}</span>
          </div>
          {business.taxId && (
            <div className="text-[10px] text-gray-500">Tax Reg: {business.taxId}</div>
          )}
        </div>

        {/* Invoice Info */}
        <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold">INVOICE:</span>
            <span className="font-black">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{invoice.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-bold">{invoice.customerName}</span>
          </div>
          {invoice.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{invoice.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{invoice.cashierName}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-2.5 border-b border-dashed border-gray-400">
          <div className="flex justify-between font-bold pb-1 text-[11px]">
            <span>Item / Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-gray-900">{item.productName}</div>
                <div className="flex justify-between text-gray-700 text-[11px]">
                  <span>
                    {item.quantity} {item.unit} × {business.currencySymbol}{item.unitPrice}
                  </span>
                  <span className="font-bold">
                    {business.currencySymbol}{item.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{business.currencySymbol}{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.billDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span>-{business.currencySymbol}{invoice.billDiscount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxTotal > 0 && (
            <div className="flex justify-between">
              <span>Tax / GST:</span>
              <span>+{business.currencySymbol}{invoice.taxTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
            <span>TOTAL:</span>
            <span>{business.currencySymbol}{invoice.grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-1">
            <span>Paid ({invoice.paymentMethod.toUpperCase()}):</span>
            <span>{business.currencySymbol}{invoice.paidAmount.toFixed(2)}</span>
          </div>
          {invoice.dueAmount > 0 && (
            <div className="flex justify-between font-black text-rose-700 pt-0.5">
              <span>BALANCE DUE (Udhar):</span>
              <span>{business.currencySymbol}{invoice.dueAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* QR or UPI note */}
        {business.paymentIdentifier && invoice.dueAmount > 0 && (
          <div className="py-2 text-center text-[10px] bg-gray-50 rounded p-1 border border-gray-200 mt-2">
            <div>Pay remaining via:</div>
            <div className="font-bold font-sans">{business.paymentIdentifier}</div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center pt-3 text-[10px] text-gray-500 space-y-1">
          <p>{business.receiptFooterNote}</p>
          <p className="text-[9px] text-gray-400">Powered by SmartBiz System</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { QrCode, X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { BusinessSettings } from '../../types';

interface QrPaymentModalProps {
  amount: number;
  invoiceNumber?: string;
  business: BusinessSettings;
  isOpen: boolean;
  onClose: () => void;
  onPaymentReceived?: () => void;
}

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  amount,
  invoiceNumber,
  business,
  isOpen,
  onClose,
  onPaymentReceived,
}) => {
  if (!isOpen) return null;

  const paymentId = business.paymentIdentifier || 'smartbiz-pay@bank';
  
  // Format standard payment payload
  const qrData = `upi://pay?pa=${encodeURIComponent(paymentId)}&pn=${encodeURIComponent(
    business.name
  )}&am=${amount}&cu=${business.currency || 'PKR'}&tn=${encodeURIComponent(
    `Bill ${invoiceNumber || 'Payment'}`
  )}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrData
  )}&bgcolor=ffffff&color=0f172a&margin=2`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden text-center flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Instant QR Payment</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex flex-col items-center">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {business.name}
          </div>

          <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl">
            <div className="text-xs">Exact Payable Amount:</div>
            <div className="text-2xl font-black font-mono mt-0.5">
              {business.currencySymbol}{amount.toLocaleString()}
            </div>
          </div>

          {/* QR Container */}
          <div className="p-3 bg-white border-2 border-dashed border-emerald-400 rounded-3xl shadow-sm">
            <img
              src={qrImageUrl}
              alt="Payment QR Code"
              className="w-48 h-48 object-contain rounded-xl"
            />
          </div>

          {/* Identifier detail */}
          <div className="w-full bg-gray-50 p-3 rounded-2xl border border-gray-100 text-left space-y-1">
            <div className="text-[11px] text-gray-500 font-medium">Merchant ID / Account:</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-gray-900 truncate">
                {paymentId}
              </span>
              <button
                onClick={copyToClipboard}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Customer can scan with Raast, EasyPaisa, JazzCash, Google Pay, or Bank app.
          </div>

          {/* Action buttons */}
          <div className="w-full grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onPaymentReceived) onPaymentReceived();
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

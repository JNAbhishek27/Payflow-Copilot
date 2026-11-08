import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Quote } from '../types';

interface PayPalCheckoutModalProps {
  quote: Quote;
  onClose: () => void;
  onPaymentSuccess: (transaction: any) => void;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  quote,
  onClose,
  onPaymentSuccess,
}) => {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(quote.paypal_order_id || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<any | null>(null);

  // Step 1: Request backend to create/verify PayPal Orders API v2 order
  const handleInitiatePayPalOrder = async () => {
    setIsCreatingOrder(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quote.id,
          idempotency_key: `IDEMP_FRONT_${quote.id}_${Date.now()}`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to initialize PayPal Sandbox order.');
      }

      const data = await res.json();
      setPaypalOrderId(data.paypal_order_id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with PayPal Sandbox backend.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Step 2: Customer approves in Sandbox; Backend executes verified capture
  const handleSimulateSandboxApprovalAndCapture = async () => {
    if (!paypalOrderId) return;
    setIsCapturing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypal_order_id: paypalOrderId,
          quote_id: quote.id,
          idempotency_key: `CAPTURE_${paypalOrderId}`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Capture rejected by PayPal Sandbox.');
      }

      const txResult = await res.json();
      setCompletedTx(txResult);
      onPaymentSuccess(txResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment capture failed.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">PayPal Sandbox Checkout</h3>
              <p className="text-[11px] text-slate-500 font-medium">Orders API v2 & Verified Capture</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs p-1"
          >
            ✕
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Invoice Number</span>
            <span className="font-mono font-bold text-slate-800">{quote.quote_number}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Client Recipient</span>
            <span className="font-semibold text-slate-800">{quote.customer_name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Items</span>
            <span className="text-slate-700">{quote.items.length} deliverables</span>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-900">Total Billed</span>
            <span className="font-mono text-base text-brand-600">${quote.total.toFixed(2)} {quote.currency}</span>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success confirmation */}
        {completedTx ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Payment Verified & Settled</h4>
              <p className="text-xs text-slate-500 mt-1">
                Transaction ID: <code className="font-mono text-emerald-600">{completedTx.transaction_id}</code>
              </p>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Capture ID: {completedTx.paypal_capture_id}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Return to Ledger
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Step 1: Create Order if not already created */}
            {!paypalOrderId ? (
              <button
                onClick={handleInitiatePayPalOrder}
                disabled={isCreatingOrder}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Communicating with Orders API v2...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Generate PayPal Sandbox Order (${quote.total.toFixed(2)})</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>PayPal Order Initialized</span>
                  </div>
                  <div className="font-mono text-[11px] text-indigo-700">
                    Order ID: {paypalOrderId}
                  </div>
                </div>

                {/* PayPal JavaScript SDK Checkout Button */}
                <button
                  onClick={handleSimulateSandboxApprovalAndCapture}
                  disabled={isCapturing}
                  className="w-full py-3.5 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying capture on backend...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-sm italic">PayPal</span>
                      <span>Checkout as Sandbox Buyer</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Payments captured server-side with idempotency protection</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


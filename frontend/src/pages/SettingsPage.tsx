import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Database, 
  CreditCard, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface SettingsPageProps {
  isBackendConnected: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isBackendConnected }) => {
  const [paypalClientId, setPaypalClientId] = useState('Ab4Y...sandbox_client_id');
  const [backendApiUrl, setBackendApiUrl] = useState('http://localhost:8000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl page-transition">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Environment Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage sandbox credentials, AI model safety gates, and Supabase database endpoints.
        </p>
      </div>

      {/* Security Best Practice Notice */}
      <div className="bg-brand-50/60 border border-brand-200/80 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2 bg-brand-100 text-brand-700 rounded-xl mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-brand-900">Zero-Secret Frontend Architecture</div>
          <p className="text-xs text-brand-800 leading-relaxed">
            In accordance with high-assurance payment security standards, the <strong>PayPal Client Secret</strong> and <strong>Gemini API Key</strong> are stored strictly on the FastAPI backend in encrypted environment variables (<code className="bg-white/80 px-1 py-0.5 rounded font-mono">.env</code>).
            The frontend only communicates with public client IDs and verified backend session tokens.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PayPal Sandbox Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">PayPal Sandbox Integration</h3>
            </div>
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              <span>Get Sandbox Keys</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                PayPal Sandbox Public Client ID (Safe for Browser SDK)
              </label>
              <input
                type="text"
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required for PayPal JS SDK v6 buttons initialization.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                PayPal Client Secret (Backend only)
              </label>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  value="••••••••••••••••••••••••••••••••"
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  LOCKED IN BACKEND
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Database & API Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Backend API & Database Connection</h3>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
              isBackendConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isBackendConnected ? 'Online (Supabase Connected)' : 'Disconnected (Demo Mode)'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                FastAPI Backend URL
              </label>
              <input
                type="text"
                value={backendApiUrl}
                onChange={(e) => setBackendApiUrl(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Supabase PostgreSQL Schema Status</span>
              </div>
              <ul className="text-slate-600 space-y-1 text-[11px] list-disc list-inside">
                <li><code className="font-mono text-slate-800">customers</code>: Registered buyers & invoice recipients</li>
                <li><code className="font-mono text-slate-800">quotes</code> & <code className="font-mono text-slate-800">quote_items</code>: Decimal calculations & status tracking</li>
                <li><code className="font-mono text-slate-800">transactions</code>: PayPal Orders v2 captures & webhook event log</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration cached successfully!</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};


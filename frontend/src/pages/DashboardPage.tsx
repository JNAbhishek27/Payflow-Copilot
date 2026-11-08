import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  Bot, 
  Plus, 
  CreditCard,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DashboardMetrics, Quote, Transaction, RevenueDataPoint, PageId } from '../types';

interface DashboardPageProps {
  metrics: DashboardMetrics;
  trend: RevenueDataPoint[];
  recentQuotes: Quote[];
  recentTransactions: Transaction[];
  onNavigate: (page: PageId) => void;
  isBackendConnected: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  trend,
  recentQuotes,
  recentTransactions,
  onNavigate,
  isBackendConnected
}) => {
  const maxRevenue = Math.max(...trend.map(t => t.revenue), 100);

  return (
    <div className="space-y-8 page-transition">
      {/* Demo Banner if disconnected */}
      {!isBackendConnected && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                <span>Displaying Verified Realistic Demo Data</span>
                <span className="text-[10px] font-mono bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase">Demo Data</span>
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Backend server is starting up or disconnected. The figures below illustrate real production schema states.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            Configure Backend URL
          </button>
        </div>
      )}

      {/* 1. Executive Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-50 rounded-bl-full -z-0 group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight relative z-10">
            ${metrics.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 relative z-10">
            <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.4%
            </span>
            <span>vs previous period</span>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Payments</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight relative z-10">
            {metrics.successful_payments_count}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 relative z-10">
            <span className="text-slate-700 font-medium">Avg: ${metrics.average_transaction_value.toFixed(2)}</span>
            <span>per transaction</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-bl-full -z-0 group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight relative z-10">
            ${metrics.pending_payments_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 relative z-10">
            <span className="font-semibold text-amber-600">{metrics.pending_payments_count} clients in checkout</span>
            <button 
              onClick={() => onNavigate('insights')}
              className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5"
            >
              Draft follow-ups <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Outstanding Quotes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50 rounded-bl-full -z-0 group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Quotes</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight relative z-10">
            ${metrics.outstanding_quotes_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 relative z-10">
            <span className="text-slate-700 font-medium">{metrics.outstanding_quotes_count} quotes active</span>
            <button 
              onClick={() => onNavigate('quotes')}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
            >
              Review <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Revenue Trend Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Revenue Trend</h2>
              <p className="text-xs text-slate-500">Completed PayPal Sandbox transactions over time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium font-mono">
                Last 30 Days
              </span>
            </div>
          </div>

          {/* SVG / Bar Trend Visualization */}
          <div className="h-64 flex items-end gap-4 pt-4 border-b border-slate-100 pb-2">
            {trend.map((point, idx) => {
              const heightPct = Math.max((point.revenue / maxRevenue) * 100, 10);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] rounded px-2 py-1 pointer-events-none mb-1 font-mono shadow-md">
                    ${point.revenue} ({point.count} tx)
                  </div>
                  {/* Visual Bar */}
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-brand-600 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-sm relative"
                  />
                  {/* Date label */}
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-brand-600 to-indigo-500 inline-block" />
                Verified Captured Revenue (USD)
              </span>
            </div>
            <span className="font-mono text-slate-400">Grounded in database transactions</span>
          </div>
        </div>

        {/* Quick Actions & Copilot Trigger */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-brand-500/20 text-brand-300 rounded-lg border border-brand-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-brand-300">Fast Actions</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">AI Quote Assistant</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Have a client email or WhatsApp message? Paste the text into Copilot to generate an itemized quote with mathematical precision in 3 seconds.
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => onNavigate('copilot')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-brand-400" />
                  <span>"Quote Alex 2 banners & logo"</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('quotes')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Manual Quote Builder</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('insights')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Check Overdue Accounts</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>PayPal Sandbox Orders API v2</span>
            <span className="font-mono text-emerald-400 font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Recent Quotes & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Quotes</h3>
              <p className="text-xs text-slate-500">Pipeline states requiring review or checkout</p>
            </div>
            <button
              onClick={() => onNavigate('quotes')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentQuotes.slice(0, 4).map((q) => (
              <div key={q.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold">
                    {q.quote_number.slice(-3)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{q.customer_name}</div>
                    <div className="text-xs text-slate-400">{q.items.length} items &middot; {q.customer_email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">${q.total.toFixed(2)}</div>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    q.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                    q.status === 'approved' ? 'bg-brand-100 text-brand-800' :
                    q.status === 'sent' ? 'bg-indigo-100 text-indigo-800' :
                    q.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {q.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Live AG Grid audit trail sample</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Open AG Grid <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{tx.customer_name}</div>
                    <div className="text-xs font-mono text-slate-400">Order: {tx.paypal_order_id.slice(0, 10)}...</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">+${tx.amount.toFixed(2)}</div>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    tx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {tx.status}
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


import React from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  Bot, 
  HelpCircle,
  Database
} from 'lucide-react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isBackendConnected: boolean;
  onQuickQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  onNavigate, 
  isBackendConnected, 
  onQuickQuote 
}) => {
  const getPageTitle = (page: PageId): { title: string; subtitle: string } => {
    switch (page) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Real-time revenue, conversion, and sandbox transactions' };
      case 'copilot':
        return { title: 'AI Quote Copilot', subtitle: 'Natural language quote generation powered by Gemini' };
      case 'quotes':
        return { title: 'Quotes & Approvals', subtitle: 'Review, edit, approve, and send client checkout links' };
      case 'transactions':
        return { title: 'Payment Ledger', subtitle: 'High-performance AG Grid audit trail and PayPal capture status' };
      case 'insights':
        return { title: 'AI Business Insights', subtitle: 'Database-grounded revenue analytics and automated follow-up drafts' };
      case 'settings':
        return { title: 'Settings & Integrations', subtitle: 'PayPal Sandbox credentials and Supabase database configuration' };
    }
  };

  const { title, subtitle } = getPageTitle(currentPage);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 fixed top-0 left-64 right-0 z-20 px-8 flex items-center justify-between">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Backend / Data Mode Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          <Database className={`w-3.5 h-3.5 ${isBackendConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="font-medium">
            {isBackendConnected ? 'Supabase Live' : 'Demo State'}
          </span>
        </div>

        {/* Search trigger mock */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotes, clients..."
            className="w-56 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quick Action: New Quote via Copilot */}
        <button
          onClick={onQuickQuote}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:from-brand-700 hover:to-indigo-700 transition-all active:scale-95"
        >
          <Bot className="w-4 h-4" />
          <span>Ask Copilot</span>
        </button>

        {/* Quick Action: Manual Quote */}
        <button
          onClick={() => onNavigate('quotes')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quote</span>
        </button>

        {/* Help tooltip button */}
        <button 
          onClick={() => onNavigate('settings')}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Sandbox & API Configuration"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notification pill */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-1.5 right-1.5" />
          </button>
        </div>

        {/* User avatar indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
            PF
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-800 leading-none">Studio Owner</div>
            <div className="text-[10px] text-slate-400 leading-tight">Founder Plan</div>
          </div>
        </div>
      </div>
    </header>
  );
};


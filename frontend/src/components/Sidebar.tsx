import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  CreditCard, 
  Sparkles, 
  Settings, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isBackendConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isBackendConnected }) => {
  const navItems: Array<{ id: PageId; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-5 h-5" />, badge: 'AI Agent' },
    { id: 'quotes', label: 'Quotes & Approvals', icon: <FileText className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard className="w-5 h-5" />, badge: 'AG Grid' },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings & Keys', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 font-black text-lg">
            P
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              PayFlow <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono font-medium border border-brand-500/30">Copilot</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Quote-to-Payment AI</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform
        </div>

        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Environment / System Status Pill */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="rounded-xl bg-slate-850/80 p-3 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              Backend API
            </span>
            <span className={`font-mono text-[11px] ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400 font-medium'}`}>
              {isBackendConnected ? 'Connected' : 'Offline Mode'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              PayPal Sandbox
            </span>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono border border-brand-500/30">
              v2 Orders
            </span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
          >
            <span>PayPal Developer Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};


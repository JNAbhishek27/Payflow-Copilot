import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CopilotPage } from './pages/CopilotPage';
import { QuotesPage } from './pages/QuotesPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PageId, Quote, Transaction, DashboardMetrics } from './types';
import { 
  DEMO_METRICS, 
  DEMO_REVENUE_TREND, 
  DEMO_QUOTES, 
  DEMO_TRANSACTIONS 
} from './data/demoData';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEMO_METRICS);
  const [quotes, setQuotes] = useState<Quote[]>(DEMO_QUOTES);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setIsBackendConnected(true);
          // Load real quotes and metrics if available
          const quotesRes = await fetch('/api/quotes');
          if (quotesRes.ok) {
            const data = await quotesRes.json();
            if (data && data.length > 0) setQuotes(data);
          }
          const txRes = await fetch('/api/transactions');
          if (txRes.ok) {
            const txData = await txRes.json();
            if (txData && txData.length > 0) setTransactions(txData);
          }
        } else {
          setIsBackendConnected(false);
        }
      } catch (e) {
        setIsBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

  const handleApproveQuote = (quoteId: string) => {
    setQuotes(prev =>
      prev.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: 'approved',
            paypal_order_id: q.paypal_order_id || `ORDER_SANDBOX_${Math.floor(100000 + Math.random() * 900000)}`
          };
        }
        return q;
      })
    );
  };

  const handleUpdateQuote = (updated: Quote) => {
    setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
  };

  const handleCreateQuote = (newQuote: Quote) => {
    setQuotes(prev => [newQuote, ...prev]);
  };

  const handleQuoteApprovedFromCopilot = (newQuote: Quote) => {
    setQuotes(prev => [newQuote, ...prev]);
    setCurrentPage('quotes');
  };

  const handlePaymentSuccess = (tx: any) => {
    // Update quote status in state
    setQuotes(prev => prev.map(q => {
      if (q.id === tx.quote_id) {
        return { ...q, status: 'paid', paypal_order_id: tx.paypal_order_id };
      }
      return q;
    }));

    // Add new completed transaction to ledger
    const newTx: Transaction = {
      id: tx.transaction_id,
      quote_id: tx.quote_id,
      paypal_order_id: tx.paypal_order_id,
      paypal_capture_id: tx.paypal_capture_id,
      customer_name: tx.customer_name,
      customer_email: tx.customer_email,
      amount: tx.amount,
      currency: tx.currency,
      status: 'completed',
      payment_method: 'PayPal Sandbox',
      created_at: tx.completed_at || new Date().toISOString(),
      completed_at: tx.completed_at || new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    // Recalculate metrics
    setMetrics(prev => ({
      ...prev,
      total_revenue: prev.total_revenue + tx.amount,
      successful_payments_count: prev.successful_payments_count + 1
    }));
  };

  const handleRefreshTransactions = async () => {
    if (isBackendConnected) {
      try {
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isBackendConnected={isBackendConnected}
      />

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isBackendConnected={isBackendConnected}
          onQuickQuote={() => setCurrentPage('copilot')}
        />

        {/* Page Body Viewport */}
        <main className="flex-1 pt-24 px-8 pb-12 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage 
              metrics={metrics}
              trend={DEMO_REVENUE_TREND}
              recentQuotes={quotes}
              recentTransactions={transactions}
              onNavigate={setCurrentPage}
              isBackendConnected={isBackendConnected}
            />
          )}

          {currentPage === 'copilot' && (
            <CopilotPage 
              onQuoteApprovedToPipeline={handleQuoteApprovedFromCopilot}
              isBackendConnected={isBackendConnected}
            />
          )}

          {currentPage === 'quotes' && (
            <QuotesPage 
              quotes={quotes}
              onApproveQuote={handleApproveQuote}
              onUpdateQuote={handleUpdateQuote}
              onCreateQuote={handleCreateQuote}
              onPaymentSuccess={handlePaymentSuccess}
              isBackendConnected={isBackendConnected}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage 
              transactions={transactions}
              onRefresh={handleRefreshTransactions}
              isBackendConnected={isBackendConnected}
            />
          )}

          {currentPage === 'insights' && (
            <InsightsPage 
              metrics={metrics}
              isBackendConnected={isBackendConnected}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage 
              isBackendConnected={isBackendConnected}
            />
          )}
        </main>
      </div>
    </div>
  );
};


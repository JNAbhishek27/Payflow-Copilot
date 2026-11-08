import React, { useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ColDef, 
  ModuleRegistry, 
  AllCommunityModule 
} from 'ag-grid-community';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

import { 
  Search, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ShieldCheck,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsPageProps {
  transactions: Transaction[];
  onRefresh: () => void;
  isBackendConnected: boolean;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onRefresh,
  isBackendConnected
}) => {
  const [quickFilterText, setQuickFilterText] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const gridRef = useRef<AgGridReact<Transaction>>(null);

  // Status badge renderer
  const StatusCellRenderer = (params: any) => {
    const status = params.value as string;
    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    let icon = <Clock className="w-3 h-3 text-slate-500" />;

    if (status === 'completed') {
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
    } else if (status === 'pending') {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      icon = <Clock className="w-3 h-3 text-amber-600" />;
    } else if (status === 'denied' || status === 'failed') {
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
      icon = <XCircle className="w-3 h-3 text-rose-600" />;
    }

    return (
      <div className="flex items-center h-full">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass} uppercase tracking-wider`}>
          {icon}
          <span>{status}</span>
        </span>
      </div>
    );
  };

  // Amount column renderer
  const AmountCellRenderer = (params: any) => {
    const isCompleted = params.data?.status === 'completed';
    return (
      <div className="flex items-center justify-end h-full font-mono font-bold">
        <span className={isCompleted ? 'text-slate-900' : 'text-slate-500'}>
          ${parseFloat(params.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {params.data?.currency || 'USD'}
        </span>
      </div>
    );
  };

  // Action / View details cell renderer
  const ActionCellRenderer = (params: any) => {
    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={() => setSelectedTx(params.data)}
          className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    );
  };

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef<Transaction>[]>(() => [
    {
      field: 'id',
      headerName: 'Transaction ID',
      width: 170,
      cellClass: 'font-mono text-xs font-semibold text-brand-600',
      pinned: 'left',
      filter: 'agTextColumnFilter'
    },
    {
      field: 'quote_id',
      headerName: 'Quote ID',
      width: 140,
      cellClass: 'font-mono text-xs text-slate-700 font-medium',
      filter: 'agTextColumnFilter'
    },
    {
      field: 'customer_name',
      headerName: 'Customer & Contact',
      flex: 1,
      minWidth: 180,
      cellRenderer: (params: any) => (
        <div className="flex flex-col justify-center h-full">
          <span className="font-semibold text-slate-900 leading-tight">{params.value}</span>
          <span className="text-[11px] text-slate-400 font-mono leading-tight">{params.data?.customer_email}</span>
        </div>
      ),
      filter: 'agTextColumnFilter'
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      cellRenderer: AmountCellRenderer,
      headerClass: 'ag-right-aligned-header',
      sortable: true,
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      cellRenderer: StatusCellRenderer,
      filter: 'agSetColumnFilter'
    },
    {
      field: 'payment_method',
      headerName: 'Channel',
      width: 170,
      cellClass: 'text-xs text-slate-600 font-medium',
      filter: true
    },
    {
      field: 'created_at',
      headerName: 'Timestamp',
      width: 170,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      sortable: true
    },
    {
      headerName: 'Audit',
      width: 110,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false
    }
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  // CSV Export utility
  const handleExportCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `payflow_ledger_${new Date().toISOString().slice(0, 10)}.csv`
      });
    }
  };

  const completedRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 page-transition">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Ledger & Audit Trail</h2>
            <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 font-mono px-2 py-0.5 rounded-full font-semibold">
              AG Grid Community v33
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade transaction ledger synchronized with PayPal Sandbox Orders API v2 and Webhooks.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers, tx IDs..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 overflow-hidden">
        <div className="h-[560px] w-full ag-theme-quartz">
          <AgGridReact<Transaction>
            ref={gridRef}
            rowData={transactions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            quickFilterText={quickFilterText}
            rowHeight={52}
            headerHeight={44}
            animateRows={true}
            onRowClicked={(e) => {
              if (e.data) setSelectedTx(e.data);
            }}
          />
        </div>

        {/* Footer Summary Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified against Supabase PostgreSQL ledger & PayPal Orders v2 captures.</span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <span>Settled Total: <strong className="text-slate-900">${completedRevenue.toFixed(2)} USD</strong></span>
            <span>Ledger Entries: <strong className="text-slate-900">{transactions.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Transaction Audit Record</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quote ID</span>
                  <span className="font-mono text-slate-800">{selectedTx.quote_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal Order ID</span>
                  <span className="font-mono text-indigo-700">{selectedTx.paypal_order_id}</span>
                </div>
                {selectedTx.paypal_capture_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">PayPal Capture ID</span>
                    <span className="font-mono text-emerald-700 font-semibold">{selectedTx.paypal_capture_id}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name</span>
                  <span className="font-semibold text-slate-800">{selectedTx.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Email</span>
                  <span className="font-mono text-slate-700">{selectedTx.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Billed</span>
                  <span className="font-mono font-bold text-slate-900">${selectedTx.amount.toFixed(2)} {selectedTx.currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    selectedTx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    selectedTx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedTx.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel</span>
                  <span className="text-slate-700 font-medium">{selectedTx.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="font-mono text-slate-600">{new Date(selectedTx.created_at).toLocaleString()}</span>
                </div>
                {selectedTx.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed At</span>
                    <span className="font-mono text-emerald-600 font-semibold">{new Date(selectedTx.completed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

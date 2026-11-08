export type PageId = 'dashboard' | 'copilot' | 'quotes' | 'transactions' | 'insights' | 'settings';

export type QuoteStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'paid' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'denied' | 'refunded' | 'failed';

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: QuoteStatus;
  notes?: string;
  created_at: string;
  expires_at?: string;
  paypal_order_id?: string;
}

export interface Transaction {
  id: string;
  quote_id: string;
  paypal_order_id: string;
  paypal_capture_id?: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  created_at: string;
  completed_at?: string;
}

export interface DashboardMetrics {
  total_revenue: number;
  revenue_currency: string;
  successful_payments_count: number;
  pending_payments_count: number;
  pending_payments_amount: number;
  outstanding_quotes_count: number;
  outstanding_quotes_amount: number;
  average_transaction_value: number;
}

export interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
  count: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredQuote?: {
    customer_name?: string;
    customer_email?: string;
    currency: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>;
    subtotal: number;
    total: number;
    missing_fields?: string[];
    is_ready_for_approval: boolean;
  };
  suggestedPrompts?: string[];
}

export interface FollowUpReminder {
  id: string;
  quote_id: string;
  customer_name: string;
  customer_email: string;
  days_overdue: number;
  amount: number;
  currency: string;
  subject: string;
  message_body: string;
  status: 'draft' | 'copied' | 'sent';
}


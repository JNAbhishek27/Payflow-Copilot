import { DashboardMetrics, Quote, Transaction, RevenueDataPoint, FollowUpReminder } from '../types';

export const DEMO_METRICS: DashboardMetrics = {
  total_revenue: 12480.00,
  revenue_currency: 'USD',
  successful_payments_count: 42,
  pending_payments_count: 5,
  pending_payments_amount: 1720.00,
  outstanding_quotes_count: 8,
  outstanding_quotes_amount: 3850.00,
  average_transaction_value: 297.14
};

export const DEMO_REVENUE_TREND: RevenueDataPoint[] = [
  { date: '2026-10-01', label: 'Oct 1', revenue: 950, count: 3 },
  { date: '2026-10-06', label: 'Oct 6', revenue: 1420, count: 5 },
  { date: '2026-10-11', label: 'Oct 11', revenue: 890, count: 2 },
  { date: '2026-10-16', label: 'Oct 16', revenue: 2150, count: 7 },
  { date: '2026-10-21', label: 'Oct 21', revenue: 1800, count: 6 },
  { date: '2026-10-26', label: 'Oct 26', revenue: 2650, count: 9 },
  { date: '2026-10-31', label: 'Oct 31', revenue: 2620, count: 10 },
];

export const DEMO_QUOTES: Quote[] = [
  {
    id: 'q_01H1',
    quote_number: 'Q-2026-001',
    customer_name: 'Alex Rivera',
    customer_email: 'alex.rivera@designcraft.io',
    items: [
      { id: 'i1', description: 'Social Media Banner Design (High-res)', quantity: 2, unit_price: 35.00, subtotal: 70.00 },
      { id: 'i2', description: 'Brand Logo Vector Revision & SVG Export', quantity: 1, unit_price: 20.00, subtotal: 20.00 }
    ],
    subtotal: 90.00,
    tax: 0.00,
    discount: 0.00,
    total: 90.00,
    currency: 'USD',
    status: 'pending_approval',
    notes: 'Generated via AI Copilot from client chat request.',
    created_at: '2026-11-03T14:32:00Z',
    expires_at: '2026-11-17T14:32:00Z'
  },
  {
    id: 'q_01H2',
    quote_number: 'Q-2026-002',
    customer_name: 'Sarah Chen',
    customer_email: 'sarah@fintechpulse.co',
    items: [
      { id: 'i3', description: 'FastAPI Backend Architecture Review', quantity: 6, unit_price: 150.00, subtotal: 900.00 },
      { id: 'i4', description: 'Security Hardening Checklist & Documentation', quantity: 1, unit_price: 350.00, subtotal: 350.00 }
    ],
    subtotal: 1250.00,
    tax: 0.00,
    discount: 50.00,
    total: 1200.00,
    currency: 'USD',
    status: 'approved',
    notes: 'Approved by owner. Waiting for customer checkout via PayPal Sandbox.',
    created_at: '2026-11-02T10:15:00Z',
    expires_at: '2026-11-16T10:15:00Z',
    paypal_order_id: '8XX49102941092841'
  },
  {
    id: 'q_01H3',
    quote_number: 'Q-2026-003',
    customer_name: 'Marcus Brody',
    customer_email: 'm.brody@velocityventures.com',
    items: [
      { id: 'i5', description: 'SaaS Pitch Deck Financial Model Optimization', quantity: 1, unit_price: 650.00, subtotal: 650.00 },
      { id: 'i6', description: 'Interactive Dashboard Component (React/Vite)', quantity: 2, unit_price: 250.00, subtotal: 500.00 }
    ],
    subtotal: 1150.00,
    tax: 0.00,
    discount: 0.00,
    total: 1150.00,
    currency: 'USD',
    status: 'paid',
    notes: 'Payment verified via PayPal Sandbox capture.',
    created_at: '2026-10-28T09:00:00Z',
    expires_at: '2026-11-11T09:00:00Z',
    paypal_order_id: '5YY91823190283912'
  },
  {
    id: 'q_01H4',
    quote_number: 'Q-2026-004',
    customer_name: 'Elena Rostova',
    customer_email: 'elena@studioaurora.de',
    items: [
      { id: 'i7', description: 'Mobile App Wireframes & Interactive Prototype', quantity: 8, unit_price: 95.00, subtotal: 760.00 }
    ],
    subtotal: 760.00,
    tax: 0.00,
    discount: 0.00,
    total: 760.00,
    currency: 'USD',
    status: 'sent',
    notes: 'Customer opened link. Payment reminder queued.',
    created_at: '2026-10-25T16:40:00Z',
    expires_at: '2026-11-08T16:40:00Z',
    paypal_order_id: '3KK49182039128033'
  },
  {
    id: 'q_01H5',
    quote_number: 'Q-2026-005',
    customer_name: 'David Kim',
    customer_email: 'david@kimadvisory.net',
    items: [
      { id: 'i8', description: 'SEO Content Strategy & Copywriting (4 Articles)', quantity: 4, unit_price: 110.00, subtotal: 440.00 }
    ],
    subtotal: 440.00,
    tax: 0.00,
    discount: 0.00,
    total: 440.00,
    currency: 'USD',
    status: 'draft',
    notes: 'Draft quote being refined.',
    created_at: '2026-11-01T11:20:00Z'
  }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_88192A',
    quote_id: 'Q-2026-003',
    paypal_order_id: '5YY91823190283912',
    paypal_capture_id: 'CAP_88192A_SANDBOX',
    customer_name: 'Marcus Brody',
    customer_email: 'm.brody@velocityventures.com',
    amount: 1150.00,
    currency: 'USD',
    status: 'completed',
    payment_method: 'PayPal Balance',
    created_at: '2026-10-29T14:12:00Z',
    completed_at: '2026-10-29T14:13:22Z'
  },
  {
    id: 'tx_88191B',
    quote_id: 'Q-2026-000',
    paypal_order_id: '4YY71289123891029',
    paypal_capture_id: 'CAP_88191B_SANDBOX',
    customer_name: 'Sophia Patel',
    customer_email: 'spatel@cloudmatrix.org',
    amount: 540.00,
    currency: 'USD',
    status: 'completed',
    payment_method: 'Credit Card (via PayPal)',
    created_at: '2026-10-27T18:04:10Z',
    completed_at: '2026-10-27T18:05:00Z'
  },
  {
    id: 'tx_88190C',
    quote_id: 'Q-2026-002',
    paypal_order_id: '8XX49102941092841',
    customer_name: 'Sarah Chen',
    customer_email: 'sarah@fintechpulse.co',
    amount: 1200.00,
    currency: 'USD',
    status: 'pending',
    payment_method: 'PayPal Sandbox Checkout',
    created_at: '2026-11-02T10:20:00Z'
  },
  {
    id: 'tx_88189D',
    quote_id: 'Q-2026-004',
    paypal_order_id: '3KK49182039128033',
    customer_name: 'Elena Rostova',
    customer_email: 'elena@studioaurora.de',
    amount: 760.00,
    currency: 'USD',
    status: 'pending',
    payment_method: 'PayPal Sandbox Checkout',
    created_at: '2026-10-25T16:50:00Z'
  },
  {
    id: 'tx_88188E',
    quote_id: 'Q-2026-998',
    paypal_order_id: '1ZZ10293847561029',
    paypal_capture_id: 'CAP_88188E_SANDBOX',
    customer_name: 'Liam Gallagher',
    customer_email: 'liam@northsound.co.uk',
    amount: 320.00,
    currency: 'USD',
    status: 'completed',
    payment_method: 'PayPal Balance',
    created_at: '2026-10-22T08:15:30Z',
    completed_at: '2026-10-22T08:16:15Z'
  },
  {
    id: 'tx_88187F',
    quote_id: 'Q-2026-997',
    paypal_order_id: '9AA83920192837461',
    customer_name: 'Thomas Mueller',
    customer_email: 'thomas@bavaria-digital.de',
    amount: 880.00,
    currency: 'USD',
    status: 'denied',
    payment_method: 'Direct Debit',
    created_at: '2026-10-20T11:42:00Z'
  }
];

export const DEMO_FOLLOWUPS: FollowUpReminder[] = [
  {
    id: 'rem_1',
    quote_id: 'Q-2026-004',
    customer_name: 'Elena Rostova',
    customer_email: 'elena@studioaurora.de',
    days_overdue: 10,
    amount: 760.00,
    currency: 'USD',
    subject: 'Friendly follow-up regarding Quote Q-2026-004 (Mobile App Wireframes)',
    message_body: `Hi Elena,\n\nI hope you're having a productive week! I'm checking in on Quote Q-2026-004 for the Mobile App Wireframes & Interactive Prototype ($760.00 USD).\n\nThe secure PayPal Sandbox checkout link remains active. Let me know if you need any adjustments or if you have any questions.\n\nBest regards,\nPayFlow Copilot Team`,
    status: 'draft'
  },
  {
    id: 'rem_2',
    quote_id: 'Q-2026-002',
    customer_name: 'Sarah Chen',
    customer_email: 'sarah@fintechpulse.co',
    days_overdue: 2,
    amount: 1200.00,
    currency: 'USD',
    subject: 'Quote Q-2026-002 approval: FastAPI Architecture Review',
    message_body: `Hi Sarah,\n\nFollowing our review of the FastAPI backend architecture scope ($1,200.00 USD), the approved quote is ready for checkout. Please let me know once completed so we can immediately lock in our kickoff schedule.\n\nWarm regards,\nPayFlow Copilot Team`,
    status: 'draft'
  }
];


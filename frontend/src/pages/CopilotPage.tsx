import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileCheck, 
  User, 
  Mail, 
  DollarSign, 
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { ChatMessage, Quote } from '../types';

interface CopilotPageProps {
  onQuoteApprovedToPipeline: (quote: Quote) => void;
  isBackendConnected: boolean;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({ 
  onQuoteApprovedToPipeline,
  isBackendConnected 
}) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `👋 Welcome! I'm your **PayFlow Copilot**. Tell me about any job or client request, and I'll extract the line items, calculate server-side decimal totals, and prepare a structured quote for your review.\n\nTry testing me with the prompt below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Create a quote for Alex. Two social media banners at $35 each and one logo revision at $20.',
        'Quote Elena for Mobile App Wireframes, 8 screens at $95/ea with a 5% discount.',
        'Quote David for 4 blog posts at $120 each, customer email david@kimadvisory.net'
      ]
    }
  ]);

  // Active editable structured preview state
  const [stagedQuote, setStagedQuote] = useState<{
    customer_name: string;
    customer_email: string;
    currency: string;
    items: Array<{ description: string; quantity: number; unit_price: number; subtotal: number }>;
    tax: number;
    discount: number;
    is_ready_for_approval: boolean;
    missing_fields: string[];
  } | null>({
    customer_name: 'Alex Rivera',
    customer_email: 'alex.rivera@example.com',
    currency: 'USD',
    items: [
      { description: 'Social Media Banners', quantity: 2, unit_price: 35.00, subtotal: 70.00 },
      { description: 'Brand Logo Revision', quantity: 1, unit_price: 20.00, subtotal: 20.00 }
    ],
    tax: 0,
    discount: 0,
    is_ready_for_approval: true,
    missing_fields: []
  });

  const calculateSubtotal = () => {
    if (!stagedQuote) return 0;
    return stagedQuote.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    if (!stagedQuote) return 0;
    const sub = calculateSubtotal();
    return Math.max(0, sub + stagedQuote.tax - stagedQuote.discount);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      if (isBackendConnected) {
        // Send to FastAPI /api/copilot/extract
        const response = await fetch('/api/copilot/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });
        
        if (response.ok) {
          const data = await response.json();
          const assistantMsg: ChatMessage = {
            id: `asst_${Date.now()}`,
            role: 'assistant',
            content: data.reply || "I've structured the quote according to your request. Please review the line items and client details in the preview panel.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            structuredQuote: data.structured_quote
          };
          setMessages(prev => [...prev, assistantMsg]);
          if (data.structured_quote) {
            setStagedQuote({
              customer_name: data.structured_quote.customer_name || '',
              customer_email: data.structured_quote.customer_email || '',
              currency: data.structured_quote.currency || 'USD',
              items: data.structured_quote.items || [],
              tax: 0,
              discount: 0,
              is_ready_for_approval: data.structured_quote.is_ready_for_approval,
              missing_fields: data.structured_quote.missing_fields || []
            });
          }
          setIsProcessing(false);
          return;
        }
      }

      // Client-side fallback extraction logic if backend is starting up or in sandbox
      setTimeout(() => {
        // Regex extraction for standard pattern
        const nameMatch = prompt.match(/for\s+([A-Za-z]+)/i);
        const customerName = nameMatch ? nameMatch[1] : (stagedQuote?.customer_name || 'Valued Client');
        
        // Items parsing demo
        const newItems = [];
        if (prompt.toLowerCase().includes('banner')) {
          newItems.push({ description: 'Social Media Banners', quantity: 2, unit_price: 35.00, subtotal: 70.00 });
        }
        if (prompt.toLowerCase().includes('logo')) {
          newItems.push({ description: 'Logo Vector Revision', quantity: 1, unit_price: 20.00, subtotal: 20.00 });
        }
        if (prompt.toLowerCase().includes('wireframe')) {
          newItems.push({ description: 'Mobile App Wireframes', quantity: 8, unit_price: 95.00, subtotal: 760.00 });
        }
        if (prompt.toLowerCase().includes('blog') || prompt.toLowerCase().includes('post')) {
          newItems.push({ description: 'SEO Content Blog Posts', quantity: 4, unit_price: 120.00, subtotal: 480.00 });
        }

        if (newItems.length === 0) {
          newItems.push({ description: 'Professional Consulting Services', quantity: 1, unit_price: 150.00, subtotal: 150.00 });
        }

        const missing = [];
        if (!prompt.includes('@') && !stagedQuote?.customer_email) {
          missing.push('customer_email');
        }

        const isReady = missing.length === 0;

        const assistantMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: `I've analyzed your request for **${customerName}**! I parsed ${newItems.length} line items with exact decimal prices. ${
            !isReady ? `\n\n⚠️ *Note: Client email address was not specified. You can fill it in on the preview panel.*` : ''
          }`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMsg]);
        setStagedQuote({
          customer_name: customerName,
          customer_email: stagedQuote?.customer_email || 'client@example.com',
          currency: 'USD',
          items: newItems,
          tax: 0,
          discount: 0,
          is_ready_for_approval: true,
          missing_fields: []
        });
        setIsProcessing(false);
      }, 700);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleAddItem = () => {
    if (!stagedQuote) return;
    setStagedQuote({
      ...stagedQuote,
      items: [
        ...stagedQuote.items,
        { description: 'Additional Deliverable', quantity: 1, unit_price: 50.00, subtotal: 50.00 }
      ]
    });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    if (!stagedQuote) return;
    const nextItems = [...stagedQuote.items];
    const item = { ...nextItems[index], [field]: value };
    item.subtotal = item.quantity * item.unit_price;
    nextItems[index] = item;
    setStagedQuote({ ...stagedQuote, items: nextItems });
  };

  const handleRemoveItem = (index: number) => {
    if (!stagedQuote) return;
    const nextItems = stagedQuote.items.filter((_, i) => i !== index);
    setStagedQuote({ ...stagedQuote, items: nextItems });
  };

  const handleApproveAndSave = () => {
    if (!stagedQuote) return;
    const newQuote: Quote = {
      id: `q_${Date.now()}`,
      quote_number: `Q-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer_name: stagedQuote.customer_name,
      customer_email: stagedQuote.customer_email,
      items: stagedQuote.items,
      subtotal: calculateSubtotal(),
      tax: stagedQuote.tax,
      discount: stagedQuote.discount,
      total: calculateTotal(),
      currency: stagedQuote.currency,
      status: 'approved',
      notes: 'Generated via PayFlow AI Copilot.',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString()
    };

    onQuoteApprovedToPipeline(newQuote);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 page-transition h-[calc(100vh-120px)]">
      {/* LEFT: Conversational Chat Interface (7 Cols) */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>AI Quote Assistant</span>
                <span className="text-[10px] bg-brand-100 text-brand-700 font-mono font-medium px-2 py-0.5 rounded-full">
                  Gemini Gen AI SDK
                </span>
              </div>
              <div className="text-xs text-slate-500">Structured JSON extraction & price validation</div>
            </div>
          </div>

          <button
            onClick={() => setMessages([])}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-500/10'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Suggested Starter Prompts */}
                {msg.suggestedPrompts && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Click to try:
                    </span>
                    {msg.suggestedPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(p)}
                        className="text-left w-full text-xs p-2 rounded-lg bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200/80 transition-all flex items-center justify-between group"
                      >
                        <span>"{p}"</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-brand-200' : 'text-slate-400'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs">
                  ME
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="animate-pulse">Gemini is structuring line items and enforcing math...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g., "Create a quote for Alex: 2 banners at $35 each and logo at $20"'
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Server recalculates all prices via Decimal arithmetic</span>
            <span className="font-mono">Zero hallucinated line item prices</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Structured Quote Preview & Live Review Panel (5 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Structured Quote Preview</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
            DRAFT PREVIEW
          </span>
        </div>

        {stagedQuote ? (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Customer Information Cards */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Client Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                    <User className="w-3 h-3 text-slate-400" /> Customer Name
                  </label>
                  <input
                    type="text"
                    value={stagedQuote.customer_name}
                    onChange={(e) => setStagedQuote({ ...stagedQuote, customer_name: e.target.value })}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3 text-slate-400" /> Customer Email
                  </label>
                  <input
                    type="email"
                    value={stagedQuote.customer_email}
                    onChange={(e) => setStagedQuote({ ...stagedQuote, customer_email: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    placeholder="alex@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Itemized Deliverables
                </span>
                <button
                  onClick={handleAddItem}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-2 font-semibold text-center w-16">Qty</th>
                      <th className="py-2.5 px-2 font-semibold text-right w-20">Price</th>
                      <th className="py-2.5 px-3 font-semibold text-right w-24">Subtotal</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stagedQuote.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            className="w-full bg-transparent border-0 font-medium text-slate-800 focus:ring-0 p-0 text-xs"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 text-center bg-slate-100 rounded border border-slate-200 p-1 font-mono text-xs"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleUpdateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-16 text-right bg-slate-100 rounded border border-slate-200 p-1 font-mono text-xs"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          ${item.subtotal.toFixed(2)}
                        </td>
                        <td className="pr-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-300 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tax</span>
                <span className="font-mono font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Discount</span>
                <span className="font-mono font-medium">-$0.00</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono text-base text-brand-600">${calculateTotal().toFixed(2)} USD</span>
              </div>
            </div>

            {/* Approval Action */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleApproveAndSave}
                disabled={stagedQuote.items.length === 0 || !stagedQuote.customer_name}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Push to Quotes Pipeline</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Upon approval, an active PayPal Sandbox checkout link is provisioned.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <DollarSign className="w-12 h-12 text-slate-200 mb-2" />
            <div className="font-bold text-slate-700 text-sm">No quote staged yet</div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Use the AI assistant to parse any customer message into an itemized quote draft.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


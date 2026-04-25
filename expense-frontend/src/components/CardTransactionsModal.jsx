import React from 'react';
import { X, History, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';
import { formatStoredDate } from '../utils';

export default function CardTransactionsModal({ card, transactions = [], onClose, darkMode }) {
  if (!card) return null;

  const cardTransactions = transactions.filter(t => 
    t.account_id === card.id || t.to_account_id === card.id
  ).sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-[#f4f6f8] border border-slate-200'}`}>
        
        <div className={`p-8 bg-gradient-to-br ${card.colorTheme} text-white relative shrink-0`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-2xl font-black tracking-tighter">{card.name}</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mt-1">Transaction History</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-all backdrop-blur-sm">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-3">
            {cardTransactions.length > 0 ? (
              cardTransactions.map((tx) => {
                let isPayment = tx.type === 'transfer' && tx.to_account_id === card.id;
                let isRefund = tx.type === 'credit';
                let isPositive = isPayment || isRefund;
                
                let textColor = isPositive ? 'text-emerald-500' : (darkMode ? 'text-white' : 'text-slate-900');
                let symbol = isPositive ? '+' : '-';
                let Icon = isPayment ? ArrowRightLeft : (isRefund ? ArrowDownLeft : ArrowUpRight);

                return (
                  <div key={tx.id} className={`flex justify-between items-center p-4 rounded-2xl transition-all ${darkMode ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-white hover:bg-slate-50 border border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className={`font-black text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{tx.title}</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider">
                          {formatStoredDate(tx.date || tx.created_at, { year: false })} • {tx.category}
                        </p>
                      </div>
                    </div>
                    <p className={`font-black text-lg tracking-tight ${textColor}`}>
                      {symbol}₹{tx.amount.toLocaleString()}
                    </p>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 opacity-50">
                <History size={32} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold text-sm">No history found for this card.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
